# 🔄 SYNCHRONISATION ESP32 ↔ BACKEND

## 📋 Tableau de Correspondance Exacte

### Champs Biométriques (Identiques ESP32 ↔ Backend)

| Champ | ESP32 Envoie | Backend Reçoit | Base de Données | Type | Exemple |
|-------|---|---|---|---|---|
| **ID Utilisateur** | `id_utilisateur` | `$_POST['id_utilisateur']` | `id_utilisateur` | INT | `2` |
| **Température** | `temperature` | `$_POST['temperature']` | `temperature` | FLOAT | `36.9` |
| **Rythme Cardiaque** | `rythme_cardiaque` | `$_POST['rythme_cardiaque']` | `rythme_cardiaque` | INT | `75` |
| **Poids** | `poids` | `$_POST['poids']` | `poids` | FLOAT | `62.8` |
| **SpO2** | `spo2` | `$_POST['spo2']` | `spo2` | INT | `97` |

---

### ⭐ Champs Oculaires (SYNCHRONISATION CRITIQUE)

| Champ | ESP32 Envoie | Backend Reçoit | Base de Données | ✅ Status | Exemple |
|-------|---|---|---|---|---|
| **Diagnostic Œil Gauche** | `oeil_gauche` | `$_POST['oeil_gauche']` | `oeil_gauche` | ✅ OK | `"Myopie"` |
| **Confiance OG** | `oeil_gauche_confiance` | `$_POST['oeil_gauche_confiance']` | `oeil_gauche_confiance` | ✅ CORRIGÉ | `0.92` |
| **Diagnostic Œil Droit** | `oeil_droit` | `$_POST['oeil_droit']` | `oeil_droit` | ✅ OK | `"Sain"` |
| **Confiance OD** | `oeil_droit_confiance` | `$_POST['oeil_droit_confiance']` | `oeil_droit_confiance` | ✅ CORRIGÉ | `0.95` |
| **Alerte Oculaire** | `alerte_oculaire` | `$_POST['alerte_oculaire']` | `alerte_oculaire` | ✅ OK | `1` |
| **Photo Chemin** | `photo_path` | `$_POST['photo_path']` | `photo_path` | ✅ OK | `null` |

---

## 🔧 Code ESP32 - Fonction envoyerMesuresServeur()

### Version CORRIGÉE ✅

```cpp
bool envoyerMesuresServeur(const char* uid, const char* nom, const char* prenom,
                           const char* classe, int bpm, int spo2, float temp, float poids,
                           const char* oeil_gauche = "", float oeil_gauche_conf = 0.0,
                           const char* oeil_droit = "", float oeil_droit_conf = 0.0, int alerte = 0) {
  
  HTTPClient http;
  String url = ADD_MESURE_URL + "?json=1";
  http.begin(url);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");

  // Construire les données POST
  String postData = "id_utilisateur=" + String(etudActuel.id);
  postData += "&temperature=" + String(temp, 1);
  postData += "&rythme_cardiaque=" + String(bpm);
  postData += "&poids=" + String(poids, 1);
  postData += "&spo2=" + String(spo2);
  
  // ✅ DONNÉES OCULAIRES - NOMS CORRECTS
  if (strlen(oeil_gauche) > 0) {
    postData += "&oeil_gauche=" + String(oeil_gauche);
    postData += "&oeil_gauche_confiance=" + String(oeil_gauche_conf, 3);  // ✅ CLÉS: oeil_gauche_confiance
  }
  if (strlen(oeil_droit) > 0) {
    postData += "&oeil_droit=" + String(oeil_droit);
    postData += "&oeil_droit_confiance=" + String(oeil_droit_conf, 3);    // ✅ CLÉS: oeil_droit_confiance
  }
  postData += "&alerte_oculaire=" + String(alerte);
  postData += "&submit=1";

  Serial.println("[SERVER] 📤 Données POST: " + postData);
  
  int code = http.POST(postData);
  
  // ... reste du code
}
```

### Exemple de POST Généré

