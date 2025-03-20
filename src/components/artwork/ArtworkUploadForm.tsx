import React, { useState, FormEvent, useRef, ChangeEvent, useEffect } from 'react';
import { useNostr } from '../../contexts/NostrContext';
import NostrService from '../../services/NostrService';
import UploadService from '../../services/UploadService';
import { v4 as uuidv4 } from 'uuid';
import { Artwork } from '../../types';

const ArtworkUploadForm: React.FC = () => {
  const { user } = useNostr();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [priceUsd, setPriceUsd] = useState('');
  const [priceBtc, setPriceBtc] = useState('');
  const [forSale, setForSale] = useState(true);
  const [collectionId] = useState('sample-collection'); // We're not using this setter
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up object URLs when component unmounts or when previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        UploadService.revokeImagePreview(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to upload artwork');
      return;
    }
    
    if (!title) {
      setError('Title is required');
      return;
    }
    
    if (!imageUrl && !selectedFile) {
      setError('Either an image URL or file upload is required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      let finalImageUrl = imageUrl;
      
      // If we have a selected file but upload failed earlier, try uploading it now
      if (selectedFile && !imageUrl) {
        try {
          setUploadProgress(10);
          console.log('Attempting to upload image with pubkey:', user.pubkey);
          finalImageUrl = await UploadService.uploadImage(selectedFile, user.pubkey);
          console.log('Upload successful, got URL:', finalImageUrl);
          setUploadProgress(100);
          // Save the URL so it appears in the input
          setImageUrl(finalImageUrl);
        } catch (uploadErr) {
          console.error('Error during final upload attempt:', uploadErr);
          const errorMessage = uploadErr instanceof Error 
            ? uploadErr.message 
            : 'Could not upload image. Please provide a direct image URL instead.';
          setError(errorMessage);
          setIsSubmitting(false);
          return;
        }
      }
      
      // Create artwork object
      const artwork: Artwork = {
        id: uuidv4(),
        title,
        description,
        imageUrl: finalImageUrl,
        price: {
          usd: parseFloat(priceUsd) || 0,
          ...(priceBtc ? { btc: parseFloat(priceBtc) } : {})
        },
        forSale,
        artistId: user.pubkey,
        createdAt: Date.now(),
        collectionId
      };
      
      // Publish to Nostr
      const result = await NostrService.publishArtwork(artwork);
      
      if (result) {
        setSuccess(true);
        // Reset form
        setTitle('');
        setDescription('');
        setImageUrl('');
        setPriceUsd('');
        setPriceBtc('');
        setUploadProgress(0);
        setSelectedFile(null);
        
        // Clean up preview
        if (previewUrl) {
          UploadService.revokeImagePreview(previewUrl);
          setPreviewUrl(null);
        }
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError('Failed to publish artwork to Nostr');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Clean up previous preview if it exists
    if (previewUrl) {
      UploadService.revokeImagePreview(previewUrl);
    }
    
    // Create preview
    const preview = UploadService.createImagePreview(file);
    setPreviewUrl(preview);
    
    setSelectedFile(file);
    setIsUploading(true);
    setError(null);
    setUploadProgress(10); // Start progress

    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Simulate progress while uploading
    progressIntervalRef.current = setInterval(() => {
      setUploadProgress((prev) => {
        const next = prev + 10;
        return next > 90 ? 90 : next; // Cap at 90% until complete
      });
    }, 500);

    try {
      if (!user) {
        throw new Error('You must be logged in to upload images');
      }
      
      console.log('Starting upload to nostr.build with pubkey:', user.pubkey);
      // Upload the image
      const imageUrl = await UploadService.uploadImage(file, user.pubkey);
      console.log('Got image URL from nostr.build:', imageUrl);
      
      // Clear the interval when done
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      setUploadProgress(100);
      setImageUrl(imageUrl);
      setIsUploading(false);
    } catch (err) {
      console.error('Upload failed, details:', err);
      
      // Clear the interval on error
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      // Display a more specific error message based on the error
      const errorMessage = err instanceof Error
        ? `Upload failed: ${err.message}`
        : 'Upload failed for unknown reasons. Try again or enter URL manually.';
      
      setError(errorMessage);
      setIsUploading(false);
      setUploadProgress(0);
      // We keep the selectedFile state for retry during form submission
    }
  };
  
  // Cleanup interval on unmount
  React.useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);
  
  return (
    <div className="artwork-upload-form">
      <h2>Upload New Artwork</h2>
      
      {success && (
        <div className="success-message">
          Artwork uploaded successfully!
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title*</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Upload Image*</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={isUploading}
          />
          {isUploading && (
            <div className="upload-progress">
              <div 
                className="progress-bar" 
                style={{ width: `${uploadProgress}%` }}
              />
              <span>{uploadProgress}%</span>
            </div>
          )}
          {previewUrl && (
            <div className="image-preview">
              <img src={previewUrl} alt="Preview" />
            </div>
          )}
          {selectedFile && !imageUrl && !isUploading && !previewUrl && (
            <div className="file-selected">
              File selected: {selectedFile.name}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL*</label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg or nostr.build URL"
          />
          <small>
            {selectedFile && !imageUrl 
              ? "Upload failed. You can enter a URL manually or we'll try again on submission." 
              : "Either upload an image above or enter a URL here."}
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="priceUsd">Price (USD)</label>
          <input
            type="number"
            id="priceUsd"
            value={priceUsd}
            onChange={(e) => setPriceUsd(e.target.value)}
            step="0.01"
            min="0"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="priceBtc">Price (BTC) - Optional</label>
          <input
            type="number"
            id="priceBtc"
            value={priceBtc}
            onChange={(e) => setPriceBtc(e.target.value)}
            step="0.00000001"
            min="0"
          />
        </div>
        
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={forSale}
              onChange={(e) => setForSale(e.target.checked)}
            />
            For Sale
          </label>
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? 'Uploading...' : 'Upload Artwork'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArtworkUploadForm; 