import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Gallery, Artwork, Wall } from '../../types';

// Floor component
const Floor: React.FC<{ width: number; depth: number }> = ({ width, depth }) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color="#f0f0f0" roughness={0.4} metalness={0.1} />
    </mesh>
  );
};

// Ceiling component
const Ceiling: React.FC<{ width: number; depth: number; height: number }> = ({ 
  width, 
  depth, 
  height 
}) => {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]} receiveShadow>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color="#ffffff" roughness={0.5} />
    </mesh>
  );
};

// Wall component
const WallComponent: React.FC<{ 
  wall: Wall; 
  artworks: Artwork[];
  onArtworkClick: (artwork: Artwork) => void;
}> = ({ 
  wall, 
  artworks,
  onArtworkClick
}) => {
  const { position, rotation, width, height } = wall;

  return (
    <group position={new THREE.Vector3(...position)} rotation={new THREE.Euler(...rotation)}>
      {/* Wall plane */}
      <mesh receiveShadow>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>

      {/* Artworks on wall */}
      {wall.artworks.map((wallArtwork) => {
        const artwork = artworks.find(a => a.id === wallArtwork.artworkId);
        
        if (!artwork) return null;
        
        // Scaling factors for the artwork frame
        const frameWidth = 2;
        const frameHeight = 2 * (9/16); // Assuming 16:9 ratio
        const frameDepth = 0.1;
        
        return (
          <group 
            key={artwork.id} 
            position={new THREE.Vector3(...wallArtwork.position)}
            onClick={(e) => {
              e.stopPropagation();
              onArtworkClick(artwork);
            }}
          >
            {/* Artwork frame */}
            <mesh castShadow>
              <boxGeometry args={[frameWidth + 0.1, frameHeight + 0.1, frameDepth]} />
              <meshStandardMaterial color="#8B4513" roughness={0.4} />
            </mesh>
            
            {/* Artwork image */}
            <ArtworkImage 
              position={[0, 0, frameDepth/2 + 0.01]} 
              width={frameWidth} 
              height={frameHeight} 
              url={artwork.imageUrl} 
            />
            
            {/* Artwork title */}
            <Text
              position={[0, -frameHeight/2 - 0.2, 0.1]}
              color="black"
              fontSize={0.15}
              maxWidth={frameWidth}
              textAlign="center"
            >
              {artwork.title}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

// Artwork image with texture
const ArtworkImage: React.FC<{
  position: [number, number, number];
  width: number;
  height: number;
  url: string;
}> = ({ position, width, height, url }) => {
  const texture = useTexture(url);
  
  return (
    <mesh position={new THREE.Vector3(...position)}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Camera controls
const CameraController: React.FC = () => {
  const { camera } = useThree();
  // Use the correct type for OrbitControls
  const controlsRef = useRef<any>(null);
  
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });
  
  return (
    <OrbitControls
      ref={controlsRef}
      camera={camera}
      enableDamping
      dampingFactor={0.1}
      rotateSpeed={0.5}
      minDistance={1}
      maxDistance={10}
      maxPolarAngle={Math.PI / 2}
    />
  );
};

// Lights for the scene
const Lights: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} />
    </>
  );
};

// Main Gallery component
interface GalleryViewerProps {
  gallery: Gallery;
  artworks: Artwork[];
}

const GalleryViewer: React.FC<GalleryViewerProps> = ({ gallery, artworks }) => {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  
  const handleArtworkClick = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
  };
  
  const handleCloseDetails = () => {
    setSelectedArtwork(null);
  };
  
  return (
    <div style={{ width: '100%', height: '80vh', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 75 }}>
        <CameraController />
        <Lights />
        
        <Floor 
          width={gallery.roomLayout.width} 
          depth={gallery.roomLayout.depth} 
        />
        
        <Ceiling 
          width={gallery.roomLayout.width} 
          depth={gallery.roomLayout.depth} 
          height={gallery.roomLayout.height} 
        />
        
        {gallery.roomLayout.walls.map((wall, index) => (
          <WallComponent 
            key={index} 
            wall={wall} 
            artworks={artworks}
            onArtworkClick={handleArtworkClick}
          />
        ))}
      </Canvas>
      
      {/* Artwork details overlay */}
      {selectedArtwork && (
        <div 
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <button 
            onClick={handleCloseDetails}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
          <h2>{selectedArtwork.title}</h2>
          <p>{selectedArtwork.description}</p>
          {selectedArtwork.forSale && (
            <div>
              <p>Price: ${selectedArtwork.price.usd} USD</p>
              {selectedArtwork.price.btc && (
                <p>BTC Price: {selectedArtwork.price.btc} BTC</p>
              )}
              <button 
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  padding: '10px 15px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Purchase
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GalleryViewer; 