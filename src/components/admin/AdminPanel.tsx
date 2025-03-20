import React, { useState, useEffect } from 'react';
import { useNostr } from '../../contexts/NostrContext';
import NostrService from '../../services/NostrService';
import { Artwork } from '../../types';

// List of admin pubkeys (in a real app, this would be stored in a database or config file)
const ADMIN_PUBKEYS = [
  // Add your admin pubkeys here (these are examples)
  '32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245', // Example admin 1
  '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d', // Example admin 2
];

interface ArtworkRowProps {
  artwork: Artwork;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onFeature: (id: string) => void;
}

const ArtworkRow: React.FC<ArtworkRowProps> = ({ artwork, onApprove, onReject, onFeature }) => {
  return (
    <tr>
      <td>{artwork.title}</td>
      <td>{artwork.artistId.slice(0, 8)}...</td>
      <td>
        <a href={artwork.imageUrl} target="_blank" rel="noopener noreferrer">
          View
        </a>
      </td>
      <td>${artwork.price.usd.toFixed(2)}</td>
      <td>{new Date(artwork.createdAt).toLocaleDateString()}</td>
      <td>
        <div className="admin-actions">
          <button 
            className="control-btn approve-btn" 
            onClick={() => onApprove(artwork.id)}
          >
            Approve
          </button>
          <button 
            className="control-btn reject-btn" 
            onClick={() => onReject(artwork.id)}
          >
            Reject
          </button>
          <button 
            className="control-btn feature-btn" 
            onClick={() => onFeature(artwork.id)}
          >
            Feature
          </button>
        </div>
      </td>
    </tr>
  );
};

const AdminPanel: React.FC = () => {
  const { user } = useNostr();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalArtworks: 0,
    totalArtists: 0,
    totalSales: 0,
    pendingArtworks: 0,
  });
  
  const isAdmin = user && ADMIN_PUBKEYS.includes(user.pubkey);
  
  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        // In a real implementation, you would fetch all artworks, not just for one artist
        // For this demo, we'll just fetch the current user's artworks
        const fetchedArtworks = await NostrService.getArtworksByArtist(user!.pubkey);
        setArtworks(fetchedArtworks);
        
        // Calculate stats
        const uniqueArtists = new Set(fetchedArtworks.map(art => art.artistId));
        setStats({
          totalArtworks: fetchedArtworks.length,
          totalArtists: uniqueArtists.size,
          totalSales: 0, // In a real app, you would track actual sales
          pendingArtworks: fetchedArtworks.length, // Assuming all are pending for this demo
        });
      } catch (error) {
        console.error('Error fetching artworks for admin panel:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArtworks();
  }, [isAdmin, user]);
  
  // Admin actions
  const handleApproveArtwork = async (id: string) => {
    // In a real implementation, you would update the artwork's status in your backend
    alert(`Artwork ${id} approved`);
  };
  
  const handleRejectArtwork = async (id: string) => {
    // In a real implementation, you would update the artwork's status in your backend
    alert(`Artwork ${id} rejected`);
  };
  
  const handleFeatureArtwork = async (id: string) => {
    // In a real implementation, you would mark this artwork as featured
    alert(`Artwork ${id} featured`);
  };
  
  if (!isAdmin) {
    return (
      <div className="admin-panel">
        <h2>Admin Panel</h2>
        <p>You do not have access to this page. Only administrators can view this content.</p>
      </div>
    );
  }
  
  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      
      <div className="admin-section">
        <h3>Gallery Statistics</h3>
        <div className="admin-stats">
          <div className="stat-card">
            <h3>Total Artworks</h3>
            <div className="value">{stats.totalArtworks}</div>
          </div>
          <div className="stat-card">
            <h3>Total Artists</h3>
            <div className="value">{stats.totalArtists}</div>
          </div>
          <div className="stat-card">
            <h3>Total Sales</h3>
            <div className="value">${stats.totalSales}</div>
          </div>
          <div className="stat-card">
            <h3>Pending Approval</h3>
            <div className="value">{stats.pendingArtworks}</div>
          </div>
        </div>
      </div>
      
      <div className="admin-section">
        <h3>Content Moderation</h3>
        {loading ? (
          <p>Loading artworks...</p>
        ) : (
          <>
            {artworks.length === 0 ? (
              <p>No artworks available for moderation</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Artist</th>
                    <th>Image</th>
                    <th>Price</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {artworks.map(artwork => (
                    <ArtworkRow 
                      key={artwork.id}
                      artwork={artwork}
                      onApprove={handleApproveArtwork}
                      onReject={handleRejectArtwork}
                      onFeature={handleFeatureArtwork}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
      
      <div className="admin-section">
        <h3>Featured Galleries</h3>
        <p>In a full implementation, you would be able to manage featured galleries here.</p>
        <button className="control-btn">Add Featured Gallery</button>
      </div>
      
      <div className="admin-section">
        <h3>System Settings</h3>
        <p>In a full implementation, you would be able to configure system settings here.</p>
      </div>
    </div>
  );
};

export default AdminPanel; 