import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Link2, Check, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

export function ImageUploadField({
  value = '',
  onChange,
  label = 'Image',
  aspectRatio = 'square', // 'square', 'banner', 'wide'
  helperText = 'Upload from your device (JPG, PNG, WebP) or paste an image URL'
}) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState(value);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit. Please choose a smaller photo.');
      return;
    }

    setUploadError('');
    setUploading(true);

    try {
      // 1. Read as Data URL
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target.result;

        try {
          // 2. Upload to backend
          const res = await api.post('/upload', {
            image: base64Data,
            filename: file.name
          });

          if (res.success && res.url) {
            onChange(res.url);
            setManualUrl(res.url);
          } else {
            // Fallback to data URL
            onChange(base64Data);
            setManualUrl(base64Data);
          }
        } catch (uploadErr) {
          console.warn('Backend upload failed, using local image data:', uploadErr);
          onChange(base64Data);
          setManualUrl(base64Data);
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        setUploadError('Failed to read file from your device.');
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    setManualUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleManualApply = () => {
    if (manualUrl) {
      onChange(manualUrl.trim());
      setShowUrlInput(false);
    }
  };

  const previewHeight = aspectRatio === 'banner' ? '120px' : aspectRatio === 'wide' ? '140px' : '100px';

  return (
    <div style={{ marginBottom: '18px' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '0.86rem',
          fontWeight: 600,
          color: '#1F241C',
          marginBottom: '6px'
        }}>
          {label}
        </label>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Main Upload Box / Preview Area */}
      <div style={{
        border: '1.5px dashed #C8D3BC',
        borderRadius: '14px',
        backgroundColor: '#FAFBF8',
        padding: '16px',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}>
        {value ? (
          /* Preview Mode */
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{
              width: aspectRatio === 'banner' ? '180px' : '100px',
              height: previewHeight,
              borderRadius: '10px',
              overflow: 'hidden',
              backgroundColor: '#EAEFE4',
              border: '1px solid #DCE4D4',
              flexShrink: 0,
              position: 'relative'
            }}>
              <img
                src={value}
                alt="Selected"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'; }}
              />
            </div>

            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2E7D32', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                <Check size={15} /> Image Ready
              </div>
              <div style={{ fontSize: '0.76rem', color: '#6A785E', wordBreak: 'break-all', maxHeight: '36px', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '10px' }}>
                {value.startsWith('data:') ? 'Local file from device' : value}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    backgroundColor: '#85926B',
                    color: '#FFF',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                  {uploading ? 'Uploading...' : 'Replace File'}
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  style={{
                    backgroundColor: '#FFEBEE',
                    color: '#C62828',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <X size={13} /> Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty / Upload Prompt State */
          <div style={{ textAlign: 'center', padding: '12px 8px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#EBF0E4',
              color: '#556149',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px'
            }}>
              {uploading ? <Loader2 size={22} className="animate-spin" /> : <UploadCloud size={22} />}
            </div>

            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F241C', marginBottom: '4px' }}>
              {uploading ? 'Processing Image...' : 'Select image from your device'}
            </p>
            <p style={{ fontSize: '0.78rem', color: '#7E8775', marginBottom: '14px' }}>
              {helperText}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  backgroundColor: '#85926B',
                  color: '#FFFFFF',
                  padding: '8px 18px',
                  borderRadius: '20px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(133,146,107,0.3)'
                }}
              >
                <UploadCloud size={15} /> Choose from Device
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #DCE4D4',
                  color: '#475234',
                  padding: '8px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Link2 size={14} /> Paste URL
              </button>
            </div>
          </div>
        )}

        {/* Manual URL Input Fallback Drawer */}
        {showUrlInput && (
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #ECEEE8',
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.82rem', padding: '8px 12px' }}
            />
            <button
              type="button"
              onClick={handleManualApply}
              style={{
                backgroundColor: '#475234',
                color: '#FFF',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                flexShrink: 0
              }}
            >
              Apply
            </button>
          </div>
        )}

        {uploadError && (
          <div style={{ color: '#C62828', fontSize: '0.78rem', marginTop: '8px', textAlign: 'center' }}>
            {uploadError}
          </div>
        )}
      </div>
    </div>
  );
}
