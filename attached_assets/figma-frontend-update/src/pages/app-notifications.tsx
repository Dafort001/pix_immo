import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { IPhoneFrame } from '../components/IPhoneFrame';
import { SEOHead } from '../components/SEOHead';
import { PushNotificationPreview } from '../components/PushNotificationPreview';
import { PushNotificationBanner } from '../components/PushNotificationBanner';
import { PUSH_TEMPLATES } from '../utils/push-templates';
import { toast } from 'sonner@2.0.3';

export default function AppNotifications() {
  const [, setLocation] = useLocation();
  const [language, setLanguage] = useState<'de' | 'en'>('de');

  // Push notification preferences
  const [statusUpdates, setStatusUpdates] = useState(true);
  const [editorQuestions, setEditorQuestions] = useState(true);
  const [marketingNews, setMarketingNews] = useState(false);

  // Test notification state
  const [showTestNotification, setShowTestNotification] = useState(false);

  const content = {
    de: {
      title: 'Push-Benachrichtigungen',
      subtitle: 'Erhalte aktuelle Informationen zu deinem Auftrag direkt auf dein Gerät.',
      statusTitle: 'Status-Updates',
      statusDesc: 'Benachrichtige mich, wenn mein Auftrag bestätigt, bearbeitet oder abgeschlossen wurde.',
      editorTitle: 'Rückfragen des Editors',
      editorDesc: 'Erhalte eine Benachrichtigung, wenn ein Editor eine Rückfrage zu meinen Bildern hat.',
      marketingTitle: 'Marketing-News',
      marketingDesc: 'Erhalte Informationen über neue Funktionen und Angebote von pix.immo.',
      infoText: 'Push-Nachrichten enthalten keine personenbezogenen Daten. Du kannst sie jederzeit deaktivieren.',
      testButton: 'Test senden',
      previewTitle: 'Vorschau',
      previewDesc: 'So erscheinen Push-Nachrichten auf deinem Gerät:',
      back: 'Zurück',
    },
    en: {
      title: 'Push Notifications',
      subtitle: 'Receive current information about your order directly on your device.',
      statusTitle: 'Status Updates',
      statusDesc: 'Notify me when my order is confirmed, processed or completed.',
      editorTitle: 'Editor Questions',
      editorDesc: 'Get a notification when an editor has a question about my photos.',
      marketingTitle: 'Marketing News',
      marketingDesc: 'Receive information about new features and offers from pix.immo.',
      infoText: 'Push notifications do not contain any personal data. You can disable them at any time.',
      testButton: 'Send test',
      previewTitle: 'Preview',
      previewDesc: 'This is how push notifications appear on your device:',
      back: 'Back',
    },
  };

  const currentContent = content[language];

  const handleTestPush = () => {
    setShowTestNotification(true);
    toast.success(language === 'de' ? 'Test-Benachrichtigung gesendet' : 'Test notification sent');
  };

  const handleSave = () => {
    // Save preferences to localStorage
    const preferences = {
      statusUpdates,
      editorQuestions,
      marketingNews,
    };
    localStorage.setItem('pushNotificationPreferences', JSON.stringify(preferences));
    toast.success(language === 'de' ? 'Einstellungen gespeichert' : 'Settings saved');
  };

  return (
    <IPhoneFrame>
      <SEOHead
        title="Push-Benachrichtigungen – pixcapture.app"
        description="Verwalte deine Push-Benachrichtigungen für Job-Updates"
        path="/pixcapture-app/notifications"
      />

      <div
        className="min-h-full bg-[#F9F9F7] dark:bg-[#0E0E0E] flex flex-col"
        style={{ paddingTop: '59px', paddingBottom: '34px' }}
      >
        {/* Test Notification Banner */}
        {showTestNotification && (
          <PushNotificationBanner
            notification={{
              id: 'test-1',
              type: 'status',
              titleDe: PUSH_TEMPLATES.test_message.titleDe,
              titleEn: PUSH_TEMPLATES.test_message.titleEn,
              messageDe: PUSH_TEMPLATES.test_message.messageDe,
              messageEn: PUSH_TEMPLATES.test_message.messageEn,
              timestamp: new Date(),
            }}
            language={language}
            onClose={() => setShowTestNotification(false)}
          />
        )}

        {/* Header */}
        <header
          className="bg-white dark:bg-[#1A1A1C] border-b border-[#E5E5E5] dark:border-[#2C2C2C] sticky z-10"
          style={{ top: '59px' }}
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocation('/pixcapture-app/settings')}
                  className="h-10 w-10"
                >
                  <ArrowLeft className="h-5 w-5 text-[#111111] dark:text-white" />
                </Button>
                <h1
                  className="text-[#111111] dark:text-white"
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 600,
                    fontSize: '22pt',
                    lineHeight: '28pt',
                  }}
                >
                  {currentContent.title}
                </h1>
              </div>

              {/* Language Toggle */}
              <div className="flex items-center gap-2 text-[13pt]">
                <button
                  onClick={() => setLanguage('de')}
                  className={`px-2 py-1 transition-colors ${
                    language === 'de' ? 'text-[#111111] dark:text-white' : 'text-[#999]'
                  }`}
                  style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}
                >
                  DE
                </button>
                <span className="text-[#999]">|</span>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 transition-colors ${
                    language === 'en' ? 'text-[#111111] dark:text-white' : 'text-[#999]'
                  }`}
                  style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 py-6 overflow-y-auto" style={{ paddingBottom: '40px' }}>
          {/* Subtitle */}
          <p
            className="text-[#6B7280] dark:text-[#A3A3A3] mb-6"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '14pt',
              lineHeight: '20pt',
            }}
          >
            {currentContent.subtitle}
          </p>

          {/* Settings Container */}
          <div
            className="bg-[#F7F7F7] dark:bg-[#1A1A1C] p-4 mb-6"
            style={{
              borderRadius: '10px',
            }}
          >
            <div className="space-y-4">
              {/* Status Updates Toggle */}
              <div className="flex items-start gap-3">
                <Switch
                  id="status-updates"
                  checked={statusUpdates}
                  onCheckedChange={setStatusUpdates}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="status-updates"
                    className="text-[#222] dark:text-[#ECECEC] cursor-pointer"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontWeight: 600,
                      fontSize: '15pt',
                    }}
                  >
                    {currentContent.statusTitle}
                  </Label>
                  <p
                    className="text-[#6B7280] dark:text-[#A3A3A3] mt-1"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '13pt',
                      lineHeight: '18pt',
                    }}
                  >
                    {currentContent.statusDesc}
                  </p>
                </div>
              </div>

              <div className="h-px bg-[#E5E5E5] dark:bg-[#2C2C2C]" />

              {/* Editor Questions Toggle */}
              <div className="flex items-start gap-3">
                <Switch
                  id="editor-questions"
                  checked={editorQuestions}
                  onCheckedChange={setEditorQuestions}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="editor-questions"
                    className="text-[#222] dark:text-[#ECECEC] cursor-pointer"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontWeight: 600,
                      fontSize: '15pt',
                    }}
                  >
                    {currentContent.editorTitle}
                  </Label>
                  <p
                    className="text-[#6B7280] dark:text-[#A3A3A3] mt-1"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '13pt',
                      lineHeight: '18pt',
                    }}
                  >
                    {currentContent.editorDesc}
                  </p>
                </div>
              </div>

              <div className="h-px bg-[#E5E5E5] dark:bg-[#2C2C2C]" />

              {/* Marketing News Toggle */}
              <div className="flex items-start gap-3">
                <Switch
                  id="marketing-news"
                  checked={marketingNews}
                  onCheckedChange={setMarketingNews}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="marketing-news"
                    className="text-[#222] dark:text-[#ECECEC] cursor-pointer"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontWeight: 600,
                      fontSize: '15pt',
                    }}
                  >
                    {currentContent.marketingTitle}
                  </Label>
                  <p
                    className="text-[#6B7280] dark:text-[#A3A3A3] mt-1"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '13pt',
                      lineHeight: '18pt',
                    }}
                  >
                    {currentContent.marketingDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Text */}
          <p
            className="text-[#999] mb-6 text-center"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '10pt',
              lineHeight: '14pt',
            }}
          >
            {currentContent.infoText}
          </p>

          {/* Test Button */}
          <Button
            onClick={handleTestPush}
            className="w-full mb-8 text-white hover:opacity-90"
            style={{
              height: '52px',
              borderRadius: '0px',
              background: '#74A4EA',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: 600,
              fontSize: '16pt',
            }}
          >
            <Send className="h-5 w-5 mr-2" />
            {currentContent.testButton}
          </Button>

          {/* Preview Section */}
          <div className="space-y-4">
            <h2
              className="text-[#111111] dark:text-white"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 600,
                fontSize: '18pt',
              }}
            >
              {currentContent.previewTitle}
            </h2>
            <p
              className="text-[#6B7280] dark:text-[#A3A3A3] mb-4"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '13pt',
                lineHeight: '18pt',
              }}
            >
              {currentContent.previewDesc}
            </p>

            {/* Light Mode Preview */}
            <div className="space-y-2">
              <p
                className="text-[#6B7280] dark:text-[#A3A3A3] text-center"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '11pt',
                }}
              >
                Light Mode
              </p>
              <PushNotificationPreview
                title="pix.immo"
                message={
                  language === 'de'
                    ? 'Deine bearbeiteten Fotos sind jetzt in deiner Galerie verfügbar.'
                    : 'Your edited photos are now available in your gallery.'
                }
                timestamp={language === 'de' ? 'Vor 1 Min.' : '1 min ago'}
                isDark={false}
              />
            </div>

            {/* Dark Mode Preview */}
            <div className="space-y-2 mt-6">
              <p
                className="text-[#6B7280] dark:text-[#A3A3A3] text-center"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '11pt',
                }}
              >
                Dark Mode
              </p>
              <PushNotificationPreview
                title="pix.immo"
                message={
                  language === 'de'
                    ? 'Der Editor hat eine Rückfrage zu einem deiner Bilder. Bitte kurz prüfen.'
                    : 'Your editor has a question about one of your photos. Please take a look.'
                }
                timestamp={language === 'de' ? 'Vor 5 Min.' : '5 min ago'}
                isDark={true}
              />
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="w-full mt-8 text-white hover:opacity-90"
            style={{
              height: '52px',
              borderRadius: '0px',
              background: '#1A1A1C',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: 600,
              fontSize: '16pt',
            }}
          >
            {language === 'de' ? 'Einstellungen speichern' : 'Save Settings'}
          </Button>
        </main>
      </div>
    </IPhoneFrame>
  );
}
