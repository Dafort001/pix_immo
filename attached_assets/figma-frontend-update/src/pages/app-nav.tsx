import { Link } from 'wouter';
import { ArrowLeft, Home } from 'lucide-react';

export default function AppNav() {
  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      overflow: 'auto'
    }}>
      {/* Navigation Bar */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto 30px auto',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <Link href="/admin-dashboard">
          <button style={{
            background: 'white',
            color: '#667eea',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Home size={18} />
            Admin Dashboard
          </button>
        </Link>
        
        <Link href="/dev">
          <button style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            border: '2px solid white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ArrowLeft size={18} />
            Dev Hub
          </button>
        </Link>
      </div>

      {/* Title */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{
          color: 'white',
          fontSize: '32px',
          fontWeight: '700',
          margin: '0 0 8px 0',
          textShadow: '0 2px 20px rgba(0,0,0,0.2)'
        }}>
          📱 PIX.IMMO iPhone App Navigation
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: '16px',
          margin: '0'
        }}>
          iPhone 15 Pro · 430×932px · Safe Area Design
        </p>
      </div>

      {/* Main Content Container */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        gap: '40px',
        justifyContent: 'center',
        alignItems: 'flex-start',
        flexWrap: 'wrap'
      }}>
        
        {/* iPhone Container */}
        <div style={{ flex: '0 0 auto' }}>
          {/* iPhone 15 Pro Device Frame */}
          <div style={{
            width: '430px',
            height: '880px',
            background: '#1A1A1C',
            borderRadius: '60px',
            padding: '12px',
            boxShadow: '0 50px 100px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,255,255,0.1)',
            position: 'relative'
          }}>
            {/* Dynamic Island */}
            <div style={{
              position: 'absolute',
              top: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '126px',
              height: '37px',
              background: '#000',
              borderRadius: '19px',
              zIndex: 100
            }} />

            {/* Screen */}
            <div style={{
              width: '100%',
              height: '100%',
              background: 'white',
              borderRadius: '48px',
              overflow: 'auto',
              position: 'relative'
            }}>
              {/* Status Bar */}
              <div style={{
                height: '59px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                paddingTop: '12px'
              }}>
                <span style={{ fontSize: '15px', fontWeight: '600' }}>9:41</span>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <div style={{ width: '17px', height: '11px', background: '#000', borderRadius: '2px', opacity: 0.4 }} />
                  <div style={{ width: '17px', height: '11px', background: '#000', borderRadius: '2px', opacity: 0.6 }} />
                  <div style={{ width: '17px', height: '11px', background: '#000', borderRadius: '2px', opacity: 0.8 }} />
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '16px 24px 34px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📱</div>
                  <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0' }}>PIX.IMMO App</h2>
                  <p style={{ fontSize: '14px', color: '#8E9094', margin: 0 }}>Alle App-Seiten</p>
                </div>

                {/* Navigation Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link href="/app">
                    <div style={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #64BF49 100%)',
                      borderRadius: '16px',
                      padding: '20px',
                      cursor: 'pointer',
                      color: 'white'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>⚡ Splash Screen</div>
                      <div style={{ fontSize: '13px', opacity: 0.9 }}>Session-Check → Auto-Login</div>
                      <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '8px', fontFamily: 'monospace' }}>/app</div>
                    </div>
                  </Link>

                  <Link href="/app/login">
                    <div style={{
                      background: 'white',
                      border: '2px solid #E5E5E5',
                      borderRadius: '16px',
                      padding: '20px',
                      cursor: 'pointer'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: '#1A1A1C' }}>🔐 Login</div>
                      <div style={{ fontSize: '13px', color: '#8E9094' }}>E-Mail + Passwort</div>
                      <div style={{ fontSize: '11px', color: '#8E9094', marginTop: '8px', fontFamily: 'monospace' }}>/app/login</div>
                    </div>
                  </Link>

                  <Link href="/app/jobs">
                    <div style={{
                      background: 'white',
                      border: '2px solid #E5E5E5',
                      borderRadius: '16px',
                      padding: '20px',
                      cursor: 'pointer'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: '#1A1A1C' }}>📋 Jobs</div>
                      <div style={{ fontSize: '13px', color: '#8E9094' }}>Auftrags-Übersicht (Protected)</div>
                      <div style={{ fontSize: '11px', color: '#8E9094', marginTop: '8px', fontFamily: 'monospace' }}>/app/jobs</div>
                    </div>
                  </Link>

                  <Link href="/app/camera">
                    <div style={{
                      background: 'linear-gradient(135deg, #1A1A1C 0%, #3B82F6 100%)',
                      borderRadius: '16px',
                      padding: '20px',
                      cursor: 'pointer',
                      color: 'white'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>📷 Kamera v3</div>
                      <div style={{ fontSize: '13px', opacity: 0.9 }}>Navigation + Viewport + Raumwähler</div>
                      <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '8px', fontFamily: 'monospace' }}>/app/camera</div>
                    </div>
                  </Link>

                  <Link href="/app/gallery">
                    <div style={{
                      background: 'white',
                      border: '2px solid #E5E5E5',
                      borderRadius: '16px',
                      padding: '20px',
                      cursor: 'pointer'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: '#1A1A1C' }}>🖼 Galerie</div>
                      <div style={{ fontSize: '13px', color: '#8E9094' }}>Foto-Galerie (Coming Soon)</div>
                      <div style={{ fontSize: '11px', color: '#8E9094', marginTop: '8px', fontFamily: 'monospace' }}>/app/gallery</div>
                    </div>
                  </Link>

                  <Link href="/app/upload">
                    <div style={{
                      background: 'white',
                      border: '2px solid #E5E5E5',
                      borderRadius: '16px',
                      padding: '20px',
                      cursor: 'pointer'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: '#1A1A1C' }}>⤴ Upload</div>
                      <div style={{ fontSize: '13px', color: '#8E9094' }}>Cloud-Upload (Coming Soon)</div>
                      <div style={{ fontSize: '11px', color: '#8E9094', marginTop: '8px', fontFamily: 'monospace' }}>/app/upload</div>
                    </div>
                  </Link>

                  <Link href="/app/settings">
                    <div style={{
                      background: 'white',
                      border: '2px solid #E5E5E5',
                      borderRadius: '16px',
                      padding: '20px',
                      cursor: 'pointer'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: '#1A1A1C' }}>⚙️ Settings</div>
                      <div style={{ fontSize: '13px', color: '#8E9094' }}>Einstellungen (Protected)</div>
                      <div style={{ fontSize: '11px', color: '#8E9094', marginTop: '8px', fontFamily: 'monospace' }}>/app/settings</div>
                    </div>
                  </Link>

                  <Link href="/app-overview">
                    <div style={{
                      background: 'white',
                      border: '2px solid #E5E5E5',
                      borderRadius: '16px',
                      padding: '20px',
                      cursor: 'pointer'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: '#1A1A1C' }}>📖 App Overview</div>
                      <div style={{ fontSize: '13px', color: '#8E9094' }}>Dokumentation & Status</div>
                      <div style={{ fontSize: '11px', color: '#8E9094', marginTop: '8px', fontFamily: 'monospace' }}>/app-overview</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Home Indicator */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '134px',
              height: '5px',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '3px'
            }} />
          </div>
        </div>

        {/* Specs Panel */}
        <div style={{
          flex: '0 0 auto',
          width: '360px',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0', color: '#1A1A1C' }}>
              📐 Device Specs
            </h3>
            <p style={{ fontSize: '14px', color: '#8E9094', margin: 0 }}>iPhone 15 Pro Spezifikationen</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: '#F8F9FA', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#8E9094', marginBottom: '4px' }}>Auflösung</div>
              <div style={{ fontSize: '16px', fontWeight: '600', fontFamily: 'monospace', color: '#1A1A1C' }}>430 × 932px</div>
            </div>
            
            <div style={{ background: '#F8F9FA', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#8E9094', marginBottom: '4px' }}>Safe Area Top</div>
              <div style={{ fontSize: '16px', fontWeight: '600', fontFamily: 'monospace', color: '#1A1A1C' }}>59px</div>
            </div>
            
            <div style={{ background: '#F8F9FA', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#8E9094', marginBottom: '4px' }}>Safe Area Bottom</div>
              <div style={{ fontSize: '16px', fontWeight: '600', fontFamily: 'monospace', color: '#1A1A1C' }}>34px</div>
            </div>
            
            <div style={{ background: '#F8F9FA', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#8E9094', marginBottom: '4px' }}>Border Radius</div>
              <div style={{ fontSize: '16px', fontWeight: '600', fontFamily: 'monospace', color: '#1A1A1C' }}>60px</div>
            </div>
            
            <div style={{ background: '#F8F9FA', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#8E9094', marginBottom: '4px' }}>Dynamic Island</div>
              <div style={{ fontSize: '16px', fontWeight: '600', fontFamily: 'monospace', color: '#1A1A1C' }}>126 × 37px</div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)',
            border: '2px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1A1A1C' }}>💡 Navigation</div>
            <div style={{ fontSize: '13px', color: '#1A1A1C', lineHeight: '1.6' }}>
              Klicke auf eine Karte im iPhone-Screen, um die App-Seite zu öffnen und die Proportionen live zu testen.
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '12px',
            paddingTop: '24px',
            borderTop: '1px solid #E5E5E5'
          }}>
            <a
              href="/IPHONE_APP_DESIGN.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textAlign: 'center',
                padding: '16px',
                background: 'white',
                border: '2px solid #E5E5E5',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#1A1A1C',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              📖 Design Guide
            </a>
            <a
              href="/QUICK_START_APP.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textAlign: 'center',
                padding: '16px',
                background: 'white',
                border: '2px solid #E5E5E5',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#1A1A1C',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              🚀 Quick Start
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
