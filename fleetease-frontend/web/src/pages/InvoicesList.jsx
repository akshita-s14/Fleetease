import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function InvoicesList() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = () => {
    api.get('/invoices')
      .then(r => setInvoices(r.data.invoices))
      .catch(e => console.error(e));
  };

  const markAsPaid = async (id) => {
    try {
      await api.post(`/invoices/${id}/pay`);
      alert('Invoice marked as paid!');
      fetchInvoices();
    } catch (e) {
      alert('Failed to update invoice');
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <h3 className="mb-4">Corporate Invoices (B2B)</h3>
      <div className="glass-card p-0 overflow-hidden">
        <table className="table table-hover mb-0">
          <thead className="table-primary">
            <tr>
              <th>ID</th>
              <th>Company Name</th>
              <th>Booking ID</th>
              <th>Total Amount</th>
              <th>Payment Due</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.invoice_id}>
                <td>{inv.invoice_id}</td>
                <td className="fw-bold">{inv.company_name}</td>
                <td>#{inv.booking_id}</td>
                <td>₹{inv.total_amount}</td>
                <td>{new Date(inv.payment_due).toLocaleDateString()}</td>
                <td>
                  <span className={`badge bg-${inv.payment_status === 'paid' ? 'success' : 'danger'}`}>
                    {inv.payment_status}
                  </span>
                </td>
                <td>
                  {inv.payment_status !== 'paid' && (
                    <button className="btn btn-sm btn-success fw-bold" onClick={() => markAsPaid(inv.invoice_id)}>
                      Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">No invoices found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
