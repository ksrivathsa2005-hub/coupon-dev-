import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (errorMessage: string) => void;
}

const scannerRegionId = 'qr-scanner-region';

export const QrScanner = ({ onScanSuccess, onScanFailure }: QrScannerProps) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // 🧹 FIX: Manually clear the container before initialization.
    // This prevents the "Double Camera" issue caused by React Strict Mode.
    const container = document.getElementById(scannerRegionId);
    if (container) {
      container.innerHTML = "";
    }

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true,
    };

    const html5QrcodeScanner = new Html5QrcodeScanner(
      scannerRegionId,
      config,
      false
    );
    scannerRef.current = html5QrcodeScanner;

    const handleSuccess = (decodedText: string) => {
      html5QrcodeScanner.clear();
      onScanSuccess(decodedText);
    };

    const handleError = (errorMessage: string) => {
      if (onScanFailure && !errorMessage.includes('No MultiFormat Readers')) {
        onScanFailure(errorMessage);
      }
    };

    html5QrcodeScanner.render(handleSuccess, handleError);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => console.error('Failed to clear scanner', error));
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div className="qr-scanner-container">
      <div id={scannerRegionId} className="qr-scanner-region" />
      <style>{`
        .qr-scanner-container { width: 100%; max-width: 600px; margin: 0 auto; }
        .qr-scanner-region { border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        #qr-scanner-region video { border-radius: 8px; width: 100% !important; }
        #qr-scanner-region__dashboard { background-color: #f8f9fa !important; padding: 1rem !important; }
        #qr-scanner-region__dashboard_section_csr button { background-color: #0d6efd !important; color: white !important; border: none !important; border-radius: 6px !important; padding: 0.5rem 1rem !important; }
      `}</style>
    </div>
  );
};