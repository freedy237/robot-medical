import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';

const AddPatient = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    rfid: '',
    firstName: '',
    lastName: '',
    age: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    medicalHistory: ''
  });
  const [loading, setLoading] = useState(false); // ← AJOUTÉ
  const [error, setError] = useState(''); // ← AJOUTÉ

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log(' Début de la soumission du formulaire');
    console.log(' Données du formulaire:', formData);

    try {
      const apiUrls = [
        '/api/add_patient.php',
        'http://localhost/medical-robo-dashboardt/backend/add_patient.php',
        'http://127.0.0.1/medical-robot-dashboard/backend/add_patient.php'
      ];

      let success = false;
      let lastError = 'Aucune tentative réussie';

      for (const url of apiUrls) {
        try {
          console.log(`🔄 Tentative avec: ${url}`);
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(formData)
          });

          console.log(` Réponse HTTP: ${response.status} ${response.statusText}`);
          
          // Vérifier si la réponse est JSON
          const contentType = response.headers.get('content-type');
          console.log(` Content-Type: ${contentType}`);
          
          let data;
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            const text = await response.text();
            console.log(' Réponse texte:', text);
            throw new Error(`Réponse non-JSON: ${text.substring(0, 100)}`);
          }

          console.log(' Données JSON:', data);

          if (data.success) {
            console.log(' SUCCÈS - Patient ajouté:', data);
            alert(` Patient ajouté avec succès!\nID: ${data.patient_id}\nRFID: ${data.rfid}`);
            navigate('/patients');
            success = true;
            break;
          } else {
            lastError = data.message || data.error || 'Erreur inconnue';
            console.log(` Erreur API ${url}:`, lastError);
          }

        } catch (err) {
          lastError = `${url}: ${err.message}`;
          console.log(` Erreur fetch ${url}:`, err);
        }
      }

      if (!success) {
        setError(`Impossible d'ajouter le patient: ${lastError}`);
        console.log(' Toutes les URLs ont échoué, passage en mode simulation');
        
        // Mode simulation
        if (window.confirm('L\'API ne répond pas. Voulez-vous simuler l\'ajout pour continuer les tests?')) {
          console.log('Mode simulation activé');
          alert('Mode simulation: Patient ajouté avec succès! (Données non enregistrées)');
          navigate('/patients');
        }
      }

    } catch (err) {
      const errorMsg = `Erreur inattendue: ${err.message}`;
      setError(errorMsg);
      console.error(' Erreur inattendue:', err);
    } finally {
      setLoading(false);
      console.log(' Fin de la soumission');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/patients" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft size={20} />
            <span>Retour</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Ajouter un Patient</h1>
        </div>
        <UserPlus className="text-blue-600" size={32} />
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700 font-medium">{error}</div>
        </div>
      )}

      {/* Formulaire */}
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ID RFID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID RFID *
              </label>
              <input
                type="text"
                name="rfid"
                value={formData.rfid}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: RFID001"
              />
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Prénom du patient"
              />
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom du patient"
              />
            </div>

            {/* Âge */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Âge *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="0"
                max="120"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Âge en années"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@exemple.com"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+33 1 23 45 67 89"
              />
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Adresse complète"
            />
          </div>

          {/* Contact d'urgence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact d'urgence
            </label>
            <input
              type="text"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nom et téléphone du contact"
            />
          </div>

          {/* Historique médical */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Historique Médical
            </label>
            <textarea
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Antécédents médicaux, allergies, traitements en cours..."
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              to="/patients"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              <span>{loading ? 'Enregistrement...' : 'Enregistrer le Patient'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Informations */}
      <div className="card p-6 bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Informations importantes</h3>
        <ul className="text-blue-700 space-y-1 text-sm">
          <li>• L'ID RFID doit être unique pour chaque patient</li>
          <li>• Les champs marqués d'un astérisque (*) sont obligatoires</li>
          <li>• Le patient pourra être identifié par le robot médical via sa carte RFID</li>
          <li>• Les mesures seront automatiquement associées à ce profil étudiant</li>
        </ul>
      </div>
    </div>
  );
};

export default AddPatient;