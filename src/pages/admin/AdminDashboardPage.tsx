import React from 'react';

interface AdminDashboardPageProps {
    destinationCount: number;
    blogPostCount: number;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ destinationCount, blogPostCount }) => {
    return (
        <div>
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3>Total Destinasi</h3>
                    <p className="count">{destinationCount}</p>
                </div>
                <div className="dashboard-card">
                    <h3>Total Artikel Blog</h3>
                    <p className="count">{blogPostCount}</p>
                </div>
                {/* Orders statistics removed */}
            </div>
        </div>
    );
};