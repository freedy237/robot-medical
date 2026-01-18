<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Connexion à la base de données
$conn = new mysqli("localhost", "root", "", "robot-medical");

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erreur connexion BD"]));
}

// Récupérer les données POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id_utilisateur = $input['id_utilisateur'] ?? null;
    $poids = $input['poids'] ?? null;
    $temperature = $input['temperature'] ?? null;
    $rythme_cardiaque = $input['rythme_cardiaque'] ?? null;
    
    if ($id_utilisateur && $poids && $temperature && $rythme_cardiaque) {
        $sql = "INSERT INTO mesure (id_utilisateur, poids, temperature, rythme_cardiaque, date_mesure) 
                VALUES (?, ?, ?, ?, NOW())";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iddd", $id_utilisateur, $poids, $temperature, $rythme_cardiaque);
        
        if ($stmt->execute()) {
            echo json_encode([
                "success" => true, 
                "message" => "Mesure ajoutée avec succès",
                "id_mesure" => $conn->insert_id
            ]);
        } else {
            echo json_encode([
                "success" => false, 
                "message" => "Erreur: " . $conn->error
            ]);
        }
        
        $stmt->close();
    } else {
        echo json_encode([
            "success" => false, 
            "message" => "Données manquantes"
        ]);
    }
} else {
    echo json_encode([
        "success" => false, 
        "message" => "Méthode non autorisée"
    ]);
}

$conn->close();
?>