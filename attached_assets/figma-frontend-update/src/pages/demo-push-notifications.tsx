import { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { IPhoneFrame } from '../components/IPhoneFrame';
import { SEOHead } from '../components/SEOHead';
import { PushNotificationBanner, MultiPushBanners } from '../components/PushNotificationBanner';
import { PushNotificationPreview } from '../components/PushNotificationPreview';
import { PUSH_TEMPLATES, fillPushTemplate } from '../utils/push-templates';

export default function DemoPushNotifications() {
  const [language, setLanguage] = useState<'de' | 'en'>('de');
  const [activeNotifications, setActiveNotifications] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('edit_done');

  const templates = [
    { id: 'upload_done', label: 'Upload abgeschlossen / Upload Complete' },
    { id: 'job_confirmed', label: 'Auftrag bestätigt / Order Confirmed' },
    { id: 'edit_done', label: 'Bearbeitung fertig / Editing Complete' },
    { id: 'editor_comment', label: 'Editor Rückfrage / Editor Question' },
    { id: 'expose_ready', label: 'Exposé fertig / Description Ready' },
    { id: 'gallery_expiring', label: 'Galerie läuft ab / Gallery Expiring' },
    { id: 'test_message', label: 'Test-Nachricht / Test Message' },
  ];

  const handleShowNotification = () => {
    const template = PUSH_TEMPLATES[selectedTemplate];
    if (!template) return;

    const newNotification = {
      id: `push-${Date.now()}`,
      type: template.type,
      titleDe: template.titleDe,
      titleEn: template.titleEn,
      messageDe: template.messageDe.replace('#{job_id}', '20251106-AB123'),
      messageEn: template.messageEn.replace('#{job_id}', '20251106-AB123'),
      timestamp: new Date(),
    };

    setActiveNotifications((prev) => [...prev, newNotification]);
  };

  const handleCloseNotification = (id: string) => {
    setActiveNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <IPhoneFrame>
      <SEOHead
        title="Push Notifications Demo – pixcapture.app"
        description="Demo der Push-Benachrichtigungen"
        path="/demo-push-notifications"
      />

      <div
        className="min-h-full bg-[#F9F9F7] dark:bg-[#0E0E0E] flex flex-col"
        style={{ paddingTop: '59px', paddingBottom: '34px' }}
      >
        {/* Active Notifications */}
        {activeNotifications.length > 0 && (
          <MultiPushBanners
            notifications={activeNotifications}
            language={language}
            onClose={handleCloseNotification}
            onClick={(notification) => {
              console.log('Clicked notification:', notification);
              handleCloseNotification(notification.id);
            }}
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
                <Link href="/dev-index">
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <ArrowLeft className="h-5 w-5 text-[#111111] dark:text-white" />
                  </Button>
                </Link>
                <h1
                  className="text-[#111111] dark:text-white"
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 600,
                    fontSize: '22pt',
                    lineHeight: '28pt',
                  }}
                >
                  Push Demo
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
          <p
            className="text-[#6B7280] dark:text-[#A3A3A3] mb-6"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '14pt',
              lineHeight: '20pt',
            }}
          >
            {language === 'de'
              ? 'Teste verschiedene Push-Benachrichtigungen und deren Darstellung.'
              : 'Test different push notifications and their appearance.'}
          </p>

          {/* Template Selector */}
          <div className="mb-6">
            <label
              className="block text-[#111111] dark:text-white mb-3"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 600,
                fontSize: '15pt',
              }}
            >
              {language === 'de' ? 'Nachrichtentyp' : 'Message Type'}
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full p-3 bg-white dark:bg-[#1A1A1C] border border-[#E5E5E5] dark:border-[#2C2C2C] rounded-lg text-[#111111] dark:text-white"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '14pt',
              }}
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </select>
          </div>

          {/* Trigger Button */}
          <Button
            onClick={handleShowNotification}
            className="w-full mb-8 text-white hover:opacity-90"
            style={{
              height: '52px',
              borderRadius: '0px',
              background: '#64BF49',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontWeight: 600,
              fontSize: '16pt',
            }}
          >
            <Send className="h-5 w-5 mr-2" />
            {language === 'de' ? 'Benachrichtigung zeigen' : 'Show Notification'}
          </Button>

          {/* System Preview Examples */}
          <div className="space-y-6">
            <h2
              className="text-[#111111] dark:text-white"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 600,
                fontSize: '18pt',
              }}
            >
              {language === 'de' ? 'System-Vorschau (iOS/Android)' : 'System Preview (iOS/Android)'}
            </h2>

            {/* All Templates Preview */}
            <div className="space-y-4">
              {Object.entries(PUSH_TEMPLATES).map(([key, template]) => {
                const { title, message } = fillPushTemplate(template, language, {
                  job_id: '20251106-AB123',
                });
                return (
                  <div key={key} className="space-y-2">
                    <p
                      className="text-[#6B7280] dark:text-[#A3A3A3] text-sm"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: '11pt',
                      }}
                    >
                      {templates.find((t) => t.id === key)?.label}
                    </p>
                    <PushNotificationPreview
                      title={title}
                      message={message}
                      timestamp={language === 'de' ? 'Vor 2 Min.' : '2 min ago'}
                      isDark={false}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Box */}
          <div
            className="mt-8 p-4 bg-[#F4F4F4] dark:bg-[#1A1A1C] border border-[#E5E5E5] dark:border-[#2C2C2C] rounded-lg"
          >
            <p
              className="text-[#6B7280] dark:text-[#A3A3A3]"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '12pt',
                lineHeight: '18pt',
              }}
            >
              ℹ️{' '}
              {language === 'de'
                ? 'Die In-App-Banner erscheinen am oberen Bildschirmrand und schließen sich nach 4 Sekunden automatisch. Maximal 3 Benachrichtigungen werden gleichzeitig angezeigt.'
                : 'In-app banners appear at the top of the screen and close automatically after 4 seconds. A maximum of 3 notifications are displayed simultaneously.'}
            </p>
          </div>
        </main>
      </div>
    </IPhoneFrame>
  );
}
