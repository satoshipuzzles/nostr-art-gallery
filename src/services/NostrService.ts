import { Artwork, Collection, Gallery, NostrEvent } from '../types';
import { SimplePool, nip19 } from 'nostr-tools';

// Custom event kind for artwork events (needs to be above 10000 for custom kinds)
export const NOSTR_KIND_ARTWORK = 420420420;
export const NOSTR_KIND_COLLECTION = 420420421;
export const NOSTR_KIND_GALLERY = 420420422;

// Define types that were missing from nostr-tools
interface NostrEventWithContent extends NostrEvent {
  content: string;
}

// Define Filter type since it's not exported from nostr-tools
interface NostrFilter {
  kinds?: number[];
  authors?: string[];
  [key: `#${string}`]: string[];
}

// Relays to publish and read from
const RELAYS = [
  'wss://relay.damus.io',
  'wss://nostr.wine',
  'wss://relay.nostr.band',
  'wss://nos.lol',
];

class NostrService {
  private pool: SimplePool;

  constructor() {
    this.pool = new SimplePool();
  }

  // Publish an artwork event
  async publishArtwork(artwork: Artwork): Promise<string | null> {
    if (!window.nostr) {
      throw new Error('No Nostr extension found');
    }

    try {
      // Create event content
      const content = JSON.stringify(artwork);

      // Create tags for easier filtering
      const tags = [
        ['d', artwork.id], // Unique identifier
        ['title', artwork.title],
        ['collection', artwork.collectionId],
        ['price', artwork.price.usd.toString()],
        ['type', 'artwork'],
      ];

      // Create the event
      const event = {
        kind: NOSTR_KIND_ARTWORK,
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content,
        pubkey: artwork.artistId,
      };

      // Sign the event using the browser extension
      const signedEvent = await window.nostr.signEvent(event);
      
      // Publish to relays
      const pubs = this.pool.publish(RELAYS, signedEvent);
      
      // Wait for at least one relay to accept the event
      await Promise.any(pubs);
      
      return signedEvent.id;
    } catch (error) {
      console.error('Error publishing artwork:', error);
      return null;
    }
  }

  // Publish a collection event
  async publishCollection(collection: Collection): Promise<string | null> {
    if (!window.nostr) {
      throw new Error('No Nostr extension found');
    }

    try {
      // Create event content
      const content = JSON.stringify(collection);

      // Create tags for easier filtering
      const tags = [
        ['d', collection.id], // Unique identifier
        ['title', collection.title],
        ['type', 'collection'],
      ];

      // Add artworks as tags
      collection.artworks.forEach(artworkId => {
        tags.push(['artwork', artworkId]);
      });

      // Create the event
      const event = {
        kind: NOSTR_KIND_COLLECTION,
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content,
        pubkey: collection.artistId,
      };

      // Sign the event using the browser extension
      const signedEvent = await window.nostr.signEvent(event);
      
      // Publish to relays
      const pubs = this.pool.publish(RELAYS, signedEvent);
      
      // Wait for at least one relay to accept the event
      await Promise.any(pubs);
      
      return signedEvent.id;
    } catch (error) {
      console.error('Error publishing collection:', error);
      return null;
    }
  }

  // Publish a gallery event
  async publishGallery(gallery: Gallery): Promise<string | null> {
    if (!window.nostr) {
      throw new Error('No Nostr extension found');
    }

    try {
      // Create event content
      const content = JSON.stringify(gallery);

      // Create tags for easier filtering
      const tags = [
        ['d', gallery.id], // Unique identifier
        ['title', gallery.title],
        ['type', 'gallery'],
      ];

      // Add collections as tags
      gallery.collections.forEach(collectionId => {
        tags.push(['collection', collectionId]);
      });

      // Create the event
      const event = {
        kind: NOSTR_KIND_GALLERY,
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content,
        pubkey: gallery.artistId,
      };

      // Sign the event using the browser extension
      const signedEvent = await window.nostr.signEvent(event);
      
      // Publish to relays
      const pubs = this.pool.publish(RELAYS, signedEvent);
      
      // Wait for at least one relay to accept the event
      await Promise.any(pubs);
      
      return signedEvent.id;
    } catch (error) {
      console.error('Error publishing gallery:', error);
      return null;
    }
  }

