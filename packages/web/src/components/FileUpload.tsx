interface FileUploadProps {
  onFileLoad: (file: File) => void;
}

export function FileUpload({ onFileLoad }: FileUploadProps) {
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
        Upload a scan report JSON file to visualize your AWS resources and costs.
      </p>
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
