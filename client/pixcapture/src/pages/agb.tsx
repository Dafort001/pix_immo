import { Link } from "wouter";
import { SEOHead } from "@shared/components";
import { IPhoneFrame } from "../components/IPhoneFrame";
import { ArrowLeft } from "lucide-react";

export default function PixCaptureAGB() {
  return (
    <IPhoneFrame>
      <SEOHead
        title="AGB – pixcapture.app"
        description="Allgemeine Geschäftsbedingungen von pixcapture.app"
        path="/pixcapture-agb"
      />

      <div className="min-h-full bg-[var(--color-white)] flex flex-col" style={{ paddingTop: '59px', paddingBottom: '34px' }}>
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[var(--color-white)] border-b border-[#E5E5E5]" style={{ top: '59px' }}>
          <div className="px-6 py-4 flex items-center justify-between">
            <Link href="/pixcapture-app/settings">
              <button className="flex items-center gap-2 text-[#74A4EA] active:opacity-70 transition-opacity">
                <ArrowLeft size={20} strokeWidth={2} />
                <span>Zurück</span>
              </button>
            </Link>
            <Link href="/pixcapture">
              <span className="text-[var(--color-black)] tracking-tight cursor-pointer active:opacity-70 transition-opacity">
                pixcapture.app
              </span>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8" style={{ paddingBottom: '40px' }}>
          <h1 className="text-[var(--color-black)] mb-8">
            Allgemeine Geschäftsbedingungen für die Nutzung der Pix Capture App
          </h1>

          <div className="space-y-8 pb-8">
            <div>
              <h3 className="text-[var(--color-black)] mb-3">§ 1 Geltungsbereich und Anbieter</h3>
              <p className="text-[var(--color-grey)] mb-2">
                (1) Diese Allgemeinen Geschäftsbedingungen regeln die Nutzung der mobilen Applikation „Pix Capture App" (nachfolgend „App") durch registrierte oder sich registrierende Kunden der Plattform pix.immo.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                (2) Anbieter und Verantwortlicher im Sinne dieser AGB ist<br />
                Daniel Fortmann – pix.immo,<br />
                vertreten durch den Inhaber,<br />
                E-Mail: info@pix.immo,<br />
                Anschrift: [bitte später eintragen].
              </p>
              <p className="text-[var(--color-grey)]">
                (3) Die App richtet sich ausschließlich an natürliche oder juristische Personen, die im Rahmen der Immobilienfotografie, -vermarktung oder -dokumentation Leistungen von pix.immo in Anspruch nehmen oder dies beabsichtigen.
              </p>
            </div>

            <div>
              <h3 className="text-[var(--color-black)] mb-3">§ 2 Vertragsgegenstand</h3>
              <p className="text-[var(--color-grey)] mb-2">
                (1) Gegenstand dieser Nutzungsbedingungen ist die Bereitstellung einer technischen Anwendung, mit der der Nutzer Bild- und ggf. Videodateien (nachfolgend „Inhalte") im Zusammenhang mit bestehenden oder zukünftigen Aufträgen an pix.immo hochladen kann.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                (2) Die App dient ausschließlich der Datenübermittlung und -verwaltung. Über die App können keine Buchungen, Zahlungen oder Vertragsabschlüsse im rechtlichen Sinne vorgenommen werden.
              </p>
              <p className="text-[var(--color-grey)]">
                (3) Die Nutzung der App setzt eine vorherige Registrierung oder Authentifizierung über ein Kundenkonto bei pix.immo voraus.
              </p>
            </div>

            <div>
              <h3 className="text-[var(--color-black)] mb-3">§ 3 Nutzerpflichten und Verantwortlichkeit für Inhalte</h3>
              <p className="text-[var(--color-grey)] mb-2">
                (1) Der Nutzer ist verpflichtet, nur solche Inhalte hochzuladen, für deren Nutzung und Weitergabe er über die erforderlichen Rechte verfügt.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                (2) Der Nutzer verpflichtet sich, keine rechtswidrigen, diskriminierenden, urheberrechtsverletzenden oder personenbezogenen Inhalte hochzuladen.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                (3) Der Nutzer stellt den Anbieter von sämtlichen Ansprüchen Dritter frei, die aus einer Verletzung dieser Pflichten resultieren.
              </p>
              <p className="text-[var(--color-grey)]">
                (4) Die Übermittlung personenbezogener Daten Dritter (z. B. Personenabbildungen) ist nur zulässig, soweit diese zuvor wirksam in die Verarbeitung eingewilligt haben oder ein berechtigtes Interesse i. S. d. Art. 6 Abs. 1 lit. f DSGVO besteht.
              </p>
            </div>

            <div>
              <h3 className="text-[var(--color-black)] mb-3">§ 4 Technische Bereitstellung und Verfügbarkeit</h3>
              <p className="text-[var(--color-grey)] mb-2">
                (1) Der Anbieter betreibt die App in Zusammenarbeit mit technischen Dienstleistern, insbesondere der Cloudflare Inc., 101 Townsend St, San Francisco, CA 94107, USA, welche Infrastruktur-, Speicher- und Sicherheitsleistungen bereitstellt.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                (2) Es besteht kein Anspruch auf eine ununterbrochene oder fehlerfreie Verfügbarkeit der App. Wartungsarbeiten, Sicherheits-Updates und externe Netzwerkbedingungen können die Nutzung zeitweise einschränken.
              </p>
              <p className="text-[var(--color-grey)]">
                (3) Der Anbieter behält sich das Recht vor, die App jederzeit zu ändern, einzuschränken oder einzustellen, sofern dies dem Nutzer zumutbar ist oder berechtigte Interessen des Anbieters dies erfordern.
              </p>
            </div>

            <div>
              <h3 className="text-[var(--color-black)] mb-3">§ 5 Datenschutz</h3>
              <p className="text-[var(--color-grey)] mb-2">
                (1) Die Verarbeitung personenbezogener Daten erfolgt im Einklang mit der Datenschutzerklärung von pix.immo, die unter <a href="https://pix.immo/datenschutz" className="text-[var(--color-blue)] hover:underline">https://pix.immo/datenschutz</a> abrufbar ist.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                (2) Die übermittelten Inhalte werden auf Servern der Cloudflare Inc. gespeichert und verarbeitet. Dabei werden nur anonymisierte Dateibezeichnungen verwendet (z. B. „wohnzimmer_01.jpg"), um Rückschlüsse auf Personen oder Adressen zu vermeiden.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                (3) Die Datenverarbeitung erfolgt ausschließlich zur Auftragserfüllung, Qualitätssicherung und Nachbearbeitung der hochgeladenen Medien. Eine Weitergabe an Dritte erfolgt nicht, sofern keine gesetzliche Verpflichtung besteht.
              </p>
              <p className="text-[var(--color-grey)]">
                (4) Der Nutzer kann die Löschung seiner Inhalte jederzeit nach Abschluss eines Auftrags verlangen, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
              </p>
            </div>

            <div>
              <h3 className="text-[var(--color-black)] mb-3">§ 6 Haftung und Gewährleistung</h3>
              <p className="text-[var(--color-grey)] mb-2">
                (1) Der Anbieter haftet uneingeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit, die auf einer vorsätzlichen oder grob fahrlässigen Pflichtverletzung beruhen.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                (2) Im Übrigen ist die Haftung auf Vorsatz und grobe Fahrlässigkeit beschränkt. Eine Haftung für mittelbare oder Folgeschäden, insbesondere Datenverluste oder Nutzungsausfälle, wird ausgeschlossen, soweit gesetzlich zulässig.
              </p>
              <p className="text-[var(--color-grey)]">
                (3) Der Anbieter übernimmt keine Gewähr für die dauerhafte Verfügbarkeit oder Fehlerfreiheit der App oder für die Eignung der App für bestimmte Zwecke außerhalb der vorgesehenen Nutzung.
              </p>
            </div>

            <div>
              <h3 className="text-[var(--color-black)] mb-3">§ 7 Beendigung der Nutzung</h3>
              <p className="text-[var(--color-grey)] mb-2">
                (1) Der Nutzer kann die Nutzung der App jederzeit durch Deinstallation beenden.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                (2) Der Anbieter ist berechtigt, den Zugang zur App oder einzelnen Funktionen zu sperren, wenn der Nutzer gegen diese AGB oder geltendes Recht verstößt oder der Verdacht einer missbräuchlichen Nutzung besteht.
              </p>
              <p className="text-[var(--color-grey)]">
                (3) Nach Beendigung der Nutzung können die gespeicherten Inhalte aus technischen Gründen noch für eine kurze Übergangszeit im System verbleiben, werden jedoch anschließend gelöscht oder anonymisiert.
              </p>
            </div>

            <div>
              <h3 className="text-[var(--color-black)] mb-3">§ 8 Änderungen dieser AGB</h3>
              <p className="text-[var(--color-grey)] mb-2">
                (1) Der Anbieter behält sich vor, diese AGB jederzeit zu ändern, sofern dies aufgrund technischer Weiterentwicklungen, rechtlicher Anforderungen oder organisatorischer Anpassungen erforderlich ist.
              </p>
              <p className="text-[var(--color-grey)]">
                (2) Über wesentliche Änderungen wird der Nutzer rechtzeitig in Textform informiert. Die weitere Nutzung der App nach Inkrafttreten gilt als Zustimmung zu den geänderten Bedingungen.
              </p>
            </div>

            <div>
              <h3 className="text-[var(--color-black)] mb-3">§ 9 Schlussbestimmungen</h3>
              <p className="text-[var(--color-grey)] mb-2">
                (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                (2) Gerichtsstand ist Hamburg, soweit der Nutzer Kaufmann oder juristische Person des öffentlichen Rechts ist oder keinen allgemeinen Gerichtsstand im Inland hat.
              </p>
              <p className="text-[var(--color-grey)]">
                (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen hiervon unberührt.
              </p>
            </div>

            <div className="border-t border-[var(--color-grey)] pt-6">
              <p className="text-[var(--color-grey)] text-sm">
                Stand: November 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </IPhoneFrame>
  );
}
