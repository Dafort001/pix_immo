import { ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="relative">
      {/* iPhone 15 Pro Frame - PORTRAIT */}
      <div
        className="relative bg-black rounded-[55px] shadow-2xl overflow-hidden border-[14px] border-black"
        style={{
          width: '393px',
          height: '852px',
        }}
      >
        {/* Dynamic Island - Portrait Position (oben) */}
        <div className="absolute left-1/2 top-[12px] -translate-x-1/2 z-50">
          <div
            className="bg-black rounded-full"
            style={{
              width: '126px',  // Gedreht: width ↔ height
              height: '37px',
            }}
          />
        </div>

        {/* Screen - Portrait */}
        <div
          className="relative bg-white rounded-[2.75rem] overflow-hidden"
          style={{
            width: '369px',  // Portrait: 369 × 828
            height: '828px',
          }}
        >
          {children}
        </div>

        {/* Power Button - Portrait (oben rechts) */}
        <div
          className="absolute top-0 bg-black"
          style={{
            right: '200px',
            width: '80px',
            height: '4px',
            borderRadius: '4px 4px 0 0',
          }}
        />

        {/* Volume Buttons - Portrait (unten) */}
        <div
          className="absolute bottom-0 bg-black"
          style={{
            right: '160px',
            width: '50px',
            height: '4px',
            borderRadius: '0 0 4px 4px',
          }}
        />
        <div
          className="absolute bottom-0 bg-black"
          style={{
            right: '220px',
            width: '50px',
            height: '4px',
            borderRadius: '0 0 4px 4px',
          }}
        />
      </div>

      {/* Device Label */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">iPhone 15 Pro (Portrait)</p>
        <p className="text-gray-400 text-xs mt-1">393 × 852 pt</p>
      </div>
    </div>
  );
}