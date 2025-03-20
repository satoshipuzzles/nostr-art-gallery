import React, { useState } from 'react';
import { useNostr } from '../../contexts/NostrContext';

const NostrLogin: React.FC = () => {
  const { isAuthenticated, user, login, logout, isLoading } = useNostr();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setError(null);
      await login();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login with Nostr');
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="nostr-login">
      {isLoading ? (
        <div>Loading...</div>
      ) : isAuthenticated ? (
        <div>
          <p>Logged in as: {user?.pubkey ? user.pubkey.substring(0, 8) + '...' : 'Unknown'}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <button onClick={handleLogin}>Login with Nostr</button>
          {error && <p className="error">{error}</p>}
          {!window.nostr && (
            <p className="warning">
              No Nostr extension detected. Please install one like{' '}
              <a href="https://getalby.com/" target="_blank" rel="noopener noreferrer">
                Alby
              </a>{' '}
              or{' '}
              <a href="https://github.com/nostr-protocol/nips/blob/master/07.md" target="_blank" rel="noopener noreferrer">
                another NIP-07 compatible extension
              </a>
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default NostrLogin;
