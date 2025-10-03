import React, { useState, useMemo, useEffect } from 'react';
import { useToast } from '../../components/Toast';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { EditIcon, TrashIcon } from '../../components/Icons';
import { AdminRowSkeleton } from '../../components/DetailSkeletons';

interface LaptopRequest {
    id?: number;
    destination_id: number;
    customer_name: string;
    customer_email?: string | null;
    customer_phone?: string | null;
    laptop_model?: string | null;
    laptop_serial?: string | null;
    power_requirements?: string | null;
    seating_preference?: string | null;
    notes?: string | null;
    created_at?: string | null;
}

interface AdminLaptopRequestsPageProps {
    laptopRequests?: LaptopRequest[];
    onSave?: (req: LaptopRequest) => void;
    onDelete?: (id: number) => void;
}

const LaptopRequestForm: React.FC<{ request: LaptopRequest; onSave: (r: LaptopRequest) => void; onCancel: () => void }> = ({ request, onSave, onCancel }) => {
    const [form, setForm] = useState<LaptopRequest>(request);
    return (
        <div>
            <h2>{request && request.id ? 'Edit Permintaan Laptop' : 'Tambah Permintaan Laptop'}</h2>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label>Destination ID</label>
                <input value={String(form.destination_id || '')} onChange={e => setForm({ ...form, destination_id: Number(e.target.value || 0) })} />
                <label>Nama Pelanggan</label>
                <input value={form.customer_name || ''} onChange={e => setForm({ ...form, customer_name: e.target.value })} />
                <label>Email</label>
                <input value={form.customer_email || ''} onChange={e => setForm({ ...form, customer_email: e.target.value })} />
                <label>Telepon</label>
                <input value={form.customer_phone || ''} onChange={e => setForm({ ...form, customer_phone: e.target.value })} />
                <label>Model Laptop</label>
                <input value={form.laptop_model || ''} onChange={e => setForm({ ...form, laptop_model: e.target.value })} />
                <label>Serial</label>
                <input value={form.laptop_serial || ''} onChange={e => setForm({ ...form, laptop_serial: e.target.value })} />
                <label>Power Requirements</label>
                <input value={form.power_requirements || ''} onChange={e => setForm({ ...form, power_requirements: e.target.value })} />
                <label>Seating Preference</label>
                <input value={form.seating_preference || ''} onChange={e => setForm({ ...form, seating_preference: e.target.value })} />
                <label>Notes</label>
                <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
                <div style={{ marginTop: '1rem' }}>
                    <button className="btn btn-primary" onClick={() => onSave(form)}>Simpan</button>
                    <button className="btn" onClick={onCancel} style={{ marginLeft: '0.5rem' }}>Batal</button>
                </div>
            </div>
        </div>
    );
};

export const AdminLaptopRequestsPage: React.FC<AdminLaptopRequestsPageProps> = ({ laptopRequests = [], onSave = (r: LaptopRequest) => {}, onDelete = (id: number) => {} }) => {
    const { showToast } = useToast();
    const [editingRequest, setEditingRequest] = useState<LaptopRequest | null>(null);
    const [requestToDelete, setRequestToDelete] = useState<LaptopRequest | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(t);
    }, []);

    const handleAddNew = () => {
        setEditingRequest({ destination_id: 0, customer_name: '' });
        setIsFormVisible(true);
    };

    const handleEdit = (req: LaptopRequest) => { setEditingRequest(req); setIsFormVisible(true); };

    const handleSave = async (req: LaptopRequest) => {
        try {
            await Promise.resolve(onSave(req));
            try { showToast('Permintaan laptop berhasil disimpan', 'success'); } catch {}
            setIsFormVisible(false);
            setEditingRequest(null);
        } catch (err) {
            console.error('Save laptop request failed', err);
            try { showToast('Gagal menyimpan permintaan laptop. Coba lagi.', 'error'); } catch {}
        }
    };

    const handleDeleteRequest = (req: LaptopRequest) => setRequestToDelete(req);

    const handleConfirmDelete = async () => {
        if (!requestToDelete || !requestToDelete.id) return;
        setIsDeleting(true);
        try {
            await Promise.resolve(onDelete(requestToDelete.id));
            try { showToast('Permintaan laptop berhasil dihapus', 'success'); } catch {}
            setRequestToDelete(null);
        } catch (err) {
            console.error('Delete laptop request failed', err);
            try { showToast('Gagal menghapus permintaan laptop. Coba lagi.', 'error'); } catch {}
        } finally {
            setIsDeleting(false);
        }
    };

    if (isFormVisible && editingRequest) {
        return <LaptopRequestForm request={editingRequest} onSave={handleSave} onCancel={() => { setIsFormVisible(false); setEditingRequest(null); }} />
    }

    return (
        <div>
            <div className="admin-page-actions">
                {(!isLoading && laptopRequests.length >= 0) && (
                    <button className="btn btn-primary" onClick={handleAddNew}>Tambah Baru</button>
                )}
            </div>
            <div className="admin-grid">
                {isLoading && (
                    Array.from({ length: 6 }).map((_, i) => (<AdminRowSkeleton key={i} />))
                )}

                {!isLoading && laptopRequests.length === 0 && (
                    <div className="admin-empty-state">
                        <h3>Belum ada permintaan laptop</h3>
                        <p>Belum ada permintaan yang masuk.</p>
                    </div>
                )}

                {!isLoading && laptopRequests.length > 0 && (
                    laptopRequests.map((r) => (
                        <div key={r.id} className="admin-item-card">
                            <div className="admin-item-info">
                                <h3>{r.customer_name} — Dest: {r.destination_id}</h3>
                                <p>{r.customer_email || ''} · {r.customer_phone || ''}</p>
                                <p>{r.laptop_model || ''} {r.laptop_serial ? `• ${r.laptop_serial}` : ''}</p>
                                <p style={{ fontSize: '.9rem', color: 'var(--muted)' }}>{r.notes || ''}</p>
                            </div>
                            <div className="admin-item-actions">
                                <button className="btn-icon" onClick={() => handleEdit(r)} aria-label={`Edit request ${r.id}`}><EditIcon/></button>
                                <button className="btn-icon delete" onClick={() => handleDeleteRequest(r)} aria-label={`Hapus request ${r.id}`}><TrashIcon/></button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {requestToDelete && (
                <ConfirmationModal
                    isOpen={!!requestToDelete}
                    onClose={() => setRequestToDelete(null)}
                    onConfirm={handleConfirmDelete}
                    title="Konfirmasi Penghapusan"
                    confirmButtonText="Hapus"
                    confirmButtonVariant="danger"
                    isLoading={isDeleting}
                >
                    <p>Apakah Anda yakin ingin menghapus permintaan laptop dari <strong>{requestToDelete.customer_name}</strong>?</p>
                </ConfirmationModal>
            )}
        </div>
    );
};

export default AdminLaptopRequestsPage;
