interface IPhoneFrameProps {
  children: React.ReactNode;
  orientation?: 'portrait' | 'landscape';
  hideStatusBar?: boolean;
}

export function IPhoneFrame({ children, orientation = 'portrait', hideStatusBar = false }: IPhoneFrameProps) {
  const isLandscape = orientation === 'landscape';
  
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F5F5F5',
        padding: '20px',
      }}
    >
      {/* iPhone 15 Pro Container */}
      <div
        style={{
          width: isLandscape ? '932px' : '430px',
          height: isLandscape ? '430px' : '932px',
          maxWidth: '100%',
          maxHeight: '100%',
          background: '#000',
          borderRadius: '55px',
          border: '12px solid #1A1A1C',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Status Bar Background - nur im Portrait-Modus */}
        {!hideStatusBar && !isLandscape && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '59px',
              background: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(20px)',
              zIndex: 9997,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Dynamic Island (nur Portrait) */}
        {!isLandscape && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '126px',
              height: '37px',
              background: '#000',
              borderRadius: '19px',
              zIndex: 9999,
              boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.8)',
            }}
          />
        )}

        {/* Status Bar - nur im Portrait-Modus */}
        {!hideStatusBar && !isLandscape && (
          <>
            {/* Zeit (links) */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '24px',
                zIndex: 9998,
                pointerEvents: 'none',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              }}
            >
              <span style={{ 
                fontSize: '15px', 
                fontWeight: '600',
                color: '#000',
                textShadow: '0 0 10px rgba(255,255,255,0.3)',
              }}>
                9:41
              </span>
            </div>
            
            {/* Status Icons (rechts) */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '24px',
                display: 'flex',
                gap: '6px',
                alignItems: 'center',
                zIndex: 9998,
                pointerEvents: 'none',
              }}
            >
              {/* Mobilfunk Signal */}
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                <rect x="0" y="8" width="3" height="4" rx="1" fill="#000" opacity="0.4" />
                <rect x="5" y="5" width="3" height="7" rx="1" fill="#000" opacity="0.6" />
                <rect x="10" y="2" width="3" height="10" rx="1" fill="#000" opacity="0.8" />
                <rect x="15" y="0" width="3" height="12" rx="1" fill="#000" />
              </svg>
              
              {/* WiFi */}
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path d="M8 11.5C8.55228 11.5 9 11.0523 9 10.5C9 9.94772 8.55228 9.5 8 9.5C7.44772 9.5 7 9.94772 7 10.5C7 11.0523 7.44772 11.5 8 11.5Z" fill="#000"/>
                <path d="M8 7C9.38071 7 10.6914 7.44857 11.7782 8.24286C12.0733 8.46429 12.4914 8.40857 12.713 8.11286C12.9345 7.81714 12.8788 7.39929 12.5831 7.17786C11.2788 6.23286 9.69442 5.71429 8 5.71429C6.30558 5.71429 4.72117 6.23286 3.41692 7.17786C3.12117 7.39929 3.06546 7.81714 3.28703 8.11286C3.50859 8.40857 3.92645 8.46429 4.2222 8.24286C5.30859 7.44857 6.61929 7 8 7Z" fill="#000"/>
                <path d="M13.6569 5.14286C11.9998 3.75714 9.88269 3 7.65698 3C5.43127 3 3.31412 3.75714 1.65698 5.14286C1.36127 5.36429 1.30555 5.78214 1.52698 6.07786C1.74841 6.37357 2.16627 6.42929 2.46198 6.20786C3.88841 5.03571 5.71556 4.38571 7.65698 4.38571C9.5984 4.38571 11.4255 5.03571 12.852 6.20786C13.1477 6.42929 13.5656 6.37357 13.787 6.07786C14.0084 5.78214 13.9527 5.36429 13.6569 5.14286Z" fill="#000"/>
              </svg>
              
              {/* Batterie */}
              <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
                <rect x="0.5" y="0.5" width="22" height="12" rx="2.5" stroke="#000" fill="none" strokeOpacity="0.35"/>
                <rect x="2" y="2" width="19" height="9" rx="1.5" fill="#000"/>
                <path d="M23.5 4.5C23.5 4.22386 23.7239 4 24 4H25C25.5523 4 26 4.44772 26 5V8C26 8.55228 25.5523 9 25 9H24C23.7239 9 23.5 8.77614 23.5 8.5V4.5Z" fill="#000" fillOpacity="0.4"/>
              </svg>
            </div>
          </>
        )}

        {/* Content */}
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
