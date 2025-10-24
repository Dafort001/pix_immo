import { useState } from 'react';
import { CreditCard, FileText, Lock, ArrowLeft, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

export function PaymentScreen() {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'invoice'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const orderSummary = {
    projectName: 'Einfamilienhaus Musterstraße 12',
    photoCount: 24,
    pricePerPhoto: 3.5,
    total: 84.0,
  };

  const handlePayment = () => {
    setIsProcessing(true);
    // Mock payment processing
    setTimeout(() => {
      setIsProcessing(false);
      alert('Zahlung erfolgreich! (Demo)');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-gray-600">
              <ArrowLeft strokeWidth={1.5} className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            <h1 style={{ fontSize: '24px' }} className="text-gray-900">
              Zahlung
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 style={{ fontSize: '18px' }} className="text-gray-900 mb-4">
                Zahlungsmethode
              </h2>
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'card' | 'invoice')}>
                <div className="space-y-3">
                  <div
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-[#4A5849] bg-[#4A5849]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center cursor-pointer flex-1" style={{ fontSize: '16px' }}>
                      <CreditCard strokeWidth={1.5} className="w-5 h-5 mr-3 text-gray-600" />
                      Kreditkarte / Debitkarte
                    </Label>
                  </div>
                  <div
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      paymentMethod === 'invoice'
                        ? 'border-[#4A5849] bg-[#4A5849]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('invoice')}
                  >
                    <RadioGroupItem value="invoice" id="invoice" />
                    <Label htmlFor="invoice" className="flex items-center cursor-pointer flex-1" style={{ fontSize: '16px' }}>
                      <FileText strokeWidth={1.5} className="w-5 h-5 mr-3 text-gray-600" />
                      Rechnung (14 Tage Zahlungsziel)
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Card Payment Form */}
            {paymentMethod === 'card' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 style={{ fontSize: '18px' }} className="text-gray-900">
                    Kartendaten
                  </h2>
                  <div className="flex items-center gap-2">
                    <Lock strokeWidth={1.5} className="w-4 h-4 text-green-600" />
                    <span style={{ fontSize: '12px' }} className="text-green-600">
                      Sichere Verbindung
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber" style={{ fontSize: '14px' }}>Kartennummer</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      style={{ fontSize: '16px' }}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry" style={{ fontSize: '14px' }}>Gültig bis</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/JJ"
                        style={{ fontSize: '16px' }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvc" style={{ fontSize: '14px' }}>CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        style={{ fontSize: '16px' }}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cardName" style={{ fontSize: '14px' }}>Name auf der Karte</Label>
                    <Input
                      id="cardName"
                      placeholder="Max Mustermann"
                      style={{ fontSize: '16px' }}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Stripe Badge */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-center text-gray-500">
                    <span style={{ fontSize: '12px' }}>Powered by</span>
                    <span style={{ fontSize: '14px' }} className="ml-2 text-[#635BFF]">
                      Stripe
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Invoice Payment Info */}
            {paymentMethod === 'invoice' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 style={{ fontSize: '18px' }} className="text-gray-900 mb-4">
                  Rechnungsadresse
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" style={{ fontSize: '14px' }}>Vorname</Label>
                      <Input id="firstName" style={{ fontSize: '16px' }} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="lastName" style={{ fontSize: '14px' }}>Nachname</Label>
                      <Input id="lastName" style={{ fontSize: '16px' }} className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="company" style={{ fontSize: '14px' }}>Firma (optional)</Label>
                    <Input id="company" style={{ fontSize: '16px' }} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="address" style={{ fontSize: '14px' }}>Straße & Hausnummer</Label>
                    <Input id="address" style={{ fontSize: '16px' }} className="mt-1" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="zip" style={{ fontSize: '14px' }}>PLZ</Label>
                      <Input id="zip" style={{ fontSize: '16px' }} className="mt-1" />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="city" style={{ fontSize: '14px' }}>Ort</Label>
                      <Input id="city" style={{ fontSize: '16px' }} className="mt-1" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
              <h2 style={{ fontSize: '18px' }} className="text-gray-900 mb-4">
                Zusammenfassung
              </h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between">
                  <span style={{ fontSize: '14px' }} className="text-gray-600">Projekt</span>
                  <span style={{ fontSize: '14px' }} className="text-gray-900 text-right max-w-[200px]">
                    {orderSummary.projectName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontSize: '14px' }} className="text-gray-600">Fotos</span>
                  <span style={{ fontSize: '14px' }} className="text-gray-900">
                    {orderSummary.photoCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ fontSize: '14px' }} className="text-gray-600">Preis/Foto</span>
                  <span style={{ fontSize: '14px' }} className="text-gray-900">
                    {orderSummary.pricePerPhoto.toFixed(2)} €
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span style={{ fontSize: '16px' }} className="text-gray-900">Gesamt</span>
                <span style={{ fontSize: '28px' }} className="text-[#4A5849]">
                  {orderSummary.total.toFixed(2)} €
                </span>
              </div>

              <Button
                className="w-full bg-[#4A5849] hover:bg-[#3A4839] text-white"
                size="lg"
                onClick={handlePayment}
                disabled={isProcessing}
                style={{ fontSize: '16px' }}
              >
                {isProcessing ? (
                  'Wird verarbeitet...'
                ) : paymentMethod === 'card' ? (
                  <>
                    <Lock strokeWidth={1.5} className="w-4 h-4 mr-2" />
                    Jetzt bezahlen
                  </>
                ) : (
                  <>
                    <Check strokeWidth={1.5} className="w-4 h-4 mr-2" />
                    Bestellung abschließen
                  </>
                )}
              </Button>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <div className="flex items-center text-gray-600">
                  <Check strokeWidth={1.5} className="w-4 h-4 mr-2 text-green-600" />
                  <span style={{ fontSize: '12px' }}>SSL-verschlüsselt</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Check strokeWidth={1.5} className="w-4 h-4 mr-2 text-green-600" />
                  <span style={{ fontSize: '12px' }}>14 Tage Widerrufsrecht</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Check strokeWidth={1.5} className="w-4 h-4 mr-2 text-green-600" />
                  <span style={{ fontSize: '12px' }}>Zufriedenheitsgarantie</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}