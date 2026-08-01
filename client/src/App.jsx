import React, { useState } from 'react';
import Sidebar from './components/common/Sidebar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Payments from './pages/Payments';
import Inventory from './pages/Inventory';
import Reminders from './pages/Reminders';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'customers': return <Customers />;
      case 'payments': return <Payments />;
      case 'inventory': return <Inventory />;
      case 'reminders': return <Reminders />;
      default: return <Dashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main style={{ flex: 1, padding: '30px', overflow: 'auto' }}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
