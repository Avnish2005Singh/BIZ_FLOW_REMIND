import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [c, p, i, r] = await Promise.all([
        fetch('http://localhost:5000/api/customers').then(res => res.json()),
        fetch('http://localhost:5000/api/payments').then(res => res.json()),
        fetch('http://localhost:5000/api/inventory').then(res => res.json()),
        fetch('http://localhost:5000/api/reminders').then(res => res.json())
      ]);
      setCustomers(c);
      setPayments(p);
      setInventory(i);
      setReminders(r);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  // Calculate stats from database
  const totalIncome = payments.filter(p => p.type === 'incoming' && p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalExpense = payments.filter(p => p.type === 'outgoing' && p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0);
  const netProfit = totalIncome - totalExpense;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const lowStockItems = inventory.filter(i => i.quantity <= (i.minStockLevel || 10)).length;

  // Payment status
  const paymentStatus = [
    { name: 'Completed', value: payments.filter(p => p.status === 'completed').length, color: '#10b981' },
    { name: 'Pending', value: payments.filter(p => p.status === 'pending').length, color: '#f59e0b' },
    { name: 'Failed', value: payments.filter(p => p.status === 'failed').length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // Categories
  const categories = {};
  inventory.forEach(item => {
    const cat = item.category || 'Uncategorized';
    categories[cat] = (categories[cat] || 0) + 1;
  });
  const categoryData = Object.keys(categories).map((cat, idx) => ({
    name: cat,
    value: categories[cat],
    color: ['#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#10b981'][idx % 5]
  }));

  // ⭐ NEW: Real "time ago" function
  const getTimeAgo = (date) => {
    if (!date) return 'Recently';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  };

  // ⭐ NEW: Sort by date and show MOST RECENT 8
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(p => ({
      icon: p.type === 'incoming' ? '💰' : '💸',
      text: p.type === 'incoming' ? `Payment received from ${p.customer}` : `Bill paid to ${p.customer}`,
      amount: `${p.type === 'incoming' ? '+' : '-'}₹${(p.amount || 0).toLocaleString()}`,
      time: getTimeAgo(p.createdAt),
      color: p.type === 'incoming' ? '#10b981' : '#ef4444'
    }));

  const recentCustomers = [...customers]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)
    .map(c => ({
      icon: '👤',
      text: `New customer: ${c.name}`,
      amount: '+Customer',
      time: getTimeAgo(c.createdAt),
      color: '#3b82f6'
    }));

  const recentActivity = [...recentPayments, ...recentCustomers]
    .sort((a, b) => {
      // Sort by time - "Just now" first, then minutes, hours, days
      const timeValue = (time) => {
        if (time === 'Just now') return 0;
        const match = time.match(/(\d+)\s+(second|minute|hour|day|week|month)/);
        if (!match) return 999999;
        const value = parseInt(match[1]);
        const unit = match[2];
        const multipliers = { second: 1, minute: 60, hour: 3600, day: 86400, week: 604800, month: 2592000 };
        return value * (multipliers[unit] || 1);
      };
      return timeValue(a.time) - timeValue(b.time);
    })
    .slice(0, 8);

  const stats = [
    { icon: '💰', title: 'Total Income', value: `₹${totalIncome.toLocaleString()}`, color: '#10b981', bg: '#d1fae5' },
    { icon: '💸', title: 'Total Expenses', value: `₹${totalExpense.toLocaleString()}`, color: '#ef4444', bg: '#fee2e2' },
    { icon: '📈', title: 'Net Profit', value: `₹${netProfit.toLocaleString()}`, color: '#3b82f6', bg: '#dbeafe' },
    { icon: '👥', title: 'Total Customers', value: customers.length, color: '#8b5cf6', bg: '#e9d5ff' },
    { icon: '⏳', title: 'Pending Payments', value: pendingPayments, color: '#f59e0b', bg: '#fed7aa' },
    { icon: '📦', title: 'Low Stock Items', value: lowStockItems, color: '#eab308', bg: '#fef3c7' },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading dashboard from database... ⏳</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '32px', margin: '0 0 4px 0', color: '#1f2937' }}>📊 Dashboard</h2>
        <p style={{ color: '#6b7280', margin: 0 }}>Real-time data from MongoDB</p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px', marginBottom: '25px'
      }}>
        {stats.map((stat, idx) => (
          <div key={idx} style={{
            background: 'white', padding: '24px', borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '12px',
                background: stat.bg, color: stat.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px'
              }}>
                {stat.icon}
              </div>
            </div>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 4px 0' }}>{stat.title}</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {paymentStatus.length > 0 && (
        <div style={{
          background: 'white', padding: '24px', borderRadius: '12px',
          marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '18px', margin: '0 0 16px 0', color: '#1f2937' }}>💳 Payment Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={paymentStatus} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={(entry) => `${entry.name}: ${entry.value}`}>
                {paymentStatus.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {categoryData.length > 0 && (
        <div style={{
          background: 'white', padding: '24px', borderRadius: '12px',
          marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '18px', margin: '0 0 16px 0', color: '#1f2937' }}>📦 Inventory by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={(entry) => `${entry.name}: ${entry.value}`}>
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Activity with REAL Timestamps */}
      <div style={{
        background: 'white', padding: '24px', borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ fontSize: '18px', margin: '0 0 16px 0', color: '#1f2937' }}>📝 Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>No recent activity yet. Start by adding customers or payments!</p>
        ) : (
          recentActivity.map((activity, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: idx < recentActivity.length - 1 ? '1px solid #f3f4f6' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <span style={{ fontSize: '20px' }}>{activity.icon}</span>
                <div>
                  <p style={{ margin: 0, color: '#374151', fontSize: '14px' }}>{activity.text}</p>
                  <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '12px' }}>
                    🕒 {activity.time}
                  </p>
                </div>
              </div>
              <span style={{ color: activity.color, fontWeight: '600', fontSize: '14px' }}>
                {activity.amount}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Empty State */}
      {customers.length === 0 && payments.length === 0 && inventory.length === 0 && (
        <div style={{
          background: 'white', padding: '60px', borderRadius: '12px',
          textAlign: 'center', marginTop: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <p style={{ fontSize: '50px', margin: 0 }}>📊</p>
          <p style={{ fontSize: '18px', color: '#6b7280', marginTop: '20px' }}>Your dashboard is waiting for data!</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
