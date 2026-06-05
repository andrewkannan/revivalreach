"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ padding: '50px', maxWidth: '800px', margin: '0 auto', fontFamily: 'monospace', color: 'var(--foreground)' }}>
      <h1 style={{ color: '#ff4444' }}>Something went wrong!</h1>
      <p>A server error occurred. Please screenshot this and send it to the developer:</p>
      
      <div style={{ background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '8px', overflowX: 'auto', marginTop: '20px' }}>
        <strong>Error Message:</strong> {error.message}
        <br /><br />
        <strong>Digest ID:</strong> {error.digest || 'None'}
        <br /><br />
        <strong>Stack Trace:</strong>
        <pre>{error.stack}</pre>
      </div>
      
      <button
        onClick={() => reset()}
        style={{ marginTop: '20px', padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
      >
        Try again
      </button>
    </div>
  )
}
