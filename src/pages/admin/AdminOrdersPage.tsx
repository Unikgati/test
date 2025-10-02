import React from 'react';

// Admin Orders feature has been archived. This placeholder keeps the route/file
// present so imports don't break elsewhere. The real implementation is moved to
// src/pages/admin/_archived/AdminOrdersPage.tsx

export const AdminOrdersPage: React.FC = () => {
  return (
    <div className="admin-card">
      <p>Fitur pemesanan internal telah dinonaktifkan. Gunakan tombol "Pesan" pada halaman destinasi untuk menghubungi via WhatsApp.</p>
      <p>Implementasi lama disimpan di <code>src/pages/admin/_archived/AdminOrdersPage.tsx</code> jika diperlukan.</p>
    </div>
  );
};