import React, { useState, useEffect } from 'react';
import DynamicLineChart from '../components/charts/dynamic-linechart';

const MedicalData = () => {
  const medicalStats = [
    { parameter: 'Température moyenne', value: '36.8°C', trend: 'stable', color: 'text-blue-600' },
    { parameter: 'Rythme cardiaque moyen', value: '72 bpm', trend: 'stable', color: 'text-green-600' },
    { parameter: 'SpO2 moyen', value: '97%', trend: 'stable', color: 'text-cyan-600' },
    { parameter: 'Poids moyen', value: '73.2 kg', trend: 'diminution', color: 'text-purple-600' },
    { parameter: 'Mesures aujourd\'hui', value: '156', trend: 'augmentation', color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Données Médicales</h1>

      {/* Statistiques médicales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {medicalStats.map((stat, index) => (
          <div key={index} className="card p-6">
            <h3 className="text-lg font-semibold text-gray-800">{stat.parameter}</h3>
            <div className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</div>
            <div className={`text-sm mt-1 ${
              stat.trend === 'augmentation' ? 'text-green-600' : 
              stat.trend === 'diminution' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {stat.trend === 'augmentation' ? '↗' : stat.trend === 'diminution' ? '↘' : '→'} {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Graphiques détaillés */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Évolution des Paramètres sur 30 jours</h3>
        <DynamicLineChart />
      </div>

      {/* Alertes récentes */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Alertes Récentes</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
            <div>
              <span className="font-medium text-red-800">RFID007 - Température élevée</span>
              <p className="text-red-600 text-sm">Température: 38.2°C détectée à 09:45</p>
            </div>
            <span className="text-red-800 font-medium">Critique</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div>
              <span className="font-medium text-orange-800">RFID012 - Rythme cardiaque élevé</span>
              <p className="text-orange-600 text-sm">Rythme cardiaque: 95 bpm détecté à 10:20</p>
            </div>
            <span className="text-orange-800 font-medium">Modéré</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalData;
