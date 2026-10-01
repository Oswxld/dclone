const TEST_FILES = [
  { name: 'lottie.json', path: '/lottie.json' },
  { name: 'lottie 1.json', path: '/lottie 1.json' },
  { name: 'lottie 2.json', path: '/lottie 2.json' },
];

const SinglePlayer = ({ path, name }: { path: string; name: string }) => {
  return (
    <div style={{ border: '2px solid #00ffcc', padding: '16px', borderRadius: '12px', background: '#111', color: '#fff', textAlign: 'center' }}>
      <h3>{name}</h3>
      <div style={{ width: '250px', height: '250px', margin: '0 auto', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* @ts-ignore - Telling TypeScript to ignore the custom web component */}
        <lottie-player 
          src={path} 
          background="transparent"  
          speed="1"  
          style={{ width: '100%', height: '100%' }}
          loop  
          autoplay
        ></lottie-player>

      </div>
    </div>
  );
};

export const LottieTestSandbox = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '40px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#fff', textAlign: 'center', marginBottom: '30px' }}>Lottie Vanilla Sandbox 🧪</h1>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {TEST_FILES.map((file, idx) => (
          <SinglePlayer key={idx} path={file.path} name={file.name} />
        ))}
      </div>
    </div>
  );
};