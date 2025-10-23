export default function TestDebug() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#FF0000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      transform: 'translateZ(0)'
    }}>
      <h1 style={{
        color: '#FFFFFF',
        fontSize: '48px',
        fontWeight: 'bold',
        textAlign: 'center',
        padding: '20px'
      }}>
        TEST SEITE<br/>
        SIEHST DU DAS?
      </h1>
    </div>
  );
}
