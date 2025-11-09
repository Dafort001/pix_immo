import { Link } from 'wouter';
import { ArrowLeft, Menu, FileCode } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export default function DevNotesQC() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E9E9E9]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin-dashboard">
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/">
                <span className="text-2xl tracking-tight">PIX.IMMO</span>
              </Link>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/admin-dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost">Abmelden</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E9E9E9] py-4 px-4">
          <nav className="flex flex-col gap-2">
            <Link href="/admin-dashboard">
              <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="w-full justify-start">Abmelden</Button>
            </Link>
          </nav>
        </div>
      )}

      {/* Title Bar */}
      <div className="bg-white border-b border-[#E9E9E9]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileCode className="h-8 w-8 text-[#8E9094]" />
              <h1 className="text-2xl">Dev Notes – QC & Upload</h1>
            </div>
            <Badge className="bg-[#64BF49] text-white hover:bg-[#64BF49]">
              READY FOR DEV
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 max-w-[1400px] mx-auto px-4 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Specifications */}
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl mb-6">Specification Keys</h2>

            {/* Status Keys */}
            <div className="mb-8">
              <h3 className="text-sm mb-4 text-[#8E9094] uppercase tracking-wide">Status Keys (Image Level)</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Badge className="bg-[#8E9094] text-white hover:bg-[#8E9094] min-w-[140px] justify-center">
                    uploaded
                  </Badge>
                  <span className="text-sm text-[#8E9094]">Initial upload by editor</span>
                </li>
                <li className="flex items-center gap-3">
                  <Badge className="bg-[#74A4EA] text-white hover:bg-[#74A4EA] min-w-[140px] justify-center">
                    processed
                  </Badge>
                  <span className="text-sm text-[#8E9094]">System processing complete</span>
                </li>
                <li className="flex items-center gap-3">
                  <Badge className="bg-[#C9B55A] text-white hover:bg-[#C9B55A] min-w-[140px] justify-center">
                    qc-pending
                  </Badge>
                  <span className="text-sm text-[#8E9094]">Awaiting QC review</span>
                </li>
                <li className="flex items-center gap-3">
                  <Badge className="bg-[#64BF49] text-white hover:bg-[#64BF49] min-w-[140px] justify-center">
                    qc-approved
                  </Badge>
                  <span className="text-sm text-[#8E9094]">Approved by QC</span>
                </li>
                <li className="flex items-center gap-3">
                  <Badge className="bg-[#C94B38] text-white hover:bg-[#C94B38] min-w-[140px] justify-center">
                    qc-rejected
                  </Badge>
                  <span className="text-sm text-[#8E9094]">Needs revision</span>
                </li>
                <li className="flex items-center gap-3">
                  <Badge className="bg-[#1A1A1C] text-white hover:bg-[#1A1A1C] min-w-[140px] justify-center">
                    delivered
                  </Badge>
                  <span className="text-sm text-[#8E9094]">Final delivery to client</span>
                </li>
              </ul>
            </div>

            {/* Job Keys */}
            <div className="mb-8">
              <h3 className="text-sm mb-4 text-[#8E9094] uppercase tracking-wide">Job Keys (Aggregated)</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Badge variant="outline" className="border-[#8E9094] text-[#8E9094] min-w-[160px] justify-center">
                    processing
                  </Badge>
                  <span className="text-sm text-[#8E9094]">Some images pending/rejected</span>
                </li>
                <li className="flex items-center gap-3">
                  <Badge variant="outline" className="border-[#C9B55A] text-[#C9B55A] min-w-[160px] justify-center">
                    partial-approved
                  </Badge>
                  <span className="text-sm text-[#8E9094]">Mixed approval status</span>
                </li>
                <li className="flex items-center gap-3">
                  <Badge variant="outline" className="border-[#64BF49] text-[#64BF49] min-w-[160px] justify-center">
                    completed
                  </Badge>
                  <span className="text-sm text-[#8E9094]">All images approved</span>
                </li>
              </ul>
            </div>

            {/* Roles */}
            <div className="mb-8">
              <h3 className="text-sm mb-4 text-[#8E9094] uppercase tracking-wide">Roles</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#D87088]"></div>
                  <span><strong>Editor:</strong> Uploads and revises images</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#74A4EA]"></div>
                  <span><strong>QC:</strong> Reviews and approves/rejects images</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#C8B048]"></div>
                  <span><strong>Admin:</strong> Manages delivery and workflow</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#8E9094]"></div>
                  <span><strong>System:</strong> Automated processing pipeline</span>
                </li>
              </ul>
            </div>

            {/* Files on Delivery */}
            <div>
              <h3 className="text-sm mb-4 text-[#8E9094] uppercase tracking-wide">Files on Delivery</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#64BF49]"></div>
                  <span><strong>ZIP:</strong> Archive containing all approved images</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#64BF49]"></div>
                  <span><strong>alt-text.txt:</strong> SEO descriptions for each image</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#64BF49]"></div>
                  <span><strong>metadata.json:</strong> EXIF, camera settings, GPS data</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Workflow Diagram */}
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl mb-6">QC & Upload Workflow</h2>

            {/* Visual Workflow Diagram */}
            <div className="space-y-6">
              {/* Editor Section */}
              <div className="border-l-4 border-[#D87088] pl-4">
                <div className="text-sm mb-2 text-[#8E9094] uppercase tracking-wide">Editor (Bearbeitung)</div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-[#8E9094] text-white hover:bg-[#8E9094]">uploaded</Badge>
                  <span className="text-sm">→</span>
                </div>
              </div>

              {/* System Section */}
              <div className="border-l-4 border-[#8E9094] pl-4">
                <div className="text-sm mb-2 text-[#8E9094] uppercase tracking-wide">System / Pipeline</div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-[#74A4EA] text-white hover:bg-[#74A4EA]">processed</Badge>
                  <span className="text-sm">→</span>
                </div>
              </div>

              {/* QC Section */}
              <div className="border-l-4 border-[#74A4EA] pl-4">
                <div className="text-sm mb-2 text-[#8E9094] uppercase tracking-wide">QC-Team</div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#C9B55A] text-white hover:bg-[#C9B55A]">qc-pending</Badge>
                    <span className="text-sm">→</span>
                  </div>
                  
                  {/* Normal Path */}
                  <div className="ml-4 border-l-2 border-[#64BF49] pl-4">
                    <div className="text-xs text-[#8E9094] mb-2">✓ Normal Path</div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#64BF49] text-white hover:bg-[#64BF49]">qc-approved</Badge>
                      <span className="text-sm">→</span>
                      <Badge className="bg-[#1A1A1C] text-white hover:bg-[#1A1A1C]">delivered</Badge>
                    </div>
                  </div>

                  {/* Rejection Path */}
                  <div className="ml-4 border-l-2 border-[#C94B38] pl-4">
                    <div className="text-xs text-[#8E9094] mb-2">✗ Rejection Path</div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-[#C94B38] text-white hover:bg-[#C94B38]">qc-rejected</Badge>
                    </div>
                    <div className="text-xs text-[#8E9094] flex items-center gap-2">
                      <span>↻ Re-Upload (Editor)</span>
                      <span>→</span>
                      <Badge className="bg-[#C9B55A] text-white hover:bg-[#C9B55A] text-xs">qc-pending</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Status Aggregation */}
              <div className="border-2 border-dashed border-[#E9E9E9] rounded-lg p-4 bg-[#F8F9FA]">
                <div className="text-sm mb-3 text-[#8E9094] uppercase tracking-wide">Job Status (Aggregiert)</div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-[#8E9094] text-[#8E9094] text-xs">processing</Badge>
                    <span className="text-[#8E9094]">← if some rejected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-[#C9B55A] text-[#C9B55A] text-xs">partial-approved</Badge>
                    <span className="text-[#8E9094]">← if some approved & some pending/rejected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-[#64BF49] text-[#64BF49] text-xs">completed</Badge>
                    <span className="text-[#8E9094]">← if all approved</span>
                  </div>
                </div>
              </div>

              {/* Key Notes */}
              <div className="bg-[#FFF9E6] border border-[#C9B55A]/30 rounded-lg p-4">
                <div className="text-sm mb-3">🔑 Key Notes</div>
                <ul className="space-y-2 text-xs text-[#8E9094]">
                  <li>• Einzelbildprüfung (kein Batch-Lock)</li>
                  <li>• Rejected Bilder gehen gezielt in Revision</li>
                  <li>• Delivery wird erst nach vollständiger Freigabe ausgelöst</li>
                  <li>• QC-Team kann einzelne Bilder unabhängig freigeben</li>
                </ul>
              </div>

              {/* Mermaid Code Reference */}
              <details className="border border-[#E9E9E9] rounded-lg p-4">
                <summary className="text-sm cursor-pointer hover:text-[#64BF49]">
                  View Mermaid Diagram Code
                </summary>
                <pre className="mt-4 text-xs bg-[#1A1A1C] text-[#64BF49] p-4 rounded overflow-x-auto">
{`flowchart LR
  subgraph EDITOR["Editor (Bearbeitung)"]
    U[uploaded]
  end

  subgraph SYSTEM["System / Pipeline"]
    P[processed]
    D[delivered]
  end

  subgraph QC["QC-Team"]
    QP[qc-pending]
    QA[qc-approved]
    QR[qc-rejected]
  end

  %% Normaler Durchlauf
  U --> QP --> QA --> D

  %% Asynchron / Fehlerfall
  QP --> QR
  QR -->|Re-Upload (Editor)| QP

  %% Alternative Eingänge
  U --> P --> QP

  %% Job-Status (aggregiert)
  J1((processing))
  J2((partial-approved))
  J3((completed))

  %% Aggregations-Logik
  QA -->|if some rejected| J1
  QA -->|if some approved & some pending/rejected| J2
  QA -->|if all approved| J3
  J3 --> D`}
                </pre>
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E9E9E9] mt-auto">
        <div className="h-32"></div>
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[#8E9094]">
            <div>© 2024 PIX.IMMO. Alle Rechte vorbehalten.</div>
            <div className="flex gap-6">
              <Link href="/impressum" className="hover:text-[#1A1A1C]">Impressum</Link>
              <Link href="/datenschutz" className="hover:text-[#1A1A1C]">Datenschutz</Link>
              <Link href="/agb" className="hover:text-[#1A1A1C]">AGB</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
