import React, { useState } from 'react';
import { Destination, BlogPost, Page, AppSettings } from '../../types';
import { AdminDashboardPage } from './AdminDashboardPage';
import { AdminDestinationsPage } from './AdminDestinationsPage';
import AdminLaptopRequestsPage from './AdminLaptopRequestsPage';
import { AdminBlogPage } from './AdminBlogPage';
import { AdminSettingsPage } from './AdminSettingsPage';
import { SunIcon, MoonIcon, MenuIcon, RefreshIcon } from '../../components/Icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../components/Toast';
import { NavLink, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

type AdminSubPage = 'dashboard' | 'destinations' | 'blog' | 'settings';

interface AdminLayoutProps {
    setPage: (page: Page) => void;
    onLogout: () => void;
    destinations: Destination[];
    blogPosts: BlogPost[];
    onSaveDestination: (destination: Destination) => void;
    onDeleteDestination: (id: number) => void;
    onSaveBlogPost: (post: BlogPost) => void;
    onDeleteBlogPost: (id: number) => void;
    appSettings: AppSettings;
    setAppSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
    onSaveSettings: (settings: AppSettings) => void;
    onRefresh?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
    setPage, onLogout, destinations, blogPosts,
    onSaveDestination, onDeleteDestination, onSaveBlogPost, onDeleteBlogPost,
    appSettings, setAppSettings, onSaveSettings, onRefresh
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const location = useLocation();

    // Defensive: props may be null at runtime (from API fetch); ensure safe defaults
    const safeDestinations = destinations ?? [];
    const safeBlogPosts = blogPosts ?? [];
    // orders removed from admin layout

    const supabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    const cloudinaryConfigured = !!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && !!import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    // Close sidebar automatically on navigation when in mobile / narrow view
    React.useEffect(() => {
        try {
            if (isSidebarOpen && typeof window !== 'undefined' && window.innerWidth <= 768) {
                setIsSidebarOpen(false);
            }
        } catch (e) {
            // ignore
        }
    }, [location.pathname]);

    const logoUrl = theme === 'dark'
        ? appSettings.logoDarkUrl || appSettings.logoLightUrl
        : appSettings.logoLightUrl || appSettings.logoDarkUrl;

    return (
        <>
            {isSidebarOpen && <div className="admin-sidebar-overlay visible" onClick={() => setIsSidebarOpen(false)}></div>}
            <div className="admin-layout">
                <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                    <div className="logo" role="button" tabIndex={0} onClick={() => { try { setPage && setPage('home'); } catch {} ; setIsSidebarOpen(false); navigate('/'); }} onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') { try { setPage && setPage('home'); } catch {} ; setIsSidebarOpen(false); navigate('/'); } }}>
                        {logoUrl ? <img src={logoUrl} alt={`${appSettings.brandName} Logo`} /> : appSettings.brandName}
                    </div>
                    <ul className="admin-nav">
                                        <li><NavLink to="/admin" end className={({isActive}) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>Dashboard</NavLink></li>
                                        <li><NavLink to="/admin/destinations" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>Destinasi</NavLink></li>
                                        <li><NavLink to="/admin/laptop-requests" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>Permintaan Laptop</NavLink></li>
                                        <li><NavLink to="/admin/blog" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>Blog</NavLink></li>
                                        <li><NavLink to="/admin/settings" className={({isActive}) => isActive ? 'active' : ''} onClick={() => setIsSidebarOpen(false)}>Pengaturan</NavLink></li>
                                    </ul>
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        <button onClick={() => { try { setPage && setPage('home'); } catch {} ; navigate('/'); }}>Kembali ke Situs</button>
                        <button onClick={onLogout}>Logout</button>
                    </div>
                </aside>
                <main className="admin-main">
                    {/* Non-blocking runtime warnings for missing env vars */}
                    {(!supabaseConfigured || !cloudinaryConfigured) && (
                        <div className="admin-env-warning">
                            <strong>Perhatian:</strong> Konfigurasi Supabase/Cloudinary belum lengkap. Cek README untuk setup.
                            <a href="/README.md" target="_blank" rel="noreferrer" style={{ marginLeft: '8px' }}>Lihat README</a>
                        </div>
                    )}
                    <div className="admin-header">
                         <button className="admin-hamburger" onClick={() => setIsSidebarOpen(true)}>
                            <MenuIcon />
                         </button>
                         <div className="admin-header-actions">
                            <button
                                className="btn-icon"
                                aria-label="Muat ulang data"
                                onClick={async () => {
                                    if (isRefreshing) return;
                                    setIsRefreshing(true);
                                    try {
                                        if (typeof onRefresh === 'function') {
                                            // Support promise-returning handlers
                                            const res = onRefresh();
                                            if (res && typeof (res as any).then === 'function') {
                                                await (res as any);
                                            }
                                        } else {
                                            window.location.reload();
                                        }
                                        try { showToast('Data berhasil dimuat ulang', 'success'); } catch {}
                                    } catch (err) {
                                        console.warn('Refresh failed', err);
                                        try { showToast('Gagal memuat ulang data', 'error'); } catch {}
                                    } finally {
                                        setIsRefreshing(false);
                                    }
                                }}
                                disabled={isRefreshing}
                              >
                                {isRefreshing ? <div className="spinner" aria-hidden /> : <RefreshIcon />}
                            </button>
                                                        <button
                                                                className="theme-toggle"
                                                                onClick={toggleTheme}
                                                                aria-label={theme === 'light' ? 'Ganti ke mode gelap' : 'Ganti ke mode terang'}
                                                            >
                                                                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                                                        </button>
                         </div>
                    </div>

                    <Routes>
                        <Route index element={<AdminDashboardPage destinationCount={safeDestinations.length} blogPostCount={safeBlogPosts.length} />} />
                        <Route path="destinations" element={<AdminDestinationsPage destinations={safeDestinations} onSave={onSaveDestination} onDelete={onDeleteDestination} />} />
                        <Route path="laptop-requests" element={<AdminLaptopRequestsPage laptopRequests={[]} onSave={async (r) => { try { await fetch('/api/upsert-laptop', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}` }, body: JSON.stringify(r) }); } catch(e) { console.warn('upsert laptop request failed', e); } }} onDelete={async (id) => { try { await fetch(`${import.meta.env.VITE_API_BASE || ''}/rest/v1/laptop_requests?id=eq.${id}`, { method: 'DELETE', headers: { 'apikey': import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''}` } }); } catch(e) { console.warn('delete laptop request failed', e); } }} />} />
                        <Route path="blog" element={<AdminBlogPage blogPosts={safeBlogPosts} onSave={onSaveBlogPost} onDelete={onDeleteBlogPost} />} />
                        {/* Orders section removed - invoice handling depends on orders and is disabled */}
                        {/* Note: public /invoice/:invoiceId route is registered at app-level (App.tsx) */}
                        <Route path="settings" element={<AdminSettingsPage appSettings={appSettings} onSaveSettings={onSaveSettings} />} />
                    </Routes>
                </main>
            </div>
        </>
    );
};