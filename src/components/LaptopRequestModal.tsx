import React, { useState } from 'react';

interface LaptopRequestModalProps {
  destinationId: number;
  destinationTitle: string;
  onClose: () => void;
}

const LaptopRequestModal: React.FC<LaptopRequestModalProps> = ({ destinationId, destinationTitle, onClose }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [laptopModel, setLaptopModel] = useState('');
  const [laptopSerial, setLaptopSerial] = useState('');
  const [powerRequirements, setPowerRequirements] = useState('');
  const [seatingPreference, setSeatingPreference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!customerName.trim()) return setError('Nama harus diisi');
    setIsSubmitting(true);
    try {
      const resp = await fetch('/api/create-laptop-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination_id: destinationId,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          laptop_model: laptopModel,
          laptop_serial: laptopSerial,
          power_requirements: powerRequirements,
          seating_preference: seatingPreference,
          notes
        })
      });
      const json = await resp.json();
      if (!resp.ok) {
        setError(json?.error || 'Gagal mengirim permintaan');
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Terima kasih</h2>
          <p>Permintaan Anda untuk <strong>{destinationTitle}</strong> telah dikirim. Kami akan menghubungi Anda melalui WhatsApp atau email.</p>
          <div style={{ marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={onClose}>Tutup</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Form Permintaan Laptop — {destinationTitle}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama</label>
            <input value={customerName} onChange={e => setCustomerName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email (opsional)</label>
            <input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Nomor WhatsApp (opsional)</label>
            <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Model Laptop</label>
            <input value={laptopModel} onChange={e => setLaptopModel(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Nomor Seri (opsional)</label>
            <input value={laptopSerial} onChange={e => setLaptopSerial(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Kebutuhan Daya / Adapter (opsional)</label>
            <input value={powerRequirements} onChange={e => setPowerRequirements(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Preferensi Seating (opsional)</label>
            <input value={seatingPreference} onChange={e => setSeatingPreference(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Catatan (opsional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          {error && <p className="validation-error">{error}</p>}

          <div style={{ display: 'flex', gap: 8, marginTop: '1rem' }}>
            <button type="button" className="btn" onClick={onClose} disabled={isSubmitting}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Mengirim...' : 'Kirim Permintaan'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LaptopRequestModal;
