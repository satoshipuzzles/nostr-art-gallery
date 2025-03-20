import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, NostrEvent, UnsignedEvent } from '../types';
import { nip19 } from 'nostr-tools';

// Use the global nostr interface from types/index.ts instead of redefining it here

// Define the Nostr context type
interface NostrContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  publishEvent: (kind: number, content: string, tags: string[][]) => Promise<NostrEvent | null>;
}

// Create the context with a default value
const NostrContext = createContext<NostrContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  publishEvent: async () => null,
});

// Custom hook for using the Nostr context
export const useNostr = () => useContext(NostrContext);

interface NostrProviderProps {
  children: ReactNode;
}

export const NostrProvider: React.FC<NostrProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedPubkey = localStorage.getItem('nostrPubkey');
        
        if (storedPubkey) {
          // If we have a stored pubkey, consider the user authenticated
          setUser({ pubkey: storedPubkey });
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login with NIP-07 browser extension
  const login = async () => {
    setIsLoading(true);
    
    try {
      // Check if the browser has a Nostr extension
      if (!window.nostr) {
        throw new Error('No Nostr extension found. Please install one like nos2x or Alby.');
      }

      // Get the public key from the extension
      const pubkey = await window.nostr.getPublicKey();
      
      // Store the pubkey for future sessions
      localStorage.setItem('nostrPubkey', pubkey);
      
      // Set the user state
      setUser({ pubkey });
      setIsAuthenticated(true);
      
      console.log(`Logged in with pubkey: ${pubkey}`);
      console.log(`NIP-19 npub: ${nip19.npubEncode(pubkey)}`);
      
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('nostrPubkey');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Publish a Nostr event
  const publishEvent = async (kind: number, content: string, tags: string[][] = []): Promise<NostrEvent | null> => {
    try {
      if (!window.nostr || !isAuthenticated) {
        throw new Error('Not authenticated or no Nostr extension available');
      }

      // Create an unsigned event
      const event: UnsignedEvent = {
        kind,
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content,
        pubkey: user?.pubkey || '',
      };

      // Sign the event using the browser extension
      const signedEvent = await window.nostr.signEvent(event);
      
      console.log('Published event:', signedEvent);
      
      return signedEvent;
    } catch (error) {
      console.error('Failed to publish event:', error);
      return null;
    }
  };

  const contextValue: NostrContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    publishEvent,
  };

  return (
    <NostrContext.Provider value={contextValue}>
      {children}
    </NostrContext.Provider>
  );
};

export default NostrContext; 