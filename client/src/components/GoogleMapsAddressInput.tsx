/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface AddressData {
  formatted: string;
  street?: string;
  postalCode?: string;
  city?: string;
  lat: number;
  lng: number;
  placeId: string;
}

interface GoogleMapsAddressInputProps {
  onAddressSelect: (address: AddressData) => void;
  defaultStreet?: string;
  defaultPostalCode?: string;
  defaultCity?: string;
  defaultLat?: number;
  defaultLng?: number;
}

export function GoogleMapsAddressInput({
  onAddressSelect,
  defaultStreet = '',
  defaultPostalCode = '',
  defaultCity = '',
  defaultLat,
  defaultLng,
}: GoogleMapsAddressInputProps) {
  const [street, setStreet] = useState(defaultStreet);
  const [postalCode, setPostalCode] = useState(defaultPostalCode);
  const [city, setCity] = useState(defaultCity);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(
    defaultLat && defaultLng ? { lat: defaultLat, lng: defaultLng } : null
  );
  const [error, setError] = useState<string | null>(null);

  const streetInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    if (!apiKey) {
      setError('Google Maps API key nicht konfiguriert');
      return;
    }

    if (typeof google === 'undefined') {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeAutocomplete;
      document.head.appendChild(script);
    } else {
      initializeAutocomplete();
    }
  }, []);

  const initializeAutocomplete = () => {
    if (!streetInputRef.current) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(streetInputRef.current, {
      componentRestrictions: { country: 'de' },
      fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
      types: ['address'],
    });

    autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
  };

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place || !place.geometry || !place.geometry.location) {
      setError('Bitte wählen Sie eine gültige Adresse aus den Vorschlägen');
      return;
    }

    setError(null);
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    let streetName = '';
    let streetNumber = '';
    let postalCodeValue = '';
    let cityValue = '';

    place.address_components?.forEach((component: google.maps.GeocoderAddressComponent) => {
      const types = component.types;
      if (types.includes('route')) {
        streetName = component.long_name;
      }
      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      }
      if (types.includes('postal_code')) {
        postalCodeValue = component.long_name;
      }
      if (types.includes('locality')) {
        cityValue = component.long_name;
      }
    });

    const fullStreet = streetNumber ? `${streetName} ${streetNumber}` : streetName;
    
    setStreet(fullStreet);
    setPostalCode(postalCodeValue);
    setCity(cityValue);
    setMapCenter({ lat, lng });
    setShowMap(true);

    onAddressSelect({
      formatted: place.formatted_address || '',
      street: fullStreet,
      postalCode: postalCodeValue,
      city: cityValue,
      lat,
      lng,
      placeId: place.place_id || '',
    });

    setTimeout(() => {
      initializeMap(lat, lng);
    }, 100);
  };

  const initializeMap = (lat: number, lng: number) => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
    } else {
      mapInstanceRef.current.setCenter({ lat, lng });
    }

    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    markerRef.current = new google.maps.Marker({
      position: { lat, lng },
      map: mapInstanceRef.current,
      title: 'Objektstandort',
    });
  };

  useEffect(() => {
    if (showMap && mapCenter) {
      initializeMap(mapCenter.lat, mapCenter.lng);
    }
  }, [showMap, mapCenter]);

  return (
    <div className="space-y-4" data-testid="component-google-maps-address">
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive" data-testid="text-maps-error">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="street" data-testid="label-street">
          Straße + Hausnummer*
        </Label>
        <Input
          id="street"
          ref={streetInputRef}
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="Straße und Hausnummer eingeben..."
          data-testid="input-street"
        />
        <p className="text-sm text-muted-foreground">
          Beginnen Sie mit der Eingabe und wählen Sie aus den Vorschlägen
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postalCode" data-testid="label-postal-code">
            PLZ*
          </Label>
          <Input
            id="postalCode"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="PLZ"
            data-testid="input-postal-code"
            readOnly
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" data-testid="label-city">
            Ort*
          </Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ort"
            data-testid="input-city"
            readOnly
          />
        </div>
      </div>

      {showMap && mapCenter && (
        <Card className="overflow-hidden" data-testid="card-map">
          <div
            ref={mapRef}
            className="w-full h-64"
            data-testid="div-map-container"
          />
        </Card>
      )}
    </div>
  );
}
