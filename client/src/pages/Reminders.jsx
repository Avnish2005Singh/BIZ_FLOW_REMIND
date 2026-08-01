import React, { useState, useEffect } from 'react';

function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '', type: 'custom', date: '', time: '12:00',
    priority: 'medium', notes: ''
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reminders');
      const data = await response.json();
      setReminders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const getPriorityInfo = (priority) => ({
    high: { icon: '🔴', label: 'High', bg: '#fee2e2', color: '#991b1b' },
    medium: { icon: '🟡', label: 'Medium', bg: '#fef3c7', color: '#92400e' },
    low: { icon: '🔵', label: 'Low', bg: '#dbeafe', color: '#1e40af' }
  })[priority] || { icon: '🔵', label: 'Low', bg: '#dbeafe', color: '#1e40af' };

  const getTypeIcon = (type) => ({
    payment: '💰', inventory: '📦', meeting: '🤝', custom: '📌'
  })[type] || '📌';

  const filtered = reminders.filter(r => {
    if (filter === 'active') return !r.completed;
    if (filter === 'completed') return r.completed;
    return true;
  });

  const activeCount = reminders.filter(r => !r.completed).length;
  const completedCount = reminders.filter(r => r.completed).length;
  const highPriorityCount = reminders.filter(r => r.priority === 'high' && !r.completed).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingReminder ? `http://localhost:5000/api/reminders/${editingReminder._id}` : 'http://localhost:5000/api/reminders';
      const method = editingReminder ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (editingReminder) {
        setReminders(reminders.map(r => r._id === editingReminder._id ? result : r));
      } else {
        setReminders([result, ...reminders]);
      }
      setShowModal(false);
      setEditingReminder(null);
      setFormData({ title: '', type: 'custom', date: '', time: '12:00', priority: 'medium', notes: '' });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save');
    }
  };

  const toggleComplete = async (id) => {
    try {
      const reminder = reminders.find(r => r._id === id);
      await fetch(`http://localhost:5000/api/reminders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reminder, completed: !reminder.completed })
      });
      setReminders(reminders.map(r => r._id === id ? { ...r, completed: !r.completed } : r));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      type: reminder.type,
      date: reminder.date ? reminder.date.split('T')[0] : '',
      time: reminder.time || '12:00',
      priority: reminder.priority,
      notes: reminder.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this reminder?')) {
      try {
        await fetch(`http://localhost:5000/api/reminders/${id}`, { method: 'DELETE' });
        setReminders(reminders.filter(r => r._id !== id));
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleAddNew = () => {
    setEditingReminder(null);
    setFormData({ title: '', type: 'custom', date: new Date().toISOString().split('T')[0], time: '12:00', priority: 'medium', notes: '' });
    setShowModal(true);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}><p>Loading reminders from database... ⏳</p></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '32px', margin: 0, color: '#1f2937' }}>🔔 Reminders</h2>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Total: {reminders.length} reminders (from MongoDB)</p>
        </div>
        <button onClick={handleAddNew} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>+ Add Reminder</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 4px 0' }}>📋 Active</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>{activeCount}</p>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 4px 0' }}>✅ Completed</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', margin: 0 }}>{completedCount}</p>
        </div>
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 4px 0' }}>🚨 High Priority</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444', margin: 0 }}>{highPriorityCount}</p>
        </div>
      </div>

      {reminders.length === 0 ? (
        <div style={{ background: 'white', padding: '60px', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>No reminders yet! 🔔</p>
          <p style={{ color: '#9ca3af' }}>Click "+ Add Reminder" to create your first one</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(r => {
            const priority = getPriorityInfo(r.priority);
            return (
              <div key={r._id} style={{ background: 'white', padding: '16px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', opacity: r.completed ? 0.6 : 1 }}>
                <input type="checkbox" checked={r.completed} onChange={() => toggleComplete(r._id)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                <span style={{ fontSize: '28px' }}>{getTypeIcon(r.type)}</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', margin: '0 0 4px 0', color: '#1f2937', textDecoration: r.completed ? 'line-through' : 'none' }}>{r.title}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{r.type} • {r.date ? r.date.split('T')[0] : ''} • {r.time}</p>
                  {r.notes && <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0 0', fontStyle: 'italic' }}>💭 {r.notes}</p>}
                </div>
                <span style={{ padding: '4px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: priority.bg, color: priority.color }}>
                  {priority.icon} {priority.label}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleEdit(r)} style={{ background: '#fef3c7', color: '#92400e', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>✏️</button>
                  <button onClick={() => handleDelete(r._id)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <h3 style={{ fontSize: '22px', margin: '0 0 24px 0', color: '#1f2937' }}>{editingReminder ? '✏️ Edit Reminder' : '➕ Add Reminder'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Title *</label>
                <input required placeholder="e.g. Payment due" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Type *</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                  <option value="custom">📌 Custom</option>
                  <option value="payment">💰 Payment</option>
                  <option value="inventory">📦 Inventory</option>
                  <option value="meeting">🤝 Meeting</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
                <input required type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Priority *</label>
                <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🔵 Low</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Notes</label>
                <textarea placeholder="Additional notes..." value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows="3" style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>{editingReminder ? '💾 Update' : '➕ Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reminders;
