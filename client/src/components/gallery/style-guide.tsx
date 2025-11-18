export function StyleGuide() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 bg-gray-50">
      <h2 className="text-gray-800 mb-6 sm:mb-8 lg:mb-12 text-xl sm:text-2xl">Style Guide – pix.immo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Typography */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-800 mb-6">Typography</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Headings</p>
              <p className="text-gray-800">Inter / 24–32 pt</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Body</p>
              <p className="text-gray-800">Inter / 14–16 pt</p>
            </div>
          </div>
        </div>
        
        {/* Colors */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-800 mb-6">Colors</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded bg-[#2d2d2d]"></div>
              <div>
                <p className="text-sm text-gray-800">Primärfarbe</p>
                <p className="text-xs text-gray-500">#2d2d2d (Anthrazit)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded bg-[#fafaf8] border border-gray-200"></div>
              <div>
                <p className="text-sm text-gray-800">Sekundärfarbe</p>
                <p className="text-xs text-gray-500">#fafaf8 (Warmes Weiß)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded bg-[#3b82f6]"></div>
              <div>
                <p className="text-sm text-gray-800">Akzentfarbe</p>
                <p className="text-xs text-gray-500">#3b82f6 (Dezentes Blau)</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Spacing */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-gray-800 mb-6">Spacing</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-300"></div>
              <p className="text-gray-800">16 px</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-300"></div>
              <p className="text-gray-800">24 px</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-300"></div>
              <p className="text-gray-800">32 px</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Component Examples */}
      <div className="mt-6 sm:mt-8 lg:mt-12 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
        <h3 className="text-gray-800 mb-4 sm:mb-6 text-lg sm:text-xl">Komponenten</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-3">Thumbnail Varianten:</p>
            <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
              <li>• Normal – Standard-Ansicht mit Hover-Effekt</li>
              <li>• Locked – X-Kreuz Overlay, nicht verfügbar</li>
              <li>• Editing – „In Bearbeitung" Label</li>
              <li>• Selected – Blauer Rahmen + Plus-Icon</li>
            </ul>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-3">Weitere Komponenten:</p>
            <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
              <li>• Header – Jobtitel + Paketinfo + ZIP-Download</li>
              <li>• Image Preview Modal – Lightbox mit Downloads</li>
              <li>• Edit Request Modal – Bearbeitung anfordern</li>
              <li>• Annotation Overlay – Zeichnen-Tool</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
