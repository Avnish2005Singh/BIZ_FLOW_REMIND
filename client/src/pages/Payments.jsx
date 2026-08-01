import React, { useState, useEffect } from 'react';

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    type: 'incoming',
    customer: '',
    amount: 0,
    method: 'Cash',
    status: 'completed',
    description: ''
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/payments');
      const data = await response.json();
      setPayments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const totalIncoming = payments.filter(p => p.type === 'incoming' && p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalOutgoing = payments.filter(p => p.type === 'outgoing' && p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const filtered = filterStatus === 'all' ? payments : payments.filter(p => p.status === filterStatus);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const newPayment = await response.json();
      setPayments([newPayment, ...payments]);
      setShowModal(false);
      setFormData({ type: 'incoming', customer: '', amount: 0, method: 'Cash', status: 'completed', description: '' });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save payment');
    }
  };

  const markCompleted = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/payments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      setPayments(payments.map(p => p._id === id ? { ...p, status: 'completed' } : p));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deletePayment = async (id) => {
    if (window.confirm('Delete this payment?')) {
      try {
        await fetch(`http://localhost:5000/api/payments/${id}`, { method: 'DELETE' });
        setPayments(payments.filter(p => p._id !== id));
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: '600',
    color: '#374151', marginBottom: '6px'
  };

  const inputStyle = {
    width: '100%', padding: '10px',
    border: '1px solid #e5e7eb', borderRadius: '6px',
    fontSize: '14px', outline: 'none'
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}><p>Loading payments from database... ⏳</p></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '32px', margin: 0, color: '#1f2937' }}>💰 Payments</h2>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Total: {payments.length} payments (from MongoDB)</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>+ Add Payment</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 8px 0' }}>💚 Total Incoming</p>
          <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#10b981', margin: 0 }}>₹{totalIncoming.toLocaleString()}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 8px 0' }}>💸 Total Outgoing</p>
          <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#ef4444', margin: 0 }}>₹{totalOutgoing.toLocaleString()}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 8px 0' }}>📈 Net Profit</p>
          <p style={{ fontSize: '26px', fontWeight: 'bold', color: totalIncoming - totalOutgoing > 0 ? '#10b981' : '#ef4444', margin: 0 }}>₹{(totalIncoming - totalOutgoing).toLocaleString()}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 8px 0' }}>⏳ Pending</p>
          <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>{pendingCount}</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div style={{ background: 'white', padding: '60px', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>No payments yet! 💰</p>
          <p style={{ color: '#9ca3af' }}>Click "+ Add Payment" to record your first transaction</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Type</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Details</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Amount</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Status</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: p.type === 'incoming' ? '#d1fae5' : '#fee2e2', color: p.type === 'incoming' ? '#065f46' : '#991b1b' }}>
                      {p.type === 'incoming' ? '↓ In' : '↑ Out'}
                    </span>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>{p.customer}</div>
                    <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>{p.method} • {p.description || 'No description'}</div>
                  </td>
                  <td style={{ padding: '14px', fontWeight: '600', fontSize: '14px', color: p.type === 'incoming' ? '#10b981' : '#ef4444' }}>
                    {p.type === 'incoming' ? '+' : '-'}₹{(p.amount || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: p.status === 'completed' ? '#d1fae5' : '#fef3c7', color: p.status === 'completed' ? '#065f46' : '#92400e' }}>{p.status}</span>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {p.status === 'pending' && (
                        <button onClick={() => markCompleted(p._id)} style={{ background: '#d1fae5', color: '#065f46', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>✓ Done</button>
                      )}
                      <button onClick={() => deletePayment(p._id)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ fontSize: '22px', margin: '0 0 24px 0', color: '#1f2937' }}>➕ Add Payment</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Payment Type *</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} style={inputStyle}>
                  <option value="incoming">↓ Incoming (Money received)</option>
                  <option value="outgoing">↑ Outgoing (Money sent)</option>
                </select>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Payment Method *</label>
                <select value={formData.method} onChange={(e) => setFormData({...formData, method: e.target.value})} style={inputStyle}>
                  <option value="Cash">💵 Cash</option>
                  <option value="UPI">📱 UPI</option>
                  <option value="Card">💳 Card</option>
                  <option value="Bank Transfer">🏦 Bank Transfer</option>
                  <option value="Cheque">📝 Cheque</option>
                </select>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Customer / Payee Name *</label>
                <input required placeholder="e.g. Rajesh Kumar" value={formData.customer} onChange={(e) => setFormData({...formData, customer: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Amount (₹) *</label>
                <input required type="number" placeholder="e.g. 5000" value={formData.amount} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} style={inputStyle} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Status *</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} style={inputStyle}>
                  <option value="completed">✅ Completed</option>
                  <option value="pending">⏳ Pending</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Description (Optional)</label>
                <input placeholder="e.g. Invoice payment #123" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>❌ Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>➕ Add Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;
