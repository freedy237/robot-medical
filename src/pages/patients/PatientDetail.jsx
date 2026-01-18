import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Download, Mail, Activity, Heart, Thermometer, Scale } from 'lucide-react';
import DynamicPatientChart from '../../components/charts/dynamic-patient-chart';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState(null);
  const [lastMeasurement, setLastMeasurement] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  // Charger les données du patient
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        
        const apiUrls = [
          `/api/get_patients_details.php?id=${id}`,
          `http://localhost/medical-robot-dashboard/backend/get_patients_details.php?id=${id}`,
          `http://127.0.0.1/medical-robot-dashboard/backend/get_patients_details.php?id=${id}`
        ];

        let success = false;

        for (const url of apiUrls) {
          try {
            console.log(`🔄 Chargement des données via: ${url}`);
            
            const response = await fetch(url);
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.success) {
                setPatient(data.patient);
                setLastMeasurement(data.lastMeasurement);
                setMeasurements(data.measurements);
                setError('');
                success = true;
                console.log('✅ Données chargées avec succès');
                break;
              } else {
                setError(data.message || 'Erreur de chargement');
              }
            }
          } catch (err) {
            console.log(`❌ Erreur avec ${url}:`, err.message);
          }
        }

        if (!success) {
          setError('Impossible de charger les données du patient');
          // Mode démonstration
          setPatient({
            id: id,
            rfid: `RFID${id}`,
            firstName: 'Jean',
            lastName: 'Dupont',
            age: 45,
            email: 'jean.dupont@email.com',
            phone: '+33 1 23 45 67 89',
            address: '123 Avenue des Champs, Paris 75008',
            emergencyContact: 'Marie Dupont - +33 6 12 34 56 78'
          });
          setLastMeasurement({
            temp: 36.8,
            heartRate: 72,
            spo2: 97,
            weight: 75.2,
            date: '2024-01-15 10:23:00',
            status: 'normal'
          });
          setMeasurements([
            { date: '2024-01-15 10:23:00', temp: 36.8, heartRate: 72, spo2: 97, weight: 75.2, status: 'normal' },
            { date: '2024-01-14 09:15:00', temp: 36.7, heartRate: 70, spo2: 98, weight: 75.1, status: 'normal' },
          ]);
        }

      } catch (err) {
        setError('Erreur inattendue: ' + err.message);
        console.error('💥 Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPatientData();
    }
  }, [id]);

  // Fonctions d'exportation (gardées de votre code original)
  const handleExport = async (format = 'csv') => {
    setExportLoading(true);
    
    try {
      if (!patient) return;

      const exportData = {
        patient: {
          id: patient.id,
          rfid: patient.rfid,
          nom: patient.lastName,
          prenom: patient.firstName,
          age: patient.age,
          email: patient.email,
          telephone: patient.phone,
          adresse: patient.address,
          contact_urgence: patient.emergencyContact || 'Non renseigné',
          historique_medical: patient.medicalHistory || 'Non renseigné'
        },
        mesures: measurements.map(m => ({
          date: m.date,
          temperature: m.temp,
          rythme_cardiaque: m.heartRate,
          spo2: m.spo2,
          poids: m.weight,
          statut: m.status
        })),
        derniere_mesure: lastMeasurement
      };

      let content, mimeType, filename;

      switch (format) {
        case 'csv':
          content = generateCSV(exportData);
          mimeType = 'text/csv;charset=utf-8;';
          filename = `patient_${patient.lastName}_${patient.firstName}.csv`;
          break;
        
        case 'json':
          content = JSON.stringify(exportData, null, 2);
          mimeType = 'application/json';
          filename = `patient_${patient.lastName}_${patient.firstName}.json`;
          break;
        
        case 'pdf':
          content = generatePatientPDF(exportData);
          mimeType = 'application/pdf';
          filename = `patient_${patient.lastName}_${patient.firstName}.pdf`;
          break;
        
        default:
          content = generateCSV(exportData);
          mimeType = 'text/csv;charset=utf-8;';
          filename = `patient_${patient.lastName}_${patient.firstName}.csv`;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert(`Exportation réussie! Fichier: ${filename}`);

    } catch (error) {
      console.error('Erreur lors de l\'exportation:', error);
      alert('Erreur lors de l\'exportation. Veuillez réessayer.');
    } finally {
      setExportLoading(false);
    }
  };

  const generateCSV = (data) => {
    let csv = '';
    
    csv += 'INFORMATIONS PATIENT\n';
    csv += 'Champ,Valeur\n';
    csv += `ID,${data.patient.id}\n`;
    csv += `RFID,${data.patient.rfid}\n`;
    csv += `Nom,${data.patient.nom}\n`;
    csv += `Prénom,${data.patient.prenom}\n`;
    csv += `Âge,${data.patient.age}\n`;
    csv += `Email,${data.patient.email}\n`;
    csv += `Téléphone,${data.patient.telephone}\n`;
    csv += `Adresse,"${data.patient.adresse}"\n`;
    csv += `Contact d'urgence,${data.patient.contact_urgence}\n\n`;
    
    if (data.derniere_mesure) {
      csv += 'DERNIÈRE MESURE\n';
      csv += 'Date,Température,Rythme cardiaque,SpO2,Poids,Statut\n';
      csv += `"${data.derniere_mesure.date}",${data.derniere_mesure.temperature},${data.derniere_mesure.rythme_cardiaque},${data.derniere_mesure.spo2},${data.derniere_mesure.poids},${data.derniere_mesure.statut}\n\n`;
    }
    
    csv += 'HISTORIQUE DES MESURES\n';
    csv += 'Date,Température (°C),Rythme cardiaque (bpm),SpO2 (%),Poids (kg),Statut\n';
    data.mesures.forEach(mesure => {
      csv += `"${mesure.date}",${mesure.temperature},${mesure.rythme_cardiaque},${mesure.spo2},${mesure.poids},${mesure.statut}\n`;
    });
    
    return csv;
  };

  // Fonction pour générer un PDF patient
  const generatePatientPDF = (data) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Rapport Patient - ${data.patient.prenom} ${data.patient.nom}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; text-align: center; }
          h2 { color: #374151; margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
          h3 { color: #4b5563; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .header { text-align: center; margin-bottom: 30px; }
          .footer { margin-top: 50px; text-align: center; color: #6b7280; font-size: 10px; }
          .info-section { margin-bottom: 20px; }
          .info-label { font-weight: bold; color: #374151; }
          .measurement-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
          .measurement-card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; text-align: center; }
          .measurement-value { font-size: 24px; font-weight: bold; color: #1f2937; }
          .measurement-label { font-size: 12px; color: #6b7280; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ROBOT MÉDICAL - RAPPORT PATIENT</h1>
          <h2>${data.patient.prenom} ${data.patient.nom}</h2>
          <p>Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div class="info-section">
          <h3>Informations Personnelles</h3>
          <table>
            <tr><th>ID Patient</th><td>${data.patient.id}</td></tr>
            <tr><th>RFID</th><td>${data.patient.rfid}</td></tr>
            <tr><th>Nom</th><td>${data.patient.nom}</td></tr>
            <tr><th>Prénom</th><td>${data.patient.prenom}</td></tr>
            <tr><th>Âge</th><td>${data.patient.age} ans</td></tr>
            <tr><th>Email</th><td>${data.patient.email}</td></tr>
            <tr><th>Téléphone</th><td>${data.patient.telephone}</td></tr>
            <tr><th>Adresse</th><td>${data.patient.adresse}</td></tr>
            <tr><th>Contact d'urgence</th><td>${data.patient.contact_urgence}</td></tr>
          </table>
        </div>

        ${data.derniere_mesure ? `
          <div class="info-section">
            <h3>Dernière Mesure</h3>
            <div class="measurement-grid">
              <div class="measurement-card">
                <div class="measurement-value">${data.derniere_mesure.temperature}°C</div>
                <div class="measurement-label">Température</div>
              </div>
              <div class="measurement-card">
                <div class="measurement-value">${data.derniere_mesure.rythme_cardiaque} bpm</div>
                <div class="measurement-label">Rythme cardiaque</div>
              </div>
              <div class="measurement-card">
                <div class="measurement-value">${data.derniere_mesure.spo2}%</div>
                <div class="measurement-label">SpO2</div>
              </div>
              <div class="measurement-card">
                <div class="measurement-value">${data.derniere_mesure.poids} kg</div>
                <div class="measurement-label">Poids</div>
              </div>
            </div>
            <p><strong>Date:</strong> ${new Date(data.derniere_mesure.date).toLocaleString('fr-FR')}</p>
            <p><strong>Statut:</strong> ${data.derniere_mesure.statut}</p>
          </div>
        ` : ''}

        <div class="info-section">
          <h3>Historique des Mesures (${data.mesures.length} enregistrements)</h3>
          ${data.mesures.length > 0 ? `
            <table>
              <tr>
                <th>Date</th>
                <th>Température (°C)</th>
                <th>Rythme cardiaque (bpm)</th>
                <th>SpO2 (%)</th>
                <th>Poids (kg)</th>
                <th>Statut</th>
              </tr>
              ${data.mesures.map(mesure => `
                <tr>
                  <td>${new Date(mesure.date).toLocaleString('fr-FR')}</td>
                  <td>${mesure.temperature}</td>
                  <td>${mesure.rythme_cardiaque}</td>
                  <td>${mesure.spo2}</td>
                  <td>${mesure.poids}</td>
                  <td>${mesure.statut}</td>
                </tr>
              `).join('')}
            </table>
          ` : '<p>Aucune mesure dans l\'historique</p>'}
        </div>
        
        <div class="footer">
          <p>Document généré automatiquement par le système Robot Médical</p>
          <p>Confidentiel - Usage médical uniquement</p>
        </div>
      </body>
      </html>
    `;
    
    return htmlContent;
  };

  const handleExportWithFormat = () => {
    const format = window.prompt(
      'Choisissez le format d\'exportation:\n1 - CSV\n2 - JSON\n3 - PDF\n\nEntrez le numéro:'
    );
    
    switch (format) {
      case '1': handleExport('csv'); break;
      case '2': handleExport('json'); break;
      case '3': handleExport('pdf'); break;
      default: handleExport('csv');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      // Simulation de suppression
      alert('Patient supprimé avec succès');
      navigate('/patients');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'alerte': return 'text-orange-600 bg-orange-100';
      case 'critique': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non mesuré';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          Chargement des données du patient...
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500 text-lg">
          Patient non trouvé
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/patients" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft size={20} />
            <span>Retour aux patients</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">
            {patient.firstName} {patient.lastName}
          </h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            ID: {patient.rfid || patient.rfid_card}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Mail size={16} />
            <span>Envoyer rapport</span>
          </button>
          
          <button 
            onClick={handleExportWithFormat}
            disabled={exportLoading}
            className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${
              exportLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Download size={16} />
            <span>{exportLoading ? 'Export...' : 'Exporter'}</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Edit size={16} />
            <span>Modifier</span>
          </button>
          <button 
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 size={16} />
            <span>Supprimer</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-700">{error}</div>
        </div>
      )}

      {/* Menu d'exportation rapide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Options d'exportation rapide</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleExport('csv')}
            className="px-3 py-1 bg-white border border-blue-300 rounded text-sm text-blue-700 hover:bg-blue-100"
          >
            CSV
          </button>
          <button 
            onClick={() => handleExport('json')}
            className="px-3 py-1 bg-white border border-blue-300 rounded text-sm text-blue-700 hover:bg-blue-100"
          >
            JSON
          </button>
          <button 
            onClick={() => handleExport('pdf')}
            className="px-3 py-1 bg-white border border-blue-300 rounded text-sm text-blue-700 hover:bg-blue-100"
          >
            PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Informations patient */}
        <div className="lg:col-span-1 space-y-6">
          {/* Carte informations personnelles */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations Personnelles</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">ID RFID</label>
                <p className="font-mono text-blue-600">{patient.rfid || patient.rfid_card}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Âge</label>
                <p className="font-medium">{patient.age} ans</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-medium">{patient.email || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Téléphone</label>
                <p className="font-medium">{patient.phone || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Adresse</label>
                <p className="font-medium">{patient.address || 'Non renseigné'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Sexe</label>
                <p className="font-medium">{patient.gender === 'M' ? 'Masculin' : patient.gender === 'F' ? 'Féminin' : 'Non renseigné'}</p>
              </div>
            </div>
          </div>

          {/* Carte historique médical */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations Complémentaires</h3>
            <p className="text-gray-700">
              {patient.medicalHistory || 'Aucun historique médical renseigné.'}
            </p>
          </div>
        </div>

        {/* Colonne droite - Données médicales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dernière mesure */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Dernière Mesure</h3>
            {lastMeasurement ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <Thermometer className="mx-auto text-red-500 mb-2" size={24} />
                    <div className="text-2xl font-bold text-gray-800">{lastMeasurement.temp}°C</div>
                    <div className="text-sm text-gray-600">Température</div>
                  </div>
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <Heart className="mx-auto text-red-500 mb-2" size={24} />
                    <div className="text-2xl font-bold text-gray-800">{lastMeasurement.heartRate} bpm</div>
                    <div className="text-sm text-gray-600">Rythme cardiaque</div>
                  </div>
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="mx-auto text-cyan-500 mb-2" style={{ fontSize: '24px' }}>O₂</div>
                    <div className="text-2xl font-bold text-gray-800">{lastMeasurement.spo2}%</div>
                    <div className="text-sm text-gray-600">SpO2</div>
                  </div>
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <Scale className="mx-auto text-red-500 mb-2" size={24} />
                    <div className="text-2xl font-bold text-gray-800">{lastMeasurement.weight} kg</div>
                    <div className="text-sm text-gray-600">Poids</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Dernière mise à jour: {formatDate(lastMeasurement.date)}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lastMeasurement.status)}`}>
                    {lastMeasurement.status === 'normal' ? 'Normal' : 
                     lastMeasurement.status === 'alerte' ? 'Alerte' : 'Critique'}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="mx-auto mb-2 text-gray-400" size={32} />
                <div>Aucune mesure enregistrée pour ce patient</div>
              </div>
            )}
          </div>

          {/* Graphique d'évolution */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Évolution des Paramètres</h3>
            <DynamicPatientChart patientId={id} measurements={measurements} />
          </div>

          {/* Historique des mesures */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Historique des Mesures ({measurements.length})
            </h3>
            {measurements.length > 0 ? (
              <div className="space-y-3">
                {measurements.map((measurement, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Activity className="text-blue-600" size={16} />
                      <div>
                        <div className="font-medium">
                          {measurement.temp}°C • {measurement.heartRate} bpm • {measurement.weight} kg
                        </div>
                        <div className="text-sm text-gray-600">{formatDate(measurement.date)}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(measurement.status)}`}>
                      {measurement.status === 'normal' ? 'Normal' : 
                       measurement.status === 'alerte' ? 'Alerte' : 'Critique'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucune mesure dans l'historique
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
