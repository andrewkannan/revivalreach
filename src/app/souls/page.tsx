export default function SoulsPage() {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', width: '100%', textAlign: 'center', color: 'white' }}>
      <div className="glass-panel" style={{ padding: '50px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
          </svg>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Souls</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>Coming Soon</p>
      </div>
    </div>
  );
}
