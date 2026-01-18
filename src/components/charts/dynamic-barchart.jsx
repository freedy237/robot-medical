import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DynamicBarChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour charger les données du graphique
  const fetchChartData = async () => {
    try {
      const response = await fetch('/api/get_chart_data.php?type=distribution');
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          // Utiliser les données réelles de l'API
          const chartData = {
            labels: data.ageGroups || ['18-30 ans', '31-45 ans', '46-60 ans', '61+ ans'],
            datasets: [
              {
                label: 'Nombre de Patients',
                data: data.patientCounts || [45, 62, 38, 11],
                backgroundColor: [
                  'rgba(59, 130, 246, 0.8)',
                  'rgba(16, 185, 129, 0.8)',
                  'rgba(245, 158, 11, 0.8)',
                  'rgba(139, 92, 246, 0.8)',
                ],
                borderColor: [
                  'rgb(59, 130, 246)',
                  'rgb(16, 185, 129)',
                  'rgb(245, 158, 11)',
                  'rgb(139, 92, 246)',
                ],
                borderWidth: 1,
              },
              {
                label: 'Mesures Aujourd\'hui',
                data: data.todayMeasures || [12, 18, 8, 3],
                backgroundColor: [
                  'rgba(59, 130, 246, 0.4)',
                  'rgba(16, 185, 129, 0.4)',
                  'rgba(245, 158, 11, 0.4)',
                  'rgba(139, 92, 246, 0.4)',
                ],
                borderColor: [
                  'rgb(59, 130, 246)',
                  'rgb(16, 185, 129)',
                  'rgb(245, 158, 11)',
                  'rgb(139, 92, 246)',
                ],
                borderWidth: 1,
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
        labels: ['18-30 ans', '31-45 ans', '46-60 ans', '61+ ans'],
        datasets: [
          {
            label: 'Nombre de Patients',
            data: [45, 62, 38, 11],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(139, 92, 246, 0.8)',
            ],
            borderColor: [
              'rgb(59, 130, 246)',
              'rgb(16, 185, 129)',
              'rgb(245, 158, 11)',
              'rgb(139, 92, 246)',
            ],
            borderWidth: 1,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
    
    // Mise à jour automatique toutes les 60 secondes
    const interval = setInterval(fetchChartData, 60000);
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
        text: 'Répartition des Patients - Données Temps Réel',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' patients';
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        title: {
          display: true,
          text: 'Nombre de Patients'
        }
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

  return <Bar options={options} data={chartData} />;
};

export default DynamicBarChart;
