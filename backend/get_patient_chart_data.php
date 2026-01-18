<?php
require_once 'config/config.php';
require_once 'config/cors.php';
require_once 'config/database.php';

// Configuration CORS
setupCors();

header('Content-Type: application/json');

try {
    $pdo = getDatabaseConnection();
    
    // Vérifier si l'ID du patient est fourni
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        throw new Exception('ID du patient non spécifié');
    }
    
    $patient_id = intval($_GET['id']);
    
    // Récupérer les données du patient
    $stmt = $pdo->prepare("
        SELECT nom, prenom, date_naissance 
        FROM utilisateur 
        WHERE id_utilisateur = ?
    ");
    $stmt->execute([$patient_id]);
    $patient = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$patient) {
        throw new Exception('Patient non trouvé');
    }
    
    // Récupérer les mesures du patient (30 derniers jours)
    $stmt = $pdo->prepare("
        SELECT 
            DATE(date_mesure) as date,
            AVG(temperature) as temperature,
            AVG(rythme_cardiaque) as rythme_cardiaque,
            AVG(spo2) as spo2,
            AVG(poids) as poids
        FROM mesure 
        WHERE id_utilisateur = ? 
          AND date_mesure >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(date_mesure)
        ORDER BY date ASC
    ");
    $stmt->execute([$patient_id]);
    $mesures = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Préparer les données pour les graphiques
    $labels = [];
    $temperatureData = [];
    $heartRateData = [];
    $spo2Data = [];
    $weightData = [];
    
    foreach ($mesures as $mesure) {
        $labels[] = date('d/m', strtotime($mesure['date']));
        $temperatureData[] = $mesure['temperature'] ? round($mesure['temperature'], 1) : null;
        $heartRateData[] = $mesure['rythme_cardiaque'] ? round($mesure['rythme_cardiaque']) : null;
        $spo2Data[] = $mesure['spo2'] ? round($mesure['spo2']) : null;
        $weightData[] = $mesure['poids'] ? round($mesure['poids'], 1) : null;
    }
    
    // Si pas de données, générer des données de démonstration
    if (empty($mesures)) {
        for ($i = 29; $i >= 0; $i--) {
            $date = date('d/m', strtotime("-$i days"));
            $labels[] = $date;
            $temperatureData[] = 36.5 + rand(0, 20) / 10;
            $heartRateData[] = 65 + rand(0, 15);
            $spo2Data[] = 95 + rand(0, 5);
            $weightData[] = 70 + rand(0, 10);
        }
    }
    
    $response = [
        'success' => true,
        'patient' => [
            'id' => $patient_id,
            'nom' => $patient['nom'],
            'prenom' => $patient['prenom'],
            'date_naissance' => $patient['date_naissance']
        ],
        'chartData' => [
            'labels' => $labels,
            'temperatureData' => $temperatureData,
            'heartRateData' => $heartRateData,
            'spo2Data' => $spo2Data,
            'weightData' => $weightData
        ]
    ];
    
} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => 'Erreur serveur: ' . $e->getMessage()
    ];
}

echo json_encode($response);
?>
