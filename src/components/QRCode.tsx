'use client';

import { useState, useEffect } from 'react';

interface QRCodeProps {
  url: string;
  size?: number;
}

export function QRCode({ url, size = 200 }: QRCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    // Simple QR code generation using a free API
    const generateQR = async () => {
      try {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
        setQrDataUrl(qrUrl);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      }
    };

    generateQR();
  }, [url, size]);

  if (!qrDataUrl) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-blue"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={qrDataUrl} 
          alt="QR Code" 
          className="block"
          style={{ width: size, height: size }}
        />
      </div>
      <p className="text-sm text-gray-300 text-center max-w-xs">
        Scan this QR code with your phone to easily share the link
      </p>
    </div>
  );
}
