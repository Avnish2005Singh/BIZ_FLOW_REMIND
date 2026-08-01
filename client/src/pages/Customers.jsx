import React, { useState, useEffect } from 'react';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', gstNumber: '', address: '', totalDue: 0
  });

  // Fetch customers from database when component loads
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/customers');
      const data = await response.json();
      setCustomers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setLoading(false);
    }
  };

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        // Update existing customer
        const response = await fetch(`http://localhost:5000/api/customers/${editingCustomer._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const updated = await response.json();
        setCustomers(customers.map(c => c._id === editingCustomer._id ? updated : c));
      } else {
        // Create new customer
        const response = await fetch('http://localhost:5000/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const newCustomer = await response.json();
        setCustomers([newCustomer, ...customers]);
      }
      setShowModal(false);
      setEditingCustomer(null);
      setFormData({ name: '', email: '', phone: '', company: '', gstNumber: '', address: '', totalDue: 0 });
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Failed to save customer');
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      company: customer.company || '',
      gstNumber: customer.gstNumber || '',
      address: customer.address || '',
      totalDue: customer.totalDue || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await fetch(`http://localhost:5000/api/customers/${id}`, {
          method: 'DELETE'
        });
        setCustomers(customers.filter(c => c._id !== id));
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Failed to delete customer');
      }
    }
  };

  const handleAddNew = () => {
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', company: '', gstNumber: '', address: '', totalDue: 0 });
    setShowModal(true);
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    border: '1px solid #e5e7eb', borderRadius: '6px',
    fontSize: '14px', outline: 'none'
  };

  const labelStyle = {
    display: 'block', fontSize: '13px',
    fontWeight: '600', color: '#374151',
    marginBottom: '6px'
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>Loading customers from database... ⏳</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '32px', margin: 0, color: '#1f2937' }}>👥 Customers</h2>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>
            Total: {customers.length} customers (from MongoDB)
          </p>
        </div>
        <button onClick={handleAddNew} style={{
          background: '#2563eb', color: 'white', border: 'none',
          padding: '12px 24px', borderRadius: '8px', fontSize: '14px',
          fontWeight: '600', cursor: 'pointer'
        }}>
          + Add Customer
        </button>
      </div>

      {/* Search */}
      <div style={{
        background: 'white', padding: '16px', borderRadius: '12px',
        marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <input
          type="text"
          placeholder="🔍 Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ ...inputStyle, padding: '12px 16px' }}
        />
      </div>

      {/* Customer Cards */}
      {customers.length === 0 ? (
        <div style={{
          background: 'white', padding: '60px', borderRadius: '12px',
          textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <p style={{ fontSize: '18px', color: '#6b7280', margin: 0 }}>
            No customers yet! 🎉
          </p>
          <p style={{ color: '#9ca3af', marginTop: '10px' }}>
            Click "+ Add Customer" to add your first one!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {filtered.map(customer => (
            <div key={customer._id} style={{
              background: 'white', padding: '20px',
              borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: '#dbeafe', color: '#1e40af',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', fontWeight: 'bold', marginRight: '12px'
                }}>
                  {customer.name?.charAt(0) || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', margin: 0, color: '#1f2937' }}>{customer.name}</h3>
                  <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>{customer.company}</p>
                </div>
              </div>

              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                <p style={{ margin: '4px 0' }}>📧 {customer.email}</p>
                <p style={{ margin: '4px 0' }}>📞 {customer.phone}</p>
                {customer.address && <p style={{ margin: '4px 0' }}>📍 {customer.address}</p>}
              </div>

              <div style={{
                borderTop: '1px solid #f3f4f6', paddingTop: '12px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ color: '#6b7280', fontSize: '13px' }}>Total Due:</span>
                <span style={{
                  fontWeight: 'bold',
                  color: (customer.totalDue || 0) > 0 ? '#ef4444' : '#10b981',
                  fontSize: '15px'
                }}>
                  ₹{(customer.totalDue || 0).toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button onClick={() => handleEdit(customer)} style={{
                  flex: 1, background: '#dbeafe', color: '#1e40af',
                  border: 'none', padding: '8px', borderRadius: '6px',
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                }}>
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(customer._id)} style={{
                  flex: 1, background: '#fee2e2', color: '#991b1b',
                  border: 'none', padding: '8px', borderRadius: '6px',
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                }}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', padding: '30px',
            width: '100%', maxWidth: '550px', maxHeight: '90vh', overflow: 'auto'
          }}>
            <h3 style={{ fontSize: '22px', margin: '0 0 24px 0', color: '#1f2937' }}>
              {editingCustomer ? '✏️ Edit Customer' : '➕ Add New Customer'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Full Name *</label>
                <input required placeholder="e.g. Rajesh Kumar" value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <input required placeholder="+91 98765 43210" value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" placeholder="customer@example.com" value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Company Name</label>
                  <input placeholder="Company name" value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>GST Number</label>
                  <input placeholder="GST123456" value={formData.gstNumber}
                    onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                    style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Address</label>
                <input placeholder="City, State" value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  style={inputStyle} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Total Due Amount (₹)</label>
                <input type="number" placeholder="0" value={formData.totalDue}
                  onChange={(e) => setFormData({...formData, totalDue: Number(e.target.value)})}
                  style={inputStyle} />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  flex: 1, padding: '12px', background: '#e5e7eb', color: '#374151',
                  border: 'none', borderRadius: '8px', fontSize: '14px',
                  fontWeight: '600', cursor: 'pointer'
                }}>
                  ❌ Cancel
                </button>
                <button type="submit" style={{
                  flex: 1, padding: '12px', background: '#2563eb', color: 'white',
                  border: 'none', borderRadius: '8px', fontSize: '14px',
                  fontWeight: '600', cursor: 'pointer'
                }}>
                  {editingCustomer ? '💾 Update' : '➕ Add'} Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
