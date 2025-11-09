import { useState } from "react";
import { Link } from "wouter";
import { SEOHead } from "../components/SEOHead";
import { IPhoneFrame } from "../components/IPhoneFrame";
import { ArrowLeft } from "lucide-react";

export default function PixCaptureDatenschutz() {
  const [language, setLanguage] = useState<'de' | 'en'>('de');

  const content = {
    de: {
      title: "Datenschutzerklärung",
      back: "Zurück",
      sections: [
        {
          title: "1. Verantwortlicher",
          content: (
            <>
              <p className="text-[var(--color-grey)]">
                Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
              </p>
              <p className="text-[var(--color-grey)] mt-2">
                Daniel Fortmann – pix.immo<br />
                E-Mail: mail@pix.immo<br />
                Anschrift: Kaiser-Wilhelm-Str. 47, 20355 Hamburg
              </p>
            </>
          )
        },
        {
          title: "2. Zweck der App",
          content: (
            <>
              <p className="text-[var(--color-grey)]">
                Die Pix Capture App dient ausschließlich der sicheren Übermittlung und Verwaltung von Bild- und Videodateien im Zusammenhang mit Aufträgen oder geplanten Aufträgen über die Plattform pix.immo.
              </p>
              <p className="text-[var(--color-grey)] mt-2">
                Eine Nutzung zu anderen Zwecken, insbesondere zu Werbe-, Analyse- oder Social-Media-Zwecken, findet nicht statt.
              </p>
            </>
          )
        },
        {
          title: "3. Arten der verarbeiteten Daten",
          content: (
            <>
              <p className="text-[var(--color-grey)] mb-3">
                Im Rahmen der Nutzung werden folgende Datenarten verarbeitet:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[var(--color-grey)]">
                <li>Gerätedaten (Modell, Betriebssystemversion, App-Version)</li>
                <li>Login- und Kontoinformationen (E-Mail, Kunden-ID)</li>
                <li>Hochgeladene Medieninhalte (Fotos, Videos)</li>
                <li>Technische Metadaten (Dateiname, Dateigröße, Upload-Zeitpunkt)</li>
                <li>Fehler- und Protokolldaten zur App-Stabilität</li>
              </ul>
            </>
          )
        },
        {
          title: "4. Rechtsgrundlage der Verarbeitung",
          content: (
            <>
              <p className="text-[var(--color-grey)] mb-2">
                Die Datenverarbeitung erfolgt auf Grundlage von
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[var(--color-grey)]">
                <li>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung oder vorvertragliche Maßnahmen),</li>
                <li>Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an sicherer und effizienter Datenübermittlung),</li>
                <li>sowie ggf. Art. 6 Abs. 1 lit. a DSGVO (Einwilligung, z. B. bei freiwilligen Uploads ohne bestehenden Vertrag).</li>
              </ul>
            </>
          )
        },
        {
          title: "5. Speicherung und technische Dienstleister",
          content: (
            <>
              <p className="text-[var(--color-grey)] mb-2">
                Die Daten werden über gesicherte Verbindungen auf Servern der Cloudflare Inc., 101 Townsend Street, San Francisco, CA 94107, USA verarbeitet und gespeichert.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Cloudflare bietet Dienste im Bereich CDN, Edge-Computing und Datenspeicherung (R2).
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Die Speicherung erfolgt mit anonymisierten Dateinamen (z. B. wohnzimmer_01.jpg), um Rückschlüsse auf Personen oder Adressen zu vermeiden.
              </p>
              <p className="text-[var(--color-grey)]">
                Mit Cloudflare besteht ein Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO.
              </p>
            </>
          )
        },
        {
          title: "6. Dauer der Speicherung",
          content: (
            <>
              <p className="text-[var(--color-grey)] mb-2">
                Die hochgeladenen Inhalte werden für die Dauer der Auftragsabwicklung gespeichert und anschließend gelöscht oder anonymisiert, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.
              </p>
              <p className="text-[var(--color-grey)]">
                Fehler- und Logdaten werden regelmäßig nach 30 Tagen gelöscht.
              </p>
            </>
          )
        },
        {
          title: "7. Rechte der betroffenen Personen",
          content: (
            <>
              <p className="text-[var(--color-grey)] mb-3">
                Nutzer haben das Recht auf
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[var(--color-grey)]">
                <li>Auskunft (Art. 15 DSGVO),</li>
                <li>Berichtigung (Art. 16 DSGVO),</li>
                <li>Löschung (Art. 17 DSGVO),</li>
                <li>Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
                <li>Datenübertragbarkeit (Art. 20 DSGVO),</li>
                <li>sowie Widerspruch gegen die Verarbeitung (Art. 21 DSGVO).</li>
              </ul>
              <p className="text-[var(--color-grey)] mt-3">
                Anfragen können per E-Mail an <a href="mailto:info@pix.immo" className="text-[var(--color-blue)] hover:underline">info@pix.immo</a> gestellt werden.
              </p>
            </>
          )
        },
        {
          title: "8. Datensicherheit",
          content: (
            <>
              <p className="text-[var(--color-grey)] mb-2">
                Die App verwendet HTTPS-Verbindungen mit TLS-Verschlüsselung.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Daten werden während der Übertragung verschlüsselt und durch Zugriffskontrollen geschützt.
              </p>
              <p className="text-[var(--color-grey)]">
                Der Zugriff auf Inhalte ist nur für autorisierte Mitarbeiter von pix.immo möglich.
              </p>
            </>
          )
        },
        {
          title: "9. Änderungen dieser Datenschutzerklärung",
          content: (
            <>
              <p className="text-[var(--color-grey)] mb-2">
                Diese Datenschutzerklärung kann aufgrund technischer, organisatorischer oder rechtlicher Entwicklungen angepasst werden.
              </p>
              <p className="text-[var(--color-grey)]">
                Die jeweils aktuelle Fassung ist in der App und auf der Website pix.immo abrufbar.
              </p>
            </>
          )
        },
        {
          title: "10. Geltendes Recht",
          content: (
            <>
              <p className="text-[var(--color-grey)] mb-2">
                Es gilt das Recht der Bundesrepublik Deutschland.
              </p>
              <p className="text-[var(--color-grey)]">
                Gerichtsstand ist Hamburg, soweit gesetzlich zulässig.
              </p>
            </>
          )
        }
      ]
    },
    en: {
      title: "Privacy Policy",
      back: "Back",
      sections: [
        {
          title: "1. Controller",
          content: (
            <>
              <p className="text-[var(--color-grey)]">
                Controller within the meaning of the EU General Data Protection Regulation (GDPR):
              </p>
              <p className="text-[var(--color-grey)] mt-2">
                Daniel Fortmann – pix.immo<br />
                Email: mail@pix.immo<br />
                Address: Kaiser-Wilhelm-Str. 47, 20355 Hamburg
              </p>
            </>
          )
        },
        {
          title: "2. Purpose of the App",
          content: (
            <>
              <p className="text-[var(--color-grey)]">
                The Pix Capture App is solely intended for the secure transfer and management of image and video files related to existing or planned orders placed via the pix.immo platform.
              </p>
              <p className="text-[var(--color-grey)] mt-2">
                The app is not used for advertising, analytics, or social media purposes.
              </p>
            </>
          )
        },
        {
          title: "3. Categories of Data Processed",
          content: (
            <>
              <p className="text-[var(--color-grey)] mb-3">
                When using the app, the following types of data are processed:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[var(--color-grey)]">
                <li>Device information (model, OS version, app version)</li>
                <li>Login and account details (email address, customer ID)</li>
                <li>Uploaded media content (photos, videos)</li>
                <li>Technical metadata (file name, file size, upload timestamp)</li>
                <li>Error and log data for app stability</li>
              </ul>
            </>
          )
        },
        {
          title: "4. Legal Basis",
          content: (
            <>
              <p className="text-[var(--color-grey)] mb-2">
                Processing is carried out on the basis of
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[var(--color-grey)]">
                <li>Art. 6 (1)(b) GDPR (performance of a contract or pre-contractual measures),</li>
                <li>Art. 6 (1)(f) GDPR (legitimate interest in secure and efficient data transmission),</li>
                <li>and, where applicable, Art. 6 (1)(a) GDPR (consent, e.g. voluntary uploads without an existing contract).</li>
              </ul>
            </>
          )
        },
        {
          title: "5. Storage and Technical Providers",
          content: (
            <>
              <p className="text-[var(--color-grey)] mb-2">
                Data is transmitted via secure connections and processed on servers operated by Cloudflare Inc., 101 Townsend Street, San Francisco, CA 94107, USA.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Cloudflare provides CDN, edge computing, and data storage (R2) services.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Files are stored with anonymized filenames (e.g., livingroom_01.jpg) to prevent any personal identification.
              </p>
              <p className="text-[var(--color-grey)]">
                A data processing agreement (DPA) pursuant to Art. 28 GDPR has been concluded with Cloudflare.
              </p>
            </>
          )
        },
        {
          title: "6. Retention Period",
          content: (
            <>
              <p className="text-[var(--color-grey)] mb-2">
                Uploaded content is stored for the duration of order processing and deleted or anonymized thereafter, unless legal retention obligations apply.
              </p>
              <p className="text-[var(--color-grey)]">
                Error and log data are automatically deleted after 30 days.
              </p>
            </>
          )
        },
        {
          title: "7. Data Subject Rights",
          content: (
            <>
              <p className="text-[var(--color-grey)] mb-3">
                Users have the right to
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[var(--color-grey)]">
                <li>access (Art. 15 GDPR),</li>
                <li>rectification (Art. 16 GDPR),</li>
                <li>erasure (Art. 17 GDPR),</li>
                <li>restriction of processing (Art. 18 GDPR),</li>
                <li>data portability (Art. 20 GDPR), and</li>
                <li>object to processing (Art. 21 GDPR).</li>
              </ul>
              <p className="text-[var(--color-grey)] mt-3">
                Requests can be sent to <a href="mailto:info@pix.immo" className="text-[var(--color-blue)] hover:underline">info@pix.immo</a>.
              </p>
            </>
          )
        },
        {
          title: "8. Data Security",
          content: (
            <>
              <p className="text-[var(--color-grey)] mb-2">
                The app uses HTTPS with TLS encryption.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                All data transmissions are encrypted, and access is controlled and restricted.
              </p>
              <p className="text-[var(--color-grey)]">
                Only authorized pix.immo personnel can access uploaded content.
              </p>
            </>
          )
        },
        {
          title: "9. Changes to This Policy",
          content: (
            <>
              <p className="text-[var(--color-grey)] mb-2">
                This Privacy Policy may be updated due to technical, organizational, or legal changes.
              </p>
              <p className="text-[var(--color-grey)]">
                The latest version is always available within the app and on the pix.immo website.
              </p>
            </>
          )
        },
        {
          title: "10. Governing Law",
          content: (
            <>
              <p className="text-[var(--color-grey)] mb-2">
                This Privacy Policy is governed by the laws of the Federal Republic of Germany.
              </p>
              <p className="text-[var(--color-grey)]">
                Place of jurisdiction is Hamburg, where legally permissible.
              </p>
            </>
          )
        }
      ]
    }
  };

  const currentContent = content[language];

  return (
    <IPhoneFrame>
      <SEOHead
        title={language === 'de' ? "Datenschutz – pixcapture.app" : "Privacy Policy – pixcapture.app"}
        description={language === 'de' ? "Datenschutzerklärung von pixcapture.app" : "Privacy Policy of pixcapture.app"}
        path="/pixcapture-datenschutz"
      />

      <div className="min-h-full bg-[var(--color-white)] flex flex-col" style={{ paddingTop: '59px', paddingBottom: '34px' }}>
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[var(--color-white)] border-b border-[#E5E5E5]" style={{ top: '59px' }}>
          <div className="px-6 py-4">
            {/* Top Row: Back Button and Logo */}
            <div className="flex items-center justify-between mb-3">
              <Link href="/pixcapture-app/settings">
                <button className="flex items-center gap-2 text-[#74A4EA] active:opacity-70 transition-opacity">
                  <ArrowLeft size={20} strokeWidth={2} />
                  <span>{currentContent.back}</span>
                </button>
              </Link>
              
              <Link href="/pixcapture-home">
                <span className="text-[var(--color-black)] tracking-tight cursor-pointer active:opacity-70 transition-opacity">
                  pixcapture.app
                </span>
              </Link>
            </div>
            
            {/* Bottom Row: Language Toggle centered */}
            <div className="flex justify-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage('de')}
                  className={`px-3 py-1 transition-colors ${
                    language === 'de'
                      ? 'text-[var(--color-black)]'
                      : 'text-[var(--color-grey)]'
                  }`}
                >
                  DE
                </button>
                <span className="text-[var(--color-grey)]">|</span>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 transition-colors ${
                    language === 'en'
                      ? 'text-[var(--color-black)]'
                      : 'text-[var(--color-grey)]'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8" style={{ paddingBottom: '40px' }}>
          <h1 className="text-[var(--color-black)] mb-8">
            {currentContent.title}
          </h1>

          <div className="space-y-8 pb-8">
            {currentContent.sections.map((section, index) => (
              <div key={index}>
                <h3 className="text-[var(--color-black)] mb-3">{section.title}</h3>
                {section.content}
              </div>
            ))}

            <div className="border-t border-[var(--color-grey)] pt-6">
              <p className="text-[var(--color-grey)] text-sm">
                {language === 'de' ? 'Stand: November 2025' : 'Last updated: November 2025'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </IPhoneFrame>
  );
}
