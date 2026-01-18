import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  BarChart3, 
  Settings 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Tableau de Bord' },
    { path: '/patients', icon: Users, label: 'Patients' },
    { path: '/medical-data', icon: Activity, label: 'Données Médicales' },
    { path: '/reports', icon: BarChart3, label: 'Rapports' },
    { path: '/administration', icon: Settings, label: 'Administration' },
  ];

  return (
    <div className="sidebar w-64">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">MedRobot Dashboard</h1>
        <p className="text-blue-200 text-sm mt-2">Robot Médical Intelligent</p>
      </div>
      
      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive ? 'active' : ''} flex items-center space-x-3`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;