import { useState } from 'react';

export default function IndexNowTest() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const submitURL = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/indexnow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error: ' + error.message);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>IndexNow Test Page</h1>
      
      <div style={{ marginTop: '20px' }}>
        <label>Enter URL to submit:</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://streambackdrops.com/blog/your-post"
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '10px',
            fontSize: '16px'
          }}
        />
      </div>
      
      <button
        onClick={submitURL}
        disabled={loading}
        style={{
          marginTop: '20px',
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Submitting...' : 'Submit to IndexNow'}
      </button>
      
      {result && (
        <pre style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '5px',
          overflow: 'auto'
        }}>
          {result}
        </pre>
      )}
    </div>
  );
}