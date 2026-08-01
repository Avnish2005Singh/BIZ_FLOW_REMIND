import React from 'react';

function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'customers', icon: '👥', label: 'Customers' },
    { id: 'payments', icon: '💰', label: 'Payments' },
    { id: 'inventory', icon: '📦', label: 'Inventory' },
    { id: 'reminders', icon: '🔔', label: 'Reminders' },
  ];

  return (
    <aside style={{
      width: '240px',
      background: 'white',
      boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
      padding: '24px 16px',
      minHeight: '100vh'
    }}>
      <div style={{ marginBottom: '30px', padding: '0 8px' }}>
        <h1 style={{ color: '#2563eb', fontSize: '26px', margin: 0 }}>🚀 BizFlow</h1>
        <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0 0' }}>Business Management</p>
      </div>

      <nav>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              marginBottom: '6px',
              background: activePage === item.id ? '#eff6ff' : 'transparent',
              color: activePage === item.id ? '#2563eb' : '#4b5563',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: activePage === item.id ? '600' : '500',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div style={{
        marginTop: '40px',
        padding: '16px',
        background: '#f9fafb',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <strong style={{ color: '#374151' }}>Logged in as:</strong>
        <p style={{ margin: '4px 0 0 0' }}>Lucky Sharma</p>
      </div>
    </aside>
  );
}

export default Sidebar;
