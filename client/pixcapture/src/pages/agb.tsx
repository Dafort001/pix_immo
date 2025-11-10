import { Link } from "wouter";
import { SEOHead } from "@shared/components";
import { IPhoneFrame } from "../components/IPhoneFrame";
import { ArrowLeft } from "lucide-react";

export default function PixCaptureAGB() {
  return (
    <IPhoneFrame>
      <SEOHead
        title="AGB – pixcapture.app"
        description="Allgemeine Liefer- und Geschäftsbedingungen von PIX.IMMO"
        path="/pixcapture/agb"
      />

      <div className="min-h-full bg-[var(--color-white)] flex flex-col" style={{ paddingTop: '59px', paddingBottom: '34px' }}>
        {/* Header */}
        <div className="sticky top-0 z-50 bg-[var(--color-white)] border-b border-[#E5E5E5]" style={{ top: '59px' }}>
          <div className="px-6 py-4 flex items-center justify-between">
            <a href="/app/settings">
              <button className="flex items-center gap-2 text-[#74A4EA] active:opacity-70 transition-opacity">
                <ArrowLeft size={20} strokeWidth={2} />
                <span>Zurück</span>
              </button>
            </a>
            <Link href="/pixcapture">
              <span className="text-[var(--color-black)] tracking-tight cursor-pointer active:opacity-70 transition-opacity">
                pixcapture.app
              </span>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8" style={{ paddingBottom: '40px' }}>
          <h1 className="text-[var(--color-black)] mb-4">
            PIX.IMMO<br />
            Allgemeine Liefer- und Geschäftsbedingungen
          </h1>
          <p className="text-[var(--color-grey)] mb-8">Stand: 20. Oktober 2025</p>

          <div className="space-y-8 pb-8">
            <div>
              <h3 className="text-[var(--color-black)] mb-3">I. Geltung</h3>
              <p className="text-[var(--color-grey)] mb-2">
                Diese allgemeinen Liefer- und Geschäftsbedingungen (AGB) gelten für alle vom Fotografen durchgeführten Aufträge, Angebote, Lieferungen und Leistungen – einschließlich digitaler Bereitstellungen über Online-Plattformen, Cloud-Systeme oder Download-Links.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Sie gelten als vereinbart mit Entgegennahme der Lieferung oder Leistung oder mit Annahme des Angebots des Fotografen durch den Kunden, spätestens jedoch mit der Abnahme des Bildmaterials.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Widerspricht der Kunde diesen AGB, hat er dies schriftlich innerhalb von drei Werktagen zu erklären. Abweichende Bedingungen gelten nur, wenn sie schriftlich bestätigt wurden.
              </p>
              <p className="text-[var(--color-grey)]">
                Diese AGB gelten auch für zukünftige Geschäftsbeziehungen, sofern keine abweichenden Regelungen schriftlich getroffen werden.
              </p>
            </div>

            <div>
              <h3 className="text-[var(--color-black)] mb-3">II. Auftragsproduktionen</h3>
              <p className="text-[var(--color-grey)] mb-2">
                Kostenvoranschläge sind unverbindlich. Bei Kostenerhöhungen über 15 % informiert der Fotograf den Kunden unverzüglich.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Der Fotograf kann zur Durchführung notwendige Leistungen Dritter im Namen und auf Rechnung des Kunden beauftragen.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Die Bildauswahl zur Abnahme erfolgt – sofern nicht anders vereinbart – durch den Fotografen.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Die Lieferung gilt mit Bereitstellung des Download-Links oder der Freischaltung der Online-Galerie als erfolgt.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Mängel sind innerhalb von zwei Wochen nach Lieferung schriftlich anzuzeigen. Danach gelten die Aufnahmen als abgenommen.
              </p>
              <p className="text-[var(--color-grey)]">
                Bei Stornierung eines Auftrags nach Produktionsbeginn werden bereits entstandene Kosten sowie 50 % des vereinbarten Honorars als Ausfallhonorar berechnet.
              </p>
            </div>

            <div>
              <h3 className="text-[var(--color-black)] mb-3">III. Überlassenes Bildmaterial</h3>
              <p className="text-[var(--color-grey)] mb-2">
                Diese AGB gelten für sämtliches Bildmaterial, unabhängig von Entstehungsstufe oder Format, einschließlich digitaler Dateien.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Der Kunde erkennt an, dass das Bildmaterial urheberrechtlich geschützte Werke im Sinne von § 2 Abs. 1 Nr. 5 UrhG darstellt.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Gestaltungsvorschläge oder Konzeptionen sind eigenständige, vergütungspflichtige Leistungen.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Das Bildmaterial bleibt Eigentum des Fotografen.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Der Kunde darf es nur zu internen Sichtungs- oder Produktionszwecken an Dritte weitergeben.
              </p>
              <p className="text-[var(--color-grey)]">
                Reklamationen sind innerhalb von zwei Wochen schriftlich mitzuteilen. Danach gilt das Bildmaterial als ordnungsgemäß geliefert.
              </p>
            </div>

            <div>
              <h3 className="text-[var(--color-black)] mb-3">IV. Nutzungsrechte</h3>
              <p className="text-[var(--color-grey)] mb-2">
                Der Kunde erhält ein einfaches Nutzungsrecht zur einmaligen Verwendung für den vereinbarten Zweck.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Ausschließliche, räumliche oder zeitlich unbegrenzte Nutzungsrechte bedürfen einer gesonderten Vereinbarung und eines Aufschlags von mindestens 100 %.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Jede weitergehende Nutzung oder Veränderung bedarf der schriftlichen Zustimmung des Fotografen.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Die Bearbeitung, Veränderung oder KI-gestützte Weiterverarbeitung des Bildmaterials ist nur nach schriftlicher Zustimmung des Fotografen zulässig.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Eine Weitergabe von Nutzungsrechten an Dritte ist ohne Zustimmung ausgeschlossen.
              </p>
              <p className="text-[var(--color-grey)]">
                Mit vollständiger Bezahlung erhält der Kunde die vereinbarten Nutzungsrechte. Bis dahin verbleiben sämtliche Rechte beim Fotografen.
              </p>
            </div>

            <div>
              <h3 className="text-[var(--color-black)] mb-3">V. Haftung</h3>
              <p className="text-[var(--color-grey)] mb-2">
                Der Fotograf haftet nicht für Rechte Dritter (z. B. abgebildete Personen, Marken, Kunstwerke), sofern keine entsprechenden Freigaben vorliegen. Die Einholung notwendiger Genehmigungen obliegt dem Kunden.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Der Kunde stellt den Fotografen von sämtlichen Ansprüchen Dritter frei, die aus der Nutzung der Bilder in Online-Portalen oder sozialen Netzwerken entstehen.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Ab Lieferung liegt die Verantwortung für die sachgemäße Nutzung beim Kunden.
              </p>
              <p className="text-[var(--color-grey)]">
                Für die Verfügbarkeit digitaler Inhalte auf Drittplattformen (z. B. Cloudflare, Pix.immo-Galerien) wird keine Haftung übernommen.
              </p>
            </div>

            <div>
              <h3 className="text-[var(--color-black)] mb-3">V.a Datenverarbeitung & KI-Systeme</h3>
              <p className="text-[var(--color-grey)] mb-2">
                Der Fotograf ist berechtigt, zur Bearbeitung, Analyse und Bereitstellung von Bildmaterial automatisierte oder KI-gestützte Systeme einzusetzen.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Dabei können Daten auch auf Servern außerhalb der EU verarbeitet werden, sofern keine personenbezogenen Daten im Sinne der DSGVO betroffen sind.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Die Verarbeitung erfolgt ausschließlich zum Zweck der technischen Optimierung, Verschlagwortung, Beschriftung oder Exposé-Erstellung.
              </p>
              <p className="text-[var(--color-grey)]">
                Der Kunde erklärt sich mit dieser Form der Verarbeitung einverstanden. Eine Weitergabe an Dritte zu anderen Zwecken erfolgt nicht.
              </p>
            </div>

            <div>
              <h3 className="text-[var(--color-black)] mb-3">VI. Honorare</h3>
              <p className="text-[var(--color-grey)] mb-2">
                Es gilt das vereinbarte Honorar. Ist kein Honorar vereinbart, gilt die jeweils aktuelle MFM-Honorarliste.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Kosten und Auslagen (Reisen, Modelle, Requisiten etc.) trägt der Kunde.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Das Honorar ist bei Lieferung fällig. Bei Teillieferungen können Teilhonorare berechnet werden.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Das Honorar ist auch dann zu zahlen, wenn das Bildmaterial nicht veröffentlicht wird.
              </p>
              <p className="text-[var(--color-grey)]">
                Eine Aufrechnung ist nur mit unbestrittenen oder rechtskräftig festgestellten Forderungen zulässig.
              </p>
            </div>

            <div>
              <h3 className="text-[var(--color-black)] mb-3">VII. Rückgabe von Bildmaterial</h3>
              <p className="text-[var(--color-grey)] mb-2">
                Analoges Material ist spätestens drei Monate nach Lieferung zurückzugeben.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Digitale Daten sind nach Nutzung zu löschen.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Bei Bereitstellung über Online-Galerien entfällt die Rückgabe.
              </p>
              <p className="text-[var(--color-grey)]">
                Rücksendungen erfolgen auf Kosten und Risiko des Kunden.
              </p>
            </div>

            <div>
              <h3 className="text-[var(--color-black)] mb-3">VIII. Vertragsstrafe und Schadensersatz</h3>
              <p className="text-[var(--color-grey)] mb-2">
                Jede unberechtigte Nutzung oder Weitergabe führt zu einer Vertragsstrafe von bis zu dem fünffachen Nutzungshonorar, abhängig vom Umfang der unberechtigten Nutzung.
              </p>
              <p className="text-[var(--color-grey)]">
                Bei fehlendem oder falschem Urhebervermerk wird ein Aufschlag von 100 % des Nutzungshonorars berechnet.
              </p>
            </div>

            <div>
              <h3 className="text-[var(--color-black)] mb-3">IX. Allgemeine Bestimmungen</h3>
              <p className="text-[var(--color-grey)] mb-2">
                Es gilt deutsches Recht, auch bei Auslandslieferungen.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Nebenabreden bedürfen der Schriftform; E-Mail oder digitale Freigabe genügt.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Sollte eine Klausel unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
              </p>
              <p className="text-[var(--color-grey)] mb-2">
                Gerichtsstand und Erfüllungsort ist Hamburg, sofern der Kunde Kaufmann ist. Für Verbraucher gilt der gesetzliche Gerichtsstand.
              </p>
            </div>

            <p className="text-[var(--color-grey)] text-sm mt-8">
              Stand: 20. Oktober 2025
            </p>
          </div>
        </div>
      </div>
    </IPhoneFrame>
  );
}
