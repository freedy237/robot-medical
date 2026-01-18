# 🤖 Robot Médical - Système de Surveillance Médicale

Application web moderne pour la surveillance des paramètres médicaux des patients en temps réel.

## 🚀 Fonctionnalités

- **Tableau de bord temps réel** avec métriques médicales
- **Gestion des patients** avec suivi RFID
- **Surveillance des paramètres** (température, rythme cardiaque, SpO2, poids)
- **Alertes automatiques** pour valeurs critiques
- **Interface responsive** et accessible
- **Authentification sécurisée**

## 🛠️ Technologies

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend**: PHP 8+, MySQL
- **Sécurité**: JWT, CORS, Headers de sécurité
- **Performance**: useReducer, useMemo, Polling optimisé

## 📋 Prérequis

- Node.js 18+
- PHP 8.0+
- MySQL 8.0+
- Serveur web (Apache/Nginx)

## 🚀 Installation et Lancement

### 1. Configuration de la Base de Données

```bash
# Créer la base de données
sudo mysql -e "CREATE DATABASE IF NOT EXISTS robot_medical;"

# Créer l'utilisateur (déjà fait)
sudo mysql -e "CREATE USER IF NOT EXISTS 'dark-linux'@'localhost'; GRANT ALL PRIVILEGES ON robot_medical.* TO 'dark-linux'@'localhost'; FLUSH PRIVILEGES;"

# Importer le schéma
sudo mysql robot_medical < backend/databases/robot_medical.sql
```

### 2. Configuration de l'Environnement

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Modifier les variables selon votre configuration
nano .env
```

### 3. Installation du Frontend

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le frontend sera disponible sur `http://localhost:5173`

### 4. Configuration du Backend

```bash
# Démarrer le serveur PHP intégré
cd backend
php -S localhost:8000
```

Le backend sera disponible sur `http://localhost:8000`

### 5. Lancement Complet (Production)

```bash
# Build de l'application
npm run build

# Servir les fichiers statiques
npm run preview
```

## 🔧 Configuration

### Variables d'Environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `VITE_API_BASE_URL` | URL du backend | `http://localhost:8000` |
| `DB_HOST` | Hôte MySQL | `localhost` |
| `DB_NAME` | Nom de la base | `robot_medical` |
| `DB_USER` | Utilisateur MySQL | `dark-linux` |
| `JWT_SECRET` | Clé secrète JWT | (à définir) |

### Ports Utilisés

- **Frontend**: 5173 (développement)
- **Backend**: 8000 (serveur PHP)
- **Base de données**: 3306 (MySQL)

## 🎯 Utilisation

1. **Connexion**: Accédez à `http://localhost:5173`
2. **Tableau de bord**: Visualisez les métriques en temps réel
3. **Patients**: Gérez la liste des patients
4. **Mesures**: Consultez les mesures médicales
5. **Alertes**: Surveillez les valeurs critiques

## 🔒 Sécurité

- Authentification JWT
- Headers de sécurité CORS
- Validation des données
- Protection contre les injections SQL
- Rate limiting (à implémenter)

## 📱 Responsive Design

L'application est optimisée pour:
- **Desktop** (1024px+)
- **Tablette** (768px - 1023px)
- **Mobile** (< 768px)

## 🐛 Dépannage

### Problèmes Courants

1. **Erreur CORS**
   - Vérifier que le backend écoute sur le bon port
   - Confirmer les headers CORS dans `backend/config/cors.php`

2. **Connexion MySQL échoue**
   - Vérifier que l'utilisateur `dark-linux` existe
   - Confirmer les permissions sur la base `robot_medical`

3. **Frontend ne se charge pas**
   - Vérifier que Node.js 18+ est installé
   - Exécuter `npm install` pour installer les dépendances

### Logs

- **Frontend**: Console du navigateur
- **Backend**: Fichier défini dans `LOG_FILE`
- **Base de données**: Logs MySQL

## 📊 Monitoring

L'application inclut:
- Métriques de performance
- Logs structurés
- Alertes automatiques
- Squelettes de chargement

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème:
1. Consulter la documentation
2. Vérifier les logs d'erreur
3. Ouvrir une issue sur GitHub

---

**Développé avec ❤️ pour la surveillance médicale moderne**
