import React, { useState } from 'react';
import { useNostr } from '../contexts/NostrContext';
import DemoGallery from './gallery/DemoGallery';
import ArtworkUploadForm from './artwork/ArtworkUploadForm';
import AdminPanel from './admin/AdminPanel';

// List of admin pubkeys (must match the ones in AdminPanel)
const ADMIN_PUBKEYS = [
  '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245',
  '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d',
];

type TabType = 'gallery' | 'upload' | 'admin';

const Dashboard: React.FC = () => {
  const { user } = useNostr();
  const [activeTab, setActiveTab] = useState<TabType>('gallery');
  
  const isAdmin = user && ADMIN_PUBKEYS.includes(user.pubkey);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome, Artist!</h2>
        <p>Your public key: {user?.pubkey.substring(0, 8)}...{user?.pubkey.substring(user.pubkey.length - 8)}</p>
      </div>
      
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'gallery' ? 'active' : ''}`} 
          onClick={() => setActiveTab('gallery')}
        >
          Demo Gallery
        </button>
        <button 
          className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`} 
          onClick={() => setActiveTab('upload')}
        >
          Upload Artwork
        </button>
        {isAdmin && (
          <button 
            className={`tab-button ${activeTab === 'admin' ? 'active' : ''}`} 
            onClick={() => setActiveTab('admin')}
          >
            Admin Panel
          </button>
        )}
      </div>
      
      <div className="dashboard-content">
        {activeTab === 'gallery' && <DemoGallery />}
        {activeTab === 'upload' && <ArtworkUploadForm />}
        {activeTab === 'admin' && isAdmin && <AdminPanel />}
      </div>
    </div>
  );
};

export default Dashboard; 