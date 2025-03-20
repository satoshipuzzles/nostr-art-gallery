import React from 'react';
import GalleryViewer from './GalleryViewer';
import { Gallery, Artwork } from '../../types';

// Sample artwork data
const sampleArtworks: Artwork[] = [
  {
    id: '1',
    title: 'Abstract Dreams',
    description: 'A colorful abstract painting exploring the subconscious mind.',
    imageUrl: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=800&auto=format&fit=crop',
    price: { usd: 250 },
    forSale: true,
    artistId: 'demo-artist',
    createdAt: Date.now(),
    collectionId: 'sample-collection'
  },
  {
    id: '2',
    title: 'Ocean Whispers',
    description: 'A serene seascape capturing the tranquility of ocean waves.',
    imageUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&auto=format&fit=crop',
    price: { usd: 350, btc: 0.01 },
    forSale: true,
    artistId: 'demo-artist',
    createdAt: Date.now(),
    collectionId: 'sample-collection'
  },
  {
    id: '3',
    title: 'Urban Jungle',
    description: 'A dynamic cityscape highlighting the contrast between nature and urban life.',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop',
    price: { usd: 400 },
    forSale: true,
    artistId: 'demo-artist',
    createdAt: Date.now(),
    collectionId: 'sample-collection'
  },
  {
    id: '4',
    title: 'Serenity',
    description: 'A minimalist composition exploring themes of peace and balance.',
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&auto=format&fit=crop',
    price: { usd: 275, btc: 0.008 },
    forSale: true,
    artistId: 'demo-artist',
    createdAt: Date.now(),
    collectionId: 'sample-collection'
  }
];

// Sample gallery configuration
const sampleGallery: Gallery = {
  id: 'demo-gallery',
  title: 'Demo Exhibition',
  description: 'A sample gallery showing the capabilities of our 3D Nostr Art Gallery.',
  artistId: 'demo-artist',
  collections: ['sample-collection'],
  createdAt: Date.now(),
  roomLayout: {
    width: 15,
    height: 4,
    depth: 10,
    walls: [
      // Front wall
      {
        position: [0, 2, -5],
        rotation: [0, 0, 0],
        width: 15,
        height: 4,
        artworks: [
          { artworkId: '1', position: [-3, 0, 0.06] },
          { artworkId: '2', position: [3, 0, 0.06] }
        ]
      },
      // Left wall
      {
        position: [-7.5, 2, 0],
        rotation: [0, Math.PI / 2, 0],
        width: 10,
        height: 4,
        artworks: [
          { artworkId: '3', position: [0, 0, 0.06] }
        ]
      },
      // Right wall
      {
        position: [7.5, 2, 0],
        rotation: [0, -Math.PI / 2, 0],
        width: 10,
        height: 4,
        artworks: [
          { artworkId: '4', position: [0, 0, 0.06] }
        ]
      },
      // Back wall
      {
        position: [0, 2, 5],
        rotation: [0, Math.PI, 0],
        width: 15,
        height: 4,
        artworks: []
      }
    ]
  }
};

const DemoGallery: React.FC = () => {
  return (
    <div className="gallery-container">
      <h2>Welcome to the Demo Gallery</h2>
      <p>Explore this sample 3D gallery with interactive artwork. Click on any artwork to view details.</p>
      <GalleryViewer gallery={sampleGallery} artworks={sampleArtworks} />
    </div>
  );
};

export default DemoGallery; 