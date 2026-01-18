# 🤖 Robot Medical - Real-Time Medical Monitoring System

Modern web application for real-time monitoring of patient medical parameters.

## 🚀 Features

- **Real-time dashboard** with medical metrics
- **Patient management** with RFID tracking
- **Parameter monitoring** (temperature, heart rate, SpO2, weight)
- **Automatic alerts** for critical values
- **Responsive and accessible** interface
- **Secure authentication**

## 🛠️ Technologies

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend**: PHP 8+, MySQL
- **API Server**: Node.js/Express (ESP32 data collection)
- **Security**: JWT, CORS, Security Headers
- **Performance**: useReducer, useMemo, Optimized Polling

## 📋 Prerequisites

- Node.js 18+
- PHP 8.0+
- MySQL 8.0+
- Web server (Apache/Nginx)

## 🚀 Installation & Setup

### 1. Database Configuration

```bash
# Create the database
sudo mysql -e "CREATE DATABASE IF NOT EXISTS robot_medical;"

# Create the user
sudo mysql -e "CREATE USER IF NOT EXISTS 'dark-linux'@'localhost'; GRANT ALL PRIVILEGES ON robot_medical.* TO 'dark-linux'@'localhost'; FLUSH PRIVILEGES;"

# Import the schema
sudo mysql robot_medical < backend/databases/robot_medical.sql
```

### 2. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Edit configuration
nano .env
```

### 3. Frontend Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 4. Backend Configuration

```bash
# Start PHP built-in server
cd backend
php -S localhost:8000
```

Backend will be available at `http://localhost:8000`

### 5. API Server (ESP32 Data Collection)

```bash
# Navigate to API server
cd robot-api

# Install dependencies
npm install

# Start the server
npm start
```

API Server will be available at `http://localhost:3001`

### 6. Full Production Build

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend URL | `http://localhost:8000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_NAME` | Database name | `robot_medical` |
| `DB_USER` | MySQL user | `dark-linux` |
| `JWT_SECRET` | JWT secret key | (to be defined) |

### Ports Used

- **Frontend**: 5173 (development)
- **Backend**: 8000 (PHP server)
- **API Server**: 3001 (Express server)
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
