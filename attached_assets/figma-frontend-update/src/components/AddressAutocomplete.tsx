import { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { MapPin } from "lucide-react";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (address: string, lat: number, lng: number) => void;
  placeholder?: string;
  className?: string;
}

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Adresse eingeben...",
  className,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Using Nominatim (OpenStreetMap) API for geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `format=json&q=${encodeURIComponent(value)}&` +
          `countrycodes=de&limit=5&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'de',
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        }
      } catch (error) {
        console.error("Address autocomplete error:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [value]);

  const handleSelect = (suggestion: Suggestion) => {
    onChange(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    
    if (onSelect) {
      onSelect(
        suggestion.display_name,
        parseFloat(suggestion.lat),
        parseFloat(suggestion.lon)
      );
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={className}
          autoComplete="off"
        />
        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0 text-sm"
              onClick={() => handleSelect(suggestion)}
            >
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{suggestion.display_name}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {isLoading && value.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg px-4 py-3 text-sm text-muted-foreground">
          Suche nach Adressen...
        </div>
      )}
    </div>
  );
}
