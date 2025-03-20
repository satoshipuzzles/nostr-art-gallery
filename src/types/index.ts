export interface Artwork {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: {
    usd: number;
    btc?: number;
  };
  forSale: boolean;
  artistId: string;
  createdAt: number;
  collectionId: string;
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  artistId: string;
  artworks: string[]; // Array of artwork IDs
  createdAt: number;
}

export interface Gallery {
  id: string;
  title: string;
  description: string;
  artistId: string;
  collections: string[]; // Array of collection IDs
  roomLayout: RoomLayout;
  createdAt: number;
}

export interface RoomLayout {
  width: number;
  height: number;
  depth: number;
  walls: Wall[];
}

export interface Wall {
  position: [number, number, number]; // [x, y, z]
  rotation: [number, number, number]; // [x, y, z]
  width: number;
  height: number;
  artworks: {
    artworkId: string;
    position: [number, number, number]; // relative position on wall
  }[];
}

export interface User {
  pubkey: string;
  displayName?: string;
  about?: string;
  picture?: string;
  nip05?: string;
}

export interface NostrEvent {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
  sig: string;
}

export interface PaymentInfo {
  id: string;
  artworkId: string;
  buyerPubkey?: string;
  amount: {
    usd: number;
    btc?: number;
  };
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: 'stripe' | 'lightning';
  transactionId?: string;
  createdAt: number;
}

// Define the Nostr window extension interface
declare global {
  interface Window {
    nostr?: {
      getPublicKey(): Promise<string>;
      signEvent(event: UnsignedEvent): Promise<NostrEvent>;
      getRelays(): Promise<{ [url: string]: {read: boolean, write: boolean} }>;
      nip04: {
        encrypt(pubkey: string, plaintext: string): Promise<string>;
        decrypt(pubkey: string, ciphertext: string): Promise<string>;
      };
    };
  }
}

export interface UnsignedEvent {
  kind: number;
  created_at: number;
  pubkey: string;
  tags: string[][];
  content: string;
} 