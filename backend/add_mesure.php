<?php
require_once 'config/database.php';

// Headers CORS
header('Content-Type: text/html; charset=UTF-8');
header('Access-Control-Allow-Origin: http://localhost:5174');
header('Access-Control-Allow-Credentials: true');

// Fonction pour traiter l'ajout de mesure
function ajouterMesure($db) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit'])) {
        try {
            // Récupérer les données du formulaire
            $id_utilisateur = (int)$_POST['id_utilisateur'];
            $temperature = floatval($_POST['temperature']);
            $rythme_cardiaque = intval($_POST['rythme_cardiaque']);
            $poids = floatval($_POST['poids']);
            $spo2 = intval($_POST['spo2']);

            // ⭐⭐ RÉCUPÉRER LES DONNÉES OCULAIRES (ESP32)
            $oeil_gauche = isset($_POST['oeil_gauche']) ? htmlspecialchars(trim($_POST['oeil_gauche'])) : '';
            $oeil_gauche_conf = isset($_POST['oeil_gauche_conf']) ? floatval($_POST['oeil_gauche_conf']) : 0.0;
            $oeil_droit = isset($_POST['oeil_droit']) ? htmlspecialchars(trim($_POST['oeil_droit'])) : '';
            $oeil_droit_conf = isset($_POST['oeil_droit_conf']) ? floatval($_POST['oeil_droit_conf']) : 0.0;
            $alerte = isset($_POST['alerte']) ? intval($_POST['alerte']) : 0;

            // Validation des valeurs
            $erreurs = [];
            
            if ($id_utilisateur <= 0) {
                $erreurs[] = "ID utilisateur invalide";
            }
            if ($temperature < 30 || $temperature > 45) {
                $erreurs[] = "Température doit être entre 30°C et 45°C";
            }
            if ($rythme_cardiaque < 30 || $rythme_cardiaque > 200) {
                $erreurs[] = "Rythme cardiaque doit être entre 30 et 200 bpm";
            }
            if ($poids < 20 || $poids > 200) {
                $erreurs[] = "Poids doit être entre 20kg et 200kg";
            }
            if ($spo2 < 70 || $spo2 > 100) {
                $erreurs[] = "SpO2 doit être entre 70% et 100%";
            }

            if (!empty($erreurs)) {
                return [
                    'success' => false,
                    'message' => 'Erreurs de validation',
                    'erreurs' => $erreurs
                ];
            }

            // Calculer le statut
            $statut = 'normal';
            if ($temperature > 40 || $rythme_cardiaque > 100 || $spo2 < 90) {
                $statut = 'critique';
            } elseif (($temperature >= 38 && $temperature <= 40) || 
                     $temperature < 37 || 
                     $rythme_cardiaque < 50 || 
                     ($spo2 >= 90 && $spo2 < 95)) {
                $statut = 'alerte';
            }

            // ⭐⭐ INSERTION AVEC DONNÉES OCULAIRES
            $query = "INSERT INTO mesure 
                      (id_utilisateur, temperature, rythme_cardiaque, poids, spo2, statut, date_mesure, 
                       oeil_gauche, oeil_gauche_confiance, oeil_droit, oeil_droit_confiance, alerte_oculaire) 
                      VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)";
            
            $stmt = $db->prepare($query);
            $result = $stmt->execute([
                $id_utilisateur, 
                $temperature, 
                $rythme_cardiaque, 
                $poids, 
                $spo2, 
                $statut,
                $oeil_gauche,
                $oeil_gauche_conf,
                $oeil_droit,
                $oeil_droit_conf,
                $alerte
            ]);

            if ($result) {
                return [
                    'success' => true,
                    'message' => 'Mesure ajoutée avec succès!',
                    'statut' => $statut,
                    'id_mesure' => $db->lastInsertId(),
                    'données_oculaires' => [
                        'oeil_gauche' => $oeil_gauche,
                        'oeil_gauche_conf' => $oeil_gauche_conf,
                        'oeil_droit' => $oeil_droit,
                        'oeil_droit_conf' => $oeil_droit_conf,
                        'alerte' => $alerte
                    ]
                ];
            } else {
                throw new Exception('Erreur lors de l\'insertion en base de données');
            }

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Erreur: ' . $e->getMessage()
            ];
        }
    }
    return null;
}

// Traitement du formulaire
$resultat = null;
try {
    $database = new Database();
    $db = $database->getConnection();
    $resultat = ajouterMesure($db);
} catch (Exception $e) {
    $resultat = [
        'success' => false,
        'message' => 'Erreur de connexion à la base de données: ' . $e->getMessage()
    ];
}

// Si le client demande une réponse JSON (ex: Arduino), renvoyer le résultat en JSON
if (isset($_GET['json']) && ($_GET['json'] === '1' || strtolower($_GET['json']) === 'true')) {
    header('Content-Type: application/json; charset=UTF-8');
    // Si aucune action POST n'a eu lieu, $resultat peut être null
    if ($resultat === null) {
        echo json_encode([
            'success' => false,
            'message' => 'Aucune donnée reçue'
        ]);
    } else {
        echo json_encode($resultat);
    }
    exit; // Ne pas afficher la page HTML
}

// Récupérer la liste des patients pour le select
$patients = [];
try {
    if (isset($db)) {
        $query = "SELECT id_utilisateur, nom, prenom FROM utilisateur ORDER BY nom, prenom";
        $stmt = $db->query($query);
        $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
} catch (Exception $e) {
    // Ignorer l'erreur pour l'affichage des patients
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ajouter une Mesure Médicale</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-2xl mx-auto">
            <!-- En-tête -->
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-gray-800 mb-2">Ajouter une Mesure Médicale</h1>
                <p class="text-gray-600">Saisissez les paramètres vitaux du patient</p>
            </div>

            <!-- Messages de résultat -->
            <?php if ($resultat): ?>
                <div class="mb-6 p-4 rounded-lg <?php echo $resultat['success'] ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'; ?>">
                    <div class="font-semibold">
                        <?php echo $resultat['success'] ? '✅ Succès' : '❌ Erreur'; ?>
                    </div>
                    <div class="mt-1"><?php echo $resultat['message']; ?></div>
                    
                    <?php if ($resultat['success']): ?>
                        <div class="mt-2 text-sm">
                            <strong>Statut:</strong> 
                            <span class="<?php 
                                echo $resultat['statut'] === 'critique' ? 'text-red-600 font-bold' : 
                                    ($resultat['statut'] === 'alerte' ? 'text-orange-600 font-semibold' : 'text-green-600');
                            ?>">
                                <?php echo $resultat['statut']; ?>
                            </span>
                        </div>
                    <?php endif; ?>

                    <?php if (isset($resultat['erreurs']) && !empty($resultat['erreurs'])): ?>
                        <ul class="mt-2 text-sm list-disc list-inside">
                            <?php foreach ($resultat['erreurs'] as $erreur): ?>
                                <li><?php echo $erreur; ?></li>
                            <?php endforeach; ?>
                        </ul>
                    <?php endif; ?>
                </div>
            <?php endif; ?>

            <!-- Formulaire -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <form method="POST" action="" class="space-y-6">
                    <!-- Sélection du patient -->
                    <div>
                        <label for="id_utilisateur" class="block text-sm font-medium text-gray-700 mb-2">
                            Patient *
                        </label>
                        <select id="id_utilisateur" name="id_utilisateur" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Sélectionnez un patient</option>
                            <?php foreach ($patients as $patient): ?>
                                <option value="<?php echo $patient['id_utilisateur']; ?>">
                                    <?php echo htmlspecialchars($patient['nom'] . ' ' . $patient['prenom']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <!-- Température -->
                    <div>
                        <label for="temperature" class="block text-sm font-medium text-gray-700 mb-2">
                            Température (°C) *
                        </label>
                        <input type="number" id="temperature" name="temperature" step="0.1" min="30" max="45" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                               placeholder="ex: 37.2">
                        <p class="text-xs text-gray-500 mt-1">Valeur entre 30°C et 45°C</p>
                    </div>

                    <!-- Rythme cardiaque -->
                    <div>
                        <label for="rythme_cardiaque" class="block text-sm font-medium text-gray-700 mb-2">
                            Rythme Cardiaque (bpm) *
                        </label>
                        <input type="number" id="rythme_cardiaque" name="rythme_cardiaque" min="30" max="200" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                               placeholder="ex: 75">
                        <p class="text-xs text-gray-500 mt-1">Valeur entre 30 et 200 bpm</p>
                    </div>

                    <!-- SpO2 -->
                    <div>
                        <label for="spo2" class="block text-sm font-medium text-gray-700 mb-2">
                            Saturation en Oxygène (SpO2) % *
                        </label>
                        <input type="number" id="spo2" name="spo2" min="70" max="100" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                               placeholder="ex: 98">
                        <p class="text-xs text-gray-500 mt-1">Valeur entre 70% et 100%</p>
                    </div>

                    <!-- Poids -->
                    <div>
                        <label for="poids" class="block text-sm font-medium text-gray-700 mb-2">
                            Poids (kg) *
                        </label>
                        <input type="number" id="poids" name="poids" step="0.1" min="20" max="200" required
                               class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                               placeholder="ex: 70.5">
                        <p class="text-xs text-gray-500 mt-1">Valeur entre 20kg et 200kg</p>
                    </div>

                    <!-- Boutons -->
                    <div class="flex space-x-4 pt-4">
                        <button type="submit" name="submit"
                                class="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors">
                            📊 Ajouter la Mesure
                        </button>
                        <button type="reset"
                                class="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium transition-colors">
                            🔄 Réinitialiser
                        </button>
                    </div>
                </form>
            </div>

            <!-- Légende des statuts -->
            <div class="mt-8 bg-gray-100 rounded-lg p-4">
                <h3 class="font-semibold text-gray-800 mb-3">📋 Légende des Statuts</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div class="flex items-center">
                        <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span><strong>Normal:</strong> Tous les paramètres dans les normes</span>
                    </div>
                    <div class="flex items-center">
                        <div class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        <span><strong>Alerte:</strong> Température 38-40°C ou &lt;37°C, Rythme &lt;50 bpm, SpO2 90-95%</span>
                    </div>
                    <div class="flex items-center">
                        <div class="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        <span><strong>Critique:</strong> Température &gt;40°C, Rythme &gt;100 bpm, SpO2 &lt;90%</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>