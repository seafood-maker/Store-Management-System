import React from 'react';
import { AppProvider, useAppContext } from './store/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { HRSystem } from './pages/hr/HRSystem';
import { InventorySystem } from './pages/inventory/InventorySystem';
import { SalesSystem } from './pages/sales/SalesSystem';
import { Login } from './pages/Login';

function AppContent() {
  const { currentView, isAuthenticated } = useAppContext();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'hr' && <HRSystem />}
      {currentView === 'inventory' && <InventorySystem />}
      {currentView === 'sales' && <SalesSystem />}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
