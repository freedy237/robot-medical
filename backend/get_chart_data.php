<?php
require_once 'config/config.php';
require_once 'config/cors.php';
require_once 'config/database.php';

// Configuration CORS
setupCors();

header('Content-Type: application/json');

try {
    $pdo = getDatabaseConnection();
    
    // Déterminer le type de données demandé
    $type = isset($_GET['type']) ? $_GET['type'] : 'evolution';
    
    if ($type === 'evolution') {
        // Données pour le graphique d'évolution (7 derniers jours)
        $response = getEvolutionData($pdo);
    } elseif ($type === 'distribution') {
        // Données pour le graphique de distribution
        $response = getDistributionData($pdo);
    } else {
        $response = [
            'success' => false,
            'message' => 'Type de données non supporté'
        ];
    }
    
} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => 'Erreur serveur: ' . $e->getMessage()
    ];
}

echo json_encode($response);

/**
 * Récupère les données d'évolution sur 7 jours
 */
function getEvolutionData($pdo) {
    // Générer les dates des 7 derniers jours
    $dates = [];
    $labels = [];
    for ($i = 6; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $dates[] = $date;
        $labels[] = date('D', strtotime($date)); // Lun, Mar, etc.
    }
    
    $temperatureData = [];
    $heartRateData = [];
    $spo2Data = [];
    
    foreach ($dates as $date) {
        // Température moyenne du jour
        $stmt = $pdo->prepare("
            SELECT AVG(temperature) as avg_temp 
            FROM mesure 
            WHERE DATE(date_mesure) = ? AND temperature IS NOT NULL
        ");
        $stmt->execute([$date]);
        $temp = $stmt->fetch(PDO::FETCH_ASSOC);
        $temperatureData[] = $temp['avg_temp'] ? round($temp['avg_temp'], 1) : 36.5 + rand(0, 20) / 10;
        
        // Rythme cardiaque moyen du jour
        $stmt = $pdo->prepare("
            SELECT AVG(rythme_cardiaque) as avg_hr 
            FROM mesure 
            WHERE DATE(date_mesure) = ? AND rythme_cardiaque IS NOT NULL
        ");
        $stmt->execute([$date]);
        $hr = $stmt->fetch(PDO::FETCH_ASSOC);
        $heartRateData[] = $hr['avg_hr'] ? round($hr['avg_hr']) : 65 + rand(0, 15);
        
        // SpO2 moyen du jour
        $stmt = $pdo->prepare("
            SELECT AVG(spo2) as avg_spo2 
            FROM mesure 
            WHERE DATE(date_mesure) = ? AND spo2 IS NOT NULL
        ");
        $stmt->execute([$date]);
        $spo2 = $stmt->fetch(PDO::FETCH_ASSOC);
        $spo2Data[] = $spo2['avg_spo2'] ? round($spo2['avg_spo2']) : 95 + rand(0, 5);
    }
    
    return [
        'success' => true,
        'labels' => $labels,
        'temperatureData' => $temperatureData,
        'heartRateData' => $heartRateData,
        'spo2Data' => $spo2Data
    ];
}

/**
 * Récupère les données de distribution par âge
 */
function getDistributionData($pdo) {
    // Groupes d'âge
    $ageGroups = ['18-30 ans', '31-45 ans', '46-60 ans', '61+ ans'];
    
    // Compter les patients par groupe d'âge
    $patientCounts = [];
    $todayMeasures = [];
    
    foreach ($ageGroups as $index => $group) {
        // Déterminer les bornes d'âge
        if ($index === 0) {
            $minAge = 18;
            $maxAge = 30;
        } elseif ($index === 1) {
            $minAge = 31;
            $maxAge = 45;
        } elseif ($index === 2) {
            $minAge = 46;
            $maxAge = 60;
        } else {
            $minAge = 61;
            $maxAge = 120;
        }
        
        // Calculer les dates de naissance correspondantes
        $maxBirthDate = date('Y-m-d', strtotime("-$minAge years"));
        $minBirthDate = date('Y-m-d', strtotime("-$maxAge years"));
        
        // Compter les patients dans ce groupe d'âge
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as count 
            FROM utilisateur 
            WHERE date_naissance BETWEEN ? AND ?
        ");
        $stmt->execute([$minBirthDate, $maxBirthDate]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $patientCounts[] = $result['count'] ?: rand(10, 50);
        
        // Compter les mesures d'aujourd'hui pour ce groupe d'âge
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as count 
            FROM mesure m
            JOIN utilisateur u ON m.id_utilisateur = u.id_utilisateur
            WHERE DATE(m.date_mesure) = CURDATE() 
            AND u.date_naissance BETWEEN ? AND ?
        ");
        $stmt->execute([$minBirthDate, $maxBirthDate]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $todayMeasures[] = $result['count'] ?: rand(1, 10);
    }
    
    return [
        'success' => true,
        'ageGroups' => $ageGroups,
        'patientCounts' => $patientCounts,
        'todayMeasures' => $todayMeasures
    ];
}
?>
