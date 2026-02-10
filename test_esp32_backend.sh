#!/bin/bash
# 🧪 TESTS COMPLETS ESP32 ↔ BACKEND

echo "═══════════════════════════════════════════════════════════"
echo "🧪 TEST 1: Recherche étudiant par RFID"
echo "═══════════════════════════════════════════════════════════"
curl -s -X POST "http://localhost:8000/backend/api_arduino.php?action=rechercher_etudiant" \
  -H "Content-Type: application/json" \
  -d '{"uid_rfid":"RFID001"}' | python3 -m json.tool

echo -e "\n═══════════════════════════════════════════════════════════"
echo "🧪 TEST 2: Envoi mesures SANS anomalie"
echo "═══════════════════════════════════════════════════════════"
curl -s -X POST "http://localhost:8000/backend/add_mesure.php?json=1" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "id_utilisateur=1&temperature=37.5&rythme_cardiaque=75&spo2=98&poids=70&oeil_gauche=Sain&oeil_gauche_conf=0.95&oeil_droit=Sain&oeil_droit_conf=0.93&alerte=0&submit=1" | python3 -m json.tool

echo -e "\n═══════════════════════════════════════════════════════════"
echo "🧪 TEST 3: Envoi mesures AVEC anomalie (Cataracte)"
echo "═══════════════════════════════════════════════════════════"
curl -s -X POST "http://localhost:8000/backend/add_mesure.php?json=1" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "id_utilisateur=2&temperature=37.8&rythme_cardiaque=82&spo2=95&poids=65&oeil_gauche=Cataracte&oeil_gauche_conf=0.87&oeil_droit=Sain&oeil_droit_conf=0.92&alerte=1&submit=1" | python3 -m json.tool

echo -e "\n═══════════════════════════════════════════════════════════"
echo "🧪 TEST 4: Vérification BD - Dernières mesures"
echo "═══════════════════════════════════════════════════════════"
mysql -u dark-linux robot_medical -e "SELECT id_mesure, id_utilisateur, temperature, rythme_cardiaque, oeil_gauche, alerte_oculaire FROM mesure ORDER BY id_mesure DESC LIMIT 5;" 2>/dev/null

echo -e "\n═══════════════════════════════════════════════════════════"
echo "✅ TESTS COMPLÉTÉS"
echo "═══════════════════════════════════════════════════════════"
