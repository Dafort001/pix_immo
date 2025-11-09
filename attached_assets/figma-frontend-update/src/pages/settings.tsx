import { useState } from 'react';
import { Link } from 'wouter';
import {
  User,
  MapPin,
  Bell,
  Globe,
  Save,
  ArrowLeft,
  Menu,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner@2.0.3';

export default function Settings() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Profile
  const [firstName, setFirstName] = useState('Max');
  const [lastName, setLastName] = useState('Mustermann');
  const [company, setCompany] = useState('Mustermann Immobilien GmbH');
  const [phone, setPhone] = useState('+49 40 1234567');
  const [email, setEmail] = useState('max@mustermann.de');

  // Billing Address
  const [street, setStreet] = useState('Musterstraße 123');
  const [zipCode, setZipCode] = useState('20095');
  const [city, setCity] = useState('Hamburg');
  const [country, setCountry] = useState('Deutschland');

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [uploadNotifications, setUploadNotifications] = useState(true);
  const [qcNotifications, setQcNotifications] = useState(true);
  const [deliveryNotifications, setDeliveryNotifications] = useState(true);

  // Language
  const [language, setLanguage] = useState('de');

  const handleSaveProfile = () => {
    toast.success('Profil gespeichert', {
      description: 'Ihre Änderungen wurden erfolgreich gespeichert.',
    });
  };

  const handleSaveBilling = () => {
    toast.success('Rechnungsadresse gespeichert', {
      description: 'Ihre Änderungen wurden erfolgreich gespeichert.',
    });
  };

  const handleSaveNotifications = () => {
    toast.success('Benachrichtigungen gespeichert', {
      description: 'Ihre Einstellungen wurden aktualisiert.',
    });
  };

  const handleSaveLanguage = () => {
    toast.success('Sprache gespeichert', {
      description: 'Ihre Spracheinstellung wurde aktualisiert.',
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E9E9E9]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
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
              <Link href="/dashboard">
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
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="w-full justify-start">Abmelden</Button>
            </Link>
          </nav>
        </div>
      )}

      {/* Title */}
      <div className="bg-white border-b border-[#E9E9E9]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
          <h1 className="text-2xl">Einstellungen</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-[1400px] mx-auto px-4 lg:px-8 py-8 w-full">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full sm:w-auto mb-6 grid grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2 hidden sm:block" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="billing">
              <MapPin className="h-4 w-4 mr-2 hidden sm:block" />
              Rechnung
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2 hidden sm:block" />
              Benachrichtigungen
            </TabsTrigger>
            <TabsTrigger value="language">
              <Globe className="h-4 w-4 mr-2 hidden sm:block" />
              Sprache
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="bg-white rounded-lg p-6 lg:p-8">
              <h2 className="text-2xl mb-6">Profil</h2>
              <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Vorname</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nachname</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="company">Firma</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <Button
                  className="bg-[#64BF49] hover:bg-[#64BF49]/90"
                  onClick={handleSaveProfile}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="bg-white rounded-lg p-6 lg:p-8">
              <h2 className="text-2xl mb-6">Rechnungsadresse</h2>
              <div className="space-y-6 max-w-2xl">
                <div>
                  <Label htmlFor="street">Straße und Hausnummer</Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">PLZ</Label>
                    <Input
                      id="zipCode"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Ort</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country">Land</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <Button
                  className="bg-[#64BF49] hover:bg-[#64BF49]/90"
                  onClick={handleSaveBilling}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="bg-white rounded-lg p-6 lg:p-8">
              <h2 className="text-2xl mb-6">Benachrichtigungen</h2>
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-sm mb-4 text-[#8E9094]">Benachrichtigungskanäle</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-[#E9E9E9] rounded-lg">
                      <div>
                        <div className="text-sm mb-1">E-Mail Benachrichtigungen</div>
                        <div className="text-xs text-[#8E9094]">
                          Erhalten Sie Updates per E-Mail
                        </div>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-[#E9E9E9] rounded-lg">
                      <div>
                        <div className="text-sm mb-1">SMS Benachrichtigungen</div>
                        <div className="text-xs text-[#8E9094]">
                          Wichtige Updates per SMS
                        </div>
                      </div>
                      <Switch
                        checked={smsNotifications}
                        onCheckedChange={setSmsNotifications}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm mb-4 text-[#8E9094]">Event-Benachrichtigungen</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-[#E9E9E9] rounded-lg">
                      <div>
                        <div className="text-sm mb-1">Upload bestätigt</div>
                        <div className="text-xs text-[#8E9094]">
                          Benachrichtigung bei erfolgreichem Upload
                        </div>
                      </div>
                      <Switch
                        checked={uploadNotifications}
                        onCheckedChange={setUploadNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-[#E9E9E9] rounded-lg">
                      <div>
                        <div className="text-sm mb-1">QC abgeschlossen</div>
                        <div className="text-xs text-[#8E9094]">
                          Benachrichtigung nach Qualitätskontrolle
                        </div>
                      </div>
                      <Switch
                        checked={qcNotifications}
                        onCheckedChange={setQcNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-[#E9E9E9] rounded-lg">
                      <div>
                        <div className="text-sm mb-1">Auslieferung</div>
                        <div className="text-xs text-[#8E9094]">
                          Benachrichtigung bei fertiger Auslieferung
                        </div>
                      </div>
                      <Switch
                        checked={deliveryNotifications}
                        onCheckedChange={setDeliveryNotifications}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  className="bg-[#64BF49] hover:bg-[#64BF49]/90"
                  onClick={handleSaveNotifications}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Language Tab */}
          <TabsContent value="language">
            <div className="bg-white rounded-lg p-6 lg:p-8">
              <h2 className="text-2xl mb-6">Sprache</h2>
              <div className="space-y-6 max-w-2xl">
                <div>
                  <Label htmlFor="language">Bevorzugte Sprache</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-[#8E9094] mt-2">
                    Die Spracheinstellung wird für die gesamte Benutzeroberfläche verwendet.
                  </div>
                </div>

                <Button
                  className="bg-[#64BF49] hover:bg-[#64BF49]/90"
                  onClick={handleSaveLanguage}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Speichern
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
