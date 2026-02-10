const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Connexion MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// 🔹 Récupérer tous les étudiants
router.get('/etudiants', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM etudiants');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// 🔹 Ajouter un étudiant
router.post('/etudiants', async (req, res) => {
  try {
    const { uid, matricule, nom, prenom, age, sexe, classe } = req.body;
    const sql = `INSERT INTO etudiants (uid, matricule, nom, prenom, age, sexe, classe)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    await pool.query(sql, [uid, matricule, nom, prenom, age, sexe, classe]);
    res.json({ message: '✅ Étudiant ajouté avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur d’ajout' });
  }
});

module.exports = router;
