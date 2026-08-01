import React, { useState, useEffect } from 'react';

function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    sku: '', name: '', category: '', quantity: 0, minStockLevel: 10,
    costPrice: 0, sellingPrice: 0
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/inventory');
      const data = await response.json();
      setItems(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const getStatus = (qty, min) => {
    if (qty === 0) return 'out-of-stock';
    if (qty <= min) return 'low-stock';
    return 'in-stock';
  };

  const filtered = items.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || getStatus(item.quantity, item.minStockLevel) === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalStockValue = items.reduce((sum, i) => sum + (i.quantity * i.costPrice), 0);
  const lowStockCount = items.filter(i => getStatus(i.quantity, i.minStockLevel) === 'low-stock').length;
  const outOfStockCount = items.filter(i => getStatus(i.quantity, i.minStockLevel) === 'out-of-stock').length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem ? `http://localhost:5000/api/inventory/${editingItem._id}` : 'http://localhost:5000/api/inventory';
      const method = editingItem ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (editingItem) {
        setItems(items.map(i => i._id === editingItem._id ? result : i));
      } else {
        setItems([result, ...items]);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({ sku: '', name: '', category: '', quantity: 0, minStockLevel: 10, costPrice: 0, sellingPrice: 0 });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      sku: item.sku, name: item.name, category: item.category || '',
      quantity: item.quantity, minStockLevel: item.minStockLevel,
      costPrice: item.costPrice, sellingPrice: item.sellingPrice
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this item?')) {
      try {
        await fetch(`http://localhost:5000/api/inventory/${id}`, { method: 'DELETE' });
        setItems(items.filter(i => i._id !== id));
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'in-stock': { bg: '#d1fae5', color: '#065f46', text: '✓ In Stock' },
      'low-stock': { bg: '#fef3c7', color: '#92400e', text: '⚠ Low Stock' },
      'out-of-stock': { bg: '#fee2e2', color: '#991b1b', text: '✗ Out of Stock' }
    };
    return styles[status];
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({ sku: '', name: '', category: '', quantity: 0, minStockLevel: 10, costPrice: 0, sellingPrice: 0 });
    setShowModal(true);
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

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}><p>Loading inventory from database... ⏳</p></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '32px', margin: 0, color: '#1f2937' }}>📦 Smart Inventory</h2>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Total: {items.length} items (from MongoDB)</p>
        </div>
        <button onClick={handleAddNew} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>+ Add Item</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 6px 0' }}>📦 Total Items</p>
          <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{items.length}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 6px 0' }}>⚠️ Low Stock</p>
          <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>{lowStockCount}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 6px 0' }}>❌ Out of Stock</p>
          <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#ef4444', margin: 0 }}>{outOfStockCount}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 6px 0' }}>💰 Stock Value</p>
          <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#10b981', margin: 0 }}>₹{(totalStockValue/1000).toFixed(0)}K</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ background: 'white', padding: '60px', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>No inventory yet! 📦</p>
          <p style={{ color: '#9ca3af' }}>Click "+ Add Item" to start tracking stock</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>SKU</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Name</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Qty</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Price</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Status</th>
                <th style={{ padding: '14px', textAlign: 'left', fontSize: '13px', color: '#6b7280' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const badge = getStatusBadge(getStatus(item.quantity, item.minStockLevel));
                return (
                  <tr key={item._id} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '14px', fontFamily: 'monospace', fontSize: '13px', color: '#6b7280' }}>{item.sku}</td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: '500', color: '#1f2937' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{item.category || 'Uncategorized'}</div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ fontWeight: '600', color: item.quantity <= item.minStockLevel ? '#ef4444' : '#1f2937' }}>{item.quantity}</span>
                    </td>
                    <td style={{ padding: '14px', fontWeight: '600' }}>₹{(item.sellingPrice || 0).toLocaleString()}</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: badge.bg, color: badge.color }}>{badge.text}</span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => handleEdit(item)} style={{ background: '#fef3c7', color: '#92400e', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>✏️</button>
                        <button onClick={() => handleDelete(item._id)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflow: 'auto' }}>
            <h3 style={{ fontSize: '22px', margin: '0 0 24px 0', color: '#1f2937' }}>{editingItem ? '✏️ Edit Item' : '➕ Add New Item'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>SKU Code *</label>
                <input required placeholder="e.g. SKU001" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Product Name *</label>
                <input required placeholder="e.g. Laptop" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Category</label>
                <input placeholder="Electronics, Furniture, Stationery..." value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>Quantity in Stock *</label>
                  <input required type="number" placeholder="0" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Minimum Stock Alert *</label>
                  <input required type="number" placeholder="10" value={formData.minStockLevel} onChange={(e) => setFormData({...formData, minStockLevel: Number(e.target.value)})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Cost Price (₹) *</label>
                  <input required type="number" placeholder="e.g. 1000" value={formData.costPrice} onChange={(e) => setFormData({...formData, costPrice: Number(e.target.value)})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Selling Price (₹) *</label>
                  <input required type="number" placeholder="e.g. 1500" value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: Number(e.target.value)})} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>❌ Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>{editingItem ? '💾 Update' : '➕ Add'} Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
