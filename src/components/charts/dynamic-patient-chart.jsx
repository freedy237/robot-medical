import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DynamicPatientChart = ({ patientId, measurements = [] }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour charger les données du patient
  const fetchPatientChartData = async () => {
    try {
      if (measurements.length > 0) {
        // Utiliser les mesures fournies en props
        const formattedData = formatPatientData(measurements);
        setChartData(formattedData);
      } else {
        // Charger depuis l'API si pas de mesures fournies
        const response = await fetch(`/backend/get_patient_chart_data.php?id=${patientId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Formater les données de l'API pour Chart.js
            const formattedData = formatApiData(data.chartData);
            setChartData(formattedData);
          }
        }
      }
    } catch (error) {
      console.error('Erreur chargement données patient:', error);
      // Données par défaut en cas d'erreur
      setChartData(getDefaultPatientData());
    } finally {
      setLoading(false);
    }
  };

  // Formater les données du patient
  const formatPatientData = (measurements) => {
    const labels = measurements.map(m => 
      new Date(m.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    );
    
    const tempData = measurements.map(m => m.temp || 0);
    const heartRateData = measurements.map(m => m.heartRate || 0);
    const weightData = measurements.map(m => m.weight || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Température (°C)',
          data: tempData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y',
        },
        {
          label: 'Rythme Cardiaque (bpm)',
          data: heartRateData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1',
        },
        {
          label: 'Poids (kg)',
          data: weightData,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y2',
        },
      ],
    };
  };

  // Formater les données de l'API pour Chart.js
  const formatApiData = (apiData) => {
    return {
      labels: apiData.labels,
      datasets: [
        {
          label: 'Température (°C)',
          data: apiData.temperatureData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y',
        },
        {
          label: 'Rythme Cardiaque (bpm)',
          data: apiData.heartRateData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1',
        },
        {
          label: 'SpO2 (%)',
          data: apiData.spo2Data,
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y2',
        },
        {
          label: 'Poids (kg)',
          data: apiData.weightData,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y3',
        },
      ],
    };
  };

  // Données par défaut
  const getDefaultPatientData = () => {
    const labels = ['15 Jan', '14 Jan', '13 Jan', '12 Jan', '11 Jan'];
    return {
      labels,
      datasets: [
        {
          label: 'Température (°C)',
          data: [36.8, 36.7, 36.9, 36.6, 36.8],
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y',
        },
        {
          label: 'Rythme Cardiaque (bpm)',
          data: [72, 70, 74, 71, 73],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1',
        },
        {
          label: 'Poids (kg)',
          data: [75.2, 75.1, 75.3, 75.0, 75.2],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y2',
        },
      ],
    };
  };

  useEffect(() => {
    fetchPatientChartData();
    
    // Mise à jour automatique toutes les 60 secondes
    const interval = setInterval(fetchPatientChartData, 60000);
    return () => clearInterval(interval);
  }, [patientId, measurements]);

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Évolution des Paramètres du Patient',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (label.includes('Température')) {
                label += context.parsed.y + '°C';
              } else if (label.includes('Rythme')) {
                label += context.parsed.y + ' bpm';
              } else if (label.includes('SpO2')) {
                label += context.parsed.y + '%';
              } else if (label.includes('Poids')) {
                label += context.parsed.y + ' kg';
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Température (°C)'
        },
        min: 35,
        max: 40,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Rythme Cardiaque (bpm)'
        },
        min: 50,
        max: 120,
        grid: {
          drawOnChartArea: false,
        },
      },
      y2: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'SpO2 (%)'
        },
        min: 90,
        max: 100,
        grid: {
          drawOnChartArea: false,
        },
      },
      y3: {
        type: 'linear',
        display: false,
        position: 'right',
        title: {
          display: true,
          text: 'Poids (kg)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-gray-500">Chargement des données du patient...</div>
        </div>
      </div>
    );
  }

  return <Line options={options} data={chartData} />;
};

export default DynamicPatientChart;
