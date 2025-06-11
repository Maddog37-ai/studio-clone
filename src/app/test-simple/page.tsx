export default function TestSimplePage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Simple Test Page</h1>
      <p>If you can see this, the Next.js server is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <div style={{ background: '#f0f0f0', padding: '10px', marginTop: '20px' }}>
        <h2>Feature Status:</h2>
        <ul>
          <li>✅ Badge notifications implemented</li>
          <li>✅ In Process Leads visibility for setters</li>
          <li>✅ Verification checkbox functionality</li>
        </ul>
      </div>
    </div>
  );
}
