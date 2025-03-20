import React from 'react';
import './App.css';
import { NostrProvider } from './contexts/NostrContext';
import NostrLogin from './components/auth/NostrLogin';
import Dashboard from './components/Dashboard';
import { useNostr } from './contexts/NostrContext';

// ContentArea component to conditionally render based on auth state
const ContentArea: React.FC = () => {
  const { isAuthenticated, isLoading } = useNostr();

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <div className="welcome-container">
      <h2>Welcome to the 3D Nostr Art Gallery</h2>
      <p>Please login with your Nostr extension to explore galleries or create your own.</p>
      <p className="info-text">This platform allows artists to showcase their work in immersive 3D spaces, powered by Nostr for decentralized authentication and storage.</p>
    </div>
  );
};

function App() {
  return (
    <NostrProvider>
      <div className="App">
        <header className="App-header">
          <h1>Nostr Art Gallery</h1>
          <NostrLogin />
        </header>
        <main>
          <ContentArea />
        </main>
      </div>
    </NostrProvider>
  );
}

export default App;