```
POST /backend/add_mesure_api.php?json=1 HTTP/1.1
Host: 192.168.43.97:8000
Content-Type: application/x-www-form-urlencoded

id_utilisateur=2&temperature=36.9&rythme_cardiaque=75&poids=62.8&spo2=97&oeil_gauche=Myopie&oeil_gauche_confiance=0.92&oeil_droit=Sain&oeil_droit_confiance=0.95&alerte_oculaire=1&submit=1
```

---

## 📥 Backend PHP - Réception des Données

### Fichier: `/backend/add_mesure_api.php`

```php
<?php
// Réception des données
$id_utilisateur = isset($_POST['id_utilisateur']) ? intval($_POST['id_utilisateur']) : null;
$temperature = isset($_POST['temperature']) ? floatval($_POST['temperature']) : null;
$rythme_cardiaque = isset($_POST['rythme_cardiaque']) ? intval($_POST['rythme_cardiaque']) : null;
$poids = isset($_POST['poids']) ? floatval($_POST['poids']) : null;
$spo2 = isset($_POST['spo2']) ? intval($_POST['spo2']) : null;

// ✅ DONNÉES OCULAIRES
$oeil_gauche = isset($_POST['oeil_gauche']) ? htmlspecialchars(trim($_POST['oeil_gauche'])) : null;
$oeil_gauche_confiance = isset($_POST['oeil_gauche_confiance']) ? floatval($_POST['oeil_gauche_confiance']) : null;
$oeil_droit = isset($_POST['oeil_droit']) ? htmlspecialchars(trim($_POST['oeil_droit'])) : null;
$oeil_droit_confiance = isset($_POST['oeil_droit_confiance']) ? floatval($_POST['oeil_droit_confiance']) : null;
$alerte_oculaire = isset($_POST['alerte_oculaire']) ? intval($_POST['alerte_oculaire']) : 0;
$photo_path = isset($_POST['photo_path']) ? htmlspecialchars(trim($_POST['photo_path'])) : null;

// Insertion en base
$sql = "INSERT INTO mesure (
  id_utilisateur, temperature, rythme_cardiaque, poids, spo2,
  oeil_gauche, oeil_gauche_confiance, oeil_droit, oeil_droit_confiance,
  alerte_oculaire, photo_path, date_mesure, statut
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'normal')";

$stmt = $db->prepare($sql);
$stmt->execute([
  $id_utilisateur, $temperature, $rythme_cardiaque, $poids, $spo2,
  $oeil_gauche, $oeil_gauche_confiance, $oeil_droit, $oeil_droit_confiance,
  $alerte_oculaire, $photo_path
]);
```

---

## 🗄️ Base de Données - Structure TABLE

### Schema: `mesure`

```sql
CREATE TABLE mesure (
  id_mesure INT AUTO_INCREMENT PRIMARY KEY,
  id_utilisateur INT NOT NULL,
  
  -- Biométrie
  temperature FLOAT,
  rythme_cardiaque INT,
  poids FLOAT,
  spo2 INT,
  
  -- Oculaire
  oeil_gauche VARCHAR(100),              -- ✅ Nom exact
  oeil_gauche_confiance DECIMAL(5,4),    -- ✅ Nom exact
  oeil_droit VARCHAR(100),               -- ✅ Nom exact
  oeil_droit_confiance DECIMAL(5,4),     -- ✅ Nom exact
  alerte_oculaire TINYINT(1),            -- ✅ Nom exact
  photo_path VARCHAR(255),               -- ✅ Nom exact
  
  date_mesure TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  statut VARCHAR(20),
  
  KEY idx_alerte_oculaire (alerte_oculaire, date_mesure),
  FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur)
);
```

---

## ✅ Validation des Données

### Test CURL (Avant de flasher l'ESP32)

```bash
# Tester l'API exactement comme l'ESP32 l'appelle
curl -X POST http://192.168.43.97:8000/backend/add_mesure_api.php \
  -d "id_utilisateur=2" \
  -d "temperature=36.9" \
  -d "rythme_cardiaque=75" \
  -d "poids=62.8" \
  -d "spo2=97" \
  -d "oeil_gauche=Myopie" \
  -d "oeil_gauche_confiance=0.92" \
  -d "oeil_droit=Sain" \
  -d "oeil_droit_confiance=0.95" \
  -d "alerte_oculaire=1" \
  -d "submit=1" | python3 -m json.tool
```

**Réponse attendue ✅:**
```json
{
  "success": true,
  "message": "Mesure enregistrée",
  "id_mesure": "25",
  "timestamp": "2026-02-03 12:00:00"
}
```

---

## 🔍 Vérification en Base de Données

```bash
# Vérifier les colonnes oculaires
mysql -u dark-linux robot_medical -e "
SELECT id_mesure, id_utilisateur, oeil_gauche, oeil_gauche_confiance, 
       oeil_droit, oeil_droit_confiance, alerte_oculaire 
FROM mesure ORDER BY id_mesure DESC LIMIT 3;
"
```

---

## 📊 Retrieval APIs

### get_anomalies.php

Doit retourner les données avec les NOMS CORRECTS:

```json
{
  "success": true,
  "anomalies": [
    {
      "id_mesure": 25,
      "oeil_gauche": "Myopie",
      "oeil_gauche_confiance": 0.92,
      "oeil_droit": "Sain",
      "oeil_droit_confiance": 0.95,
      "alerte_oculaire": 1
    }
  ]
}
```

### get_statistiques_oculaires.php

Doit aggréger correctement:

```json
{
  "success": true,
  "statistiques": {
    "total_anomalies": 3,
    "avg_confidence": {
      "left_eye": 0.91333333,
      "right_eye": 0.89666667
    }
  }
}
```

---

## 🚀 Checklist de Déploiement

- [ ] Corriger ESP32 ligne ~1095 (oeil_gauche_confiance)
- [ ] Corriger ESP32 ligne ~1096 (oeil_droit_confiance)
- [ ] Compiler et flasher l'ESP32
- [ ] Tester avec CURL: `curl http://192.168.43.97:8000/backend/add_mesure_api.php -d "..."` 
- [ ] Vérifier en base: `SELECT oeil_gauche_confiance FROM mesure;`
- [ ] Tester get_anomalies.php: `curl http://192.168.43.97:8000/backend/get_anomalies.php`
- [ ] Vérifier le frontend affiche les données correctement
- [ ] ✅ SYNCHRONISATION COMPLÈTE

---

## 📝 Résumé des Corrections

| Problème | Avant | Après | Fichier |
|----------|-------|-------|---------|
| Champ confiance OG | `oeil_gauche_conf` | `oeil_gauche_confiance` | esp32-main.ino |
| Champ confiance OD | `oeil_droit_conf` | `oeil_droit_confiance` | esp32-main.ino |
| Backend reçoit | ❌ Champs mal nommés | ✅ Noms corrects | add_mesure_api.php |
| Base de données | ❌ Colonnes vides | ✅ Données complètes | robot_medical.sql |
| Frontend affiche | ❌ Pas de données | ✅ Affiche confiance | dashboard.jsx |
| APIs retrieval | ❌ Données incomplètes | ✅ Données correctes | get_anomalies.php |

---

## 🎯 Validation Finale

Après les corrections, le flux complet fonctionne:

```
ESP32 envoie
  ↓
  POST: oeil_gauche_confiance=0.92, oeil_droit_confiance=0.95
  ↓
Backend reçoit
  ↓
  $_POST['oeil_gauche_confiance']=0.92, $_POST['oeil_droit_confiance']=0.95
  ↓
Base de données
  ↓
  INSERT: oeil_gauche_confiance=0.92, oeil_droit_confiance=0.95
  ↓
APIs retrieval
  ↓
  SELECT: oeil_gauche_confiance, oeil_droit_confiance
  ↓
Frontend
  ↓
  ✅ Affiche confiance: 92%, 95%
```

