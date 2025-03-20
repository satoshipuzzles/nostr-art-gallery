# 3D Nostr Art Gallery

A Shopify-like platform for artists to showcase and sell their artwork in virtual 3D galleries, with all authentication and data storage powered by Nostr and payments handled through both traditional and Bitcoin channels.

## Features

- **Nostr Authentication**: Secure login using Nostr browser extensions (NIP-07)
- **3D Gallery Experience**: Explore art in immersive 3D rooms
- **Decentralized Data Storage**: All artwork metadata stored on Nostr relays
- **Multi-Payment Options**: Support for credit card (Stripe) and Bitcoin Lightning Network
- **Artist Dashboard**: Upload artwork, organize collections, and manage sales

## Technologies Used

- **Frontend**: React with TypeScript
- **3D Rendering**: Three.js and React Three Fiber
- **Authentication**: Nostr protocol via NIP-07 browser extensions
- **Data Storage**: Nostr relays with custom event kinds
- **Image Hosting**: nostr.build
- **Payment Processing**: Stripe and LNbits (planned)

## Getting Started

### Prerequisites

- Node.js and npm
- A Nostr browser extension (like [Alby](https://getalby.com/) or [nos2x](https://github.com/fiatjaf/nos2x))

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/nostr-art-gallery.git
   cd nostr-art-gallery
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### For Artists

1. Authenticate with your Nostr key
2. Upload artwork and organize it into themed collections
3. Create 3D galleries to showcase your collections
4. Set prices in USD and/or BTC
5. Track sales and inventory

### For Visitors

1. Browse 3D galleries
2. Click on artwork to see details
3. Purchase using credit card or Bitcoin Lightning Network
4. Save favorite artists and galleries

## Project Structure

- `/src/components`: UI components
  - `/auth`: Authentication components
  - `/gallery`: 3D gallery components
  - `/artwork`: Artwork display and management components
  - `/payment`: Payment processing components
- `/src/contexts`: React contexts for state management
- `/src/services`: Services for Nostr and payment interactions
- `/src/types`: TypeScript type definitions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Nostr Protocol](https://github.com/nostr-protocol/nostr)
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber)
- [Three.js](https://threejs.org/)