  // Fetch artworks by artist
  async getArtworksByArtist(artistId: string): Promise<Artwork[]> {
    try {
      const filter: NostrFilter = {
        kinds: [NOSTR_KIND_ARTWORK],
        authors: [artistId],
        "#type": ["artwork"],
      };

      const events = await this.pool.querySync(RELAYS, filter);
      
      return events.map((event: NostrEventWithContent) => {
        try {
          return JSON.parse(event.content) as Artwork;
        } catch (e) {
          console.error('Error parsing artwork event:', e);
          return null;
        }
      }).filter((artwork: Artwork | null): artwork is Artwork => artwork !== null);
    } catch (error) {
      console.error('Error fetching artworks:', error);
      return [];
    }
  }

  // Fetch collections by artist
  async getCollectionsByArtist(artistId: string): Promise<Collection[]> {
    try {
      const filter: NostrFilter = {
        kinds: [NOSTR_KIND_COLLECTION],
        authors: [artistId],
        "#type": ["collection"],
      };

      const events = await this.pool.querySync(RELAYS, filter);
      
      return events.map((event: NostrEventWithContent) => {
        try {
          return JSON.parse(event.content) as Collection;
        } catch (e) {
          console.error('Error parsing collection event:', e);
          return null;
        }
      }).filter((collection: Collection | null): collection is Collection => collection !== null);
    } catch (error) {
      console.error('Error fetching collections:', error);
      return [];
    }
  }

  // Fetch galleries by artist
  async getGalleriesByArtist(artistId: string): Promise<Gallery[]> {
    try {
      const filter: NostrFilter = {
        kinds: [NOSTR_KIND_GALLERY],
        authors: [artistId],
        "#type": ["gallery"],
      };

      const events = await this.pool.querySync(RELAYS, filter);
      
      return events.map((event: NostrEventWithContent) => {
        try {
          return JSON.parse(event.content) as Gallery;
        } catch (e) {
          console.error('Error parsing gallery event:', e);
          return null;
        }
      }).filter((gallery: Gallery | null): gallery is Gallery => gallery !== null);
    } catch (error) {
      console.error('Error fetching galleries:', error);
      return [];
    }
  }

  // Get a specific artwork by ID
  async getArtworkById(id: string): Promise<Artwork | null> {
    try {
      const filter: NostrFilter = {
        kinds: [NOSTR_KIND_ARTWORK],
        "#d": [id],
      };

      const events = await this.pool.querySync(RELAYS, filter);
      
      if (events.length === 0) {
        return null;
      }
      
      // Use the most recent event
      const latestEvent = events.sort((a: NostrEventWithContent, b: NostrEventWithContent) => b.created_at - a.created_at)[0];
      
      return JSON.parse(latestEvent.content) as Artwork;
    } catch (error) {
      console.error('Error fetching artwork by ID:', error);
      return null;
    }
  }

  // Get a specific collection by ID
  async getCollectionById(id: string): Promise<Collection | null> {
    try {
      const filter: NostrFilter = {
        kinds: [NOSTR_KIND_COLLECTION],
        "#d": [id],
      };

      const events = await this.pool.querySync(RELAYS, filter);
      
      if (events.length === 0) {
        return null;
      }
      
      // Use the most recent event
      const latestEvent = events.sort((a: NostrEventWithContent, b: NostrEventWithContent) => b.created_at - a.created_at)[0];
      
      return JSON.parse(latestEvent.content) as Collection;
    } catch (error) {
      console.error('Error fetching collection by ID:', error);
      return null;
    }
  }

  // Get a specific gallery by ID
  async getGalleryById(id: string): Promise<Gallery | null> {
    try {
      const filter: NostrFilter = {
        kinds: [NOSTR_KIND_GALLERY],
        "#d": [id],
      };

      const events = await this.pool.querySync(RELAYS, filter);
      
      if (events.length === 0) {
        return null;
      }
      
      // Use the most recent event
      const latestEvent = events.sort((a: NostrEventWithContent, b: NostrEventWithContent) => b.created_at - a.created_at)[0];
      
      return JSON.parse(latestEvent.content) as Gallery;
    } catch (error) {
      console.error('Error fetching gallery by ID:', error);
      return null;
    }
  }

  // Helper to convert a pubkey to npub format
  pubkeyToNpub(pubkey: string): string {
    return nip19.npubEncode(pubkey);
  }

  // Helper to convert npub to pubkey
  npubToPubkey(npub: string): string {
    try {
      const { data } = nip19.decode(npub);
      return data as string;
    } catch (error) {
      console.error('Error decoding npub:', error);
      return '';
    }
  }
}

// Create a variable for the service before exporting
const nostrService = new NostrService();
export default nostrService; 