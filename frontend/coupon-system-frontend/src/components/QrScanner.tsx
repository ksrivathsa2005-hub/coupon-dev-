import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

// Define the props our component will accept
interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (errorMessage: string) => void;
}

// This is the div ID we'll use for the scanner
const scannerRegionId = 'qr-scanner-region';

export const QrScanner = ({ onScanSuccess, onScanFailure }: QrScannerProps) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Configuration for the scanner
    const config = {
      fps: 10, // Frames per second to scan
      qrbox: { width: 250, height: 250 }, // The size of the scanning box
      rememberLastUsedCamera: true,
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true,
    };

    // Create a new scanner instance
    const html5QrcodeScanner = new Html5QrcodeScanner(
      scannerRegionId,
      config,
      /* verbose= */ false
    );

    scannerRef.current = html5QrcodeScanner;

    // This function is called on successful scan
    const handleSuccess = (decodedText: string, decodedResult: any) => {
      // Stop the scanner and call the success prop
      html5QrcodeScanner.clear();
      onScanSuccess(decodedText);
    };

    // This function is called on scanning failure
    const handleError = (errorMessage: string) => {
      // Only call the callback if it's provided and if it's not a routine "no QR code found" message
      if (onScanFailure && !errorMessage.includes('No MultiFormat Readers')) {
        onScanFailure(errorMessage);
      }
    };

    // Start rendering the scanner
    html5QrcodeScanner.render(handleSuccess, handleError);

    // Cleanup function: This runs when the component is unmounted
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((error) => {
            console.error('Failed to clear html5QrcodeScanner.', error);
          });
      }
    };

    // We only want this effect to run once, but we include the callbacks
    // in the dependency array as per React's rules.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render the placeholder div that the library will use
  return (
    <div className="qr-scanner-container">
      <div id={scannerRegionId} className="qr-scanner-region" />
      
      <style>{`
        .qr-scanner-container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }

        .qr-scanner-region {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
                      0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        /* Style the scanner UI elements */
        #qr-scanner-region video {
          border-radius: 8px;
          width: 100% !important;
        }

        #qr-scanner-region__dashboard {
          background-color: var(--bs-light, #f8f9fa) !important;
          border-radius: 0 0 12px 12px;
          padding: 1rem !important;
        }

        #qr-scanner-region__dashboard_section {
          padding: 0.5rem 0 !important;
        }

        #qr-scanner-region__dashboard_section_csr button,
        #qr-scanner-region__dashboard_section_swaplink {
          background-color: var(--bs-primary, #0d6efd) !important;
          color: white !important;
          border: none !important;
          border-radius: 6px !important;
          padding: 0.5rem 1rem !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
          cursor: pointer !important;
        }

        #qr-scanner-region__dashboard_section_csr button:hover,
        #qr-scanner-region__dashboard_section_swaplink:hover {
          background-color: var(--bs-primary-dark, #0b5ed7) !important;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        #qr-scanner-region__header_message {
          background-color: var(--bs-info, #0dcaf0) !important;
          color: var(--bs-dark, #212529) !important;
          padding: 0.75rem !important;
          border-radius: 6px !important;
          margin-bottom: 1rem !important;
          font-weight: 500 !important;
        }

        #qr-scanner-region__camera_selection {
          width: 100% !important;
          padding: 0.5rem !important;
          border: 1px solid var(--bs-gray-300, #dee2e6) !important;
          border-radius: 6px !important;
          background-color: white !important;
          font-size: 0.875rem !important;
        }

        #qr-scanner-region__camera_selection:focus {
          outline: none !important;
          border-color: var(--bs-primary, #0d6efd) !important;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
        }

        /* Style the scan region box */
        #qr-shaded-region {
          border: 3px solid var(--bs-success, #198754) !important;
          box-shadow: 0 0 0 4px rgba(25, 135, 84, 0.2) !important;
        }

        /* Style permission request section */
        #qr-scanner-region__dashboard_section_csr > div {
          text-align: center !important;
          color: var(--bs-dark, #212529) !important;
        }

        /* Style file input section */
        #qr-scanner-region__dashboard_section_fsr {
          padding: 1rem !important;
          background-color: white !important;
          border-radius: 6px !important;
          margin-top: 0.5rem !important;
        }

        #qr-scanner-region__filescan_input {
          display: block !important;
          width: 100% !important;
          padding: 0.5rem !important;
          border: 2px dashed var(--bs-gray-400, #ced4da) !important;
          border-radius: 6px !important;
          background-color: var(--bs-light, #f8f9fa) !important;
          cursor: pointer !important;
        }

        #qr-scanner-region__filescan_input:hover {
          border-color: var(--bs-primary, #0d6efd) !important;
          background-color: rgba(13, 110, 253, 0.05) !important;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .qr-scanner-container {
            max-width: 100%;
            padding: 0 1rem;
          }

          #qr-scanner-region__dashboard_section_csr button {
            width: 100% !important;
            margin: 0.25rem 0 !important;
          }
        }
      `}</style>
    </div>
  );
};
