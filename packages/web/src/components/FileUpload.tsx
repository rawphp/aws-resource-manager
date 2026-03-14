interface FileUploadProps {
  onFileLoad: (file: File) => void;
  onScan?: () => void;
  scanning?: boolean;
  scanError?: string | null;
}

export function FileUpload({ onFileLoad, onScan, scanning, scanError }: FileUploadProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '20px',
    }}>
      <h1 style={{ fontSize: '2rem', color: '#1a1a2e' }}>AWS Resource Manager</h1>
      <p style={{ color: '#666', maxWidth: '500px', textAlign: 'center' }}>
        Scan your AWS accounts or upload an existing report to visualize resources and costs.
      </p>
      {onScan && (
        <button
          onClick={onScan}
          disabled={scanning}
          style={{
            padding: '16px 32px',
            background: scanning ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: scanning ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 600,
            opacity: scanning ? 0.7 : 1,
          }}
        >
          {scanning ? 'Scanning...' : 'Scan AWS Accounts'}
        </button>
      )}
      {scanError && (
        <span style={{ color: '#dc3545', fontSize: '0.9rem' }}>{scanError}</span>
      )}
      <p style={{ color: '#999', fontSize: '0.85rem' }}>or</p>
      <label
        style={{
          padding: '16px 32px',
          background: '#4361ee',
          color: 'white',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        Upload Report JSON
        <input
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileLoad(file);
          }}
        />
      </label>
    </div>
  );
}
