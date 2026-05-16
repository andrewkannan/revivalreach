export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100%' }}>
      <div className="spinner" style={{ 
        width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', 
        borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' 
      }}></div>
      <p style={{ marginTop: '16px', color: 'rgba(255,255,255,0.7)' }}>Loading Revival Reach...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
