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

const DynamicLineChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour charger les données du graphique
  const fetchChartData = async () => {
    try {
      const response = await fetch('/api/get_chart_data.php');
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          // Utiliser les données réelles de l'API
          const chartData = {
            labels: data.labels || ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
            datasets: [
              {
                label: 'Température Moyenne (°C)',
                data: data.temperatureData || [36.6, 36.8, 36.7, 36.9, 37.1, 36.8, 36.7],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
              },
              {
                label: 'Rythme Cardiaque Moyen (bpm)',
                data: data.heartRateData || [72, 75, 70, 68, 73, 74, 71],
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true,
              },
              {
                label: 'SpO2 Moyen (%)',
                data: data.spo2Data || [98, 97, 99, 98, 96, 97, 98],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
                fill: true,
              },
            ],
          };
          setChartData(chartData);
        }
      }
    } catch (error) {
      console.error('Erreur chargement données graphique:', error);
      // Données par défaut en cas d'erreur
      setChartData({
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [
          {
            label: 'Température Moyenne (°C)',
            data: [36.6, 36.8, 36.7, 36.9, 37.1, 36.8, 36.7],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Rythme Cardiaque Moyen (bpm)',
            data: [72, 75, 70, 68, 73, 74, 71],
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
    
    // Mise à jour automatique toutes les 30 secondes
    const interval = setInterval(fetchChartData, 30000);
    return () => clearInterval(interval);
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Évolution des Paramètres Médicaux - Temps Réel',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-gray-500">Chargement des données...</div>
        </div>
      </div>
    );
  }

  return <Line options={options} data={chartData} />;
};

export default DynamicLineChart;
