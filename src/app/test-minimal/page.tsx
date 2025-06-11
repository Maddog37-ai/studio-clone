export default function TestMinimal() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Minimal Test Page</h1>
      <p>This page should work without any UI library dependencies.</p>
      <p>If you can see this, the basic Next.js setup is working.</p>
      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '5px' 
      }}>
        <h2>Status Check:</h2>
        <ul>
          <li>✅ Next.js is running</li>
          <li>✅ TypeScript compilation is working</li>
          <li>✅ Basic routing is functional</li>
        </ul>
      </div>
    </div>
  );
}
