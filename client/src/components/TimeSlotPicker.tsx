import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, Clock, MapPin, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FieldError } from "react-hook-form";

/**
 * Parse a date string (YYYY-MM-DD) into a Date object using local timezone
 * Avoids UTC-shift issues from new Date(string) which parses as UTC
 */
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

interface TimeSlot {
  start: string; // ISO timestamp
  end: string;   // ISO timestamp
  available: boolean;
  formatted?: string; // e.g., "09:00"
}

interface TimeSlotPickerProps {
  /**
   * Latitude of the booking location (from Google Maps)
   */
  lat?: string;
  
  /**
   * Longitude of the booking location (from Google Maps)
   */
  lng?: string;
  
  /**
   * Currently selected date (YYYY-MM-DD format)
   */
  selectedDate?: string;
  
  /**
   * Currently selected time (HH:MM format)
   */
  selectedTime?: string;
  
  /**
   * Callback when a slot is selected
   * @param date - Selected date in YYYY-MM-DD format
   * @param time - Selected time in HH:MM format
   */
  onSlotSelect: (date: string, time: string) => void;
  
  /**
   * Optional: Disable dates before this date
   */
  minDate?: Date;
  
  /**
   * Optional: Validation errors from form (preferredDate or preferredTime)
   */
  dateError?: FieldError;
  timeError?: FieldError;
}

export function TimeSlotPicker({
  lat,
  lng,
  selectedDate,
  selectedTime,
  onSlotSelect,
  minDate,
  dateError,
  timeError
}: TimeSlotPickerProps) {
  // Normalize minDate to midnight to allow same-day bookings
  const normalizedMinDate = minDate ? new Date(minDate) : new Date();
  normalizedMinDate.setHours(0, 0, 0, 0);

  const [date, setDate] = useState<Date | undefined>(
    selectedDate ? parseLocalDate(selectedDate) : undefined
  );

  // Sync internal date state with selectedDate prop (e.g., after form reset)
  useEffect(() => {
    if (selectedDate) {
      setDate(parseLocalDate(selectedDate));
    } else {
      setDate(undefined);
    }
  }, [selectedDate]);

  // Format date for API (YYYY-MM-DD) - use local timezone to avoid UTC shift
  const formattedDate = date ? 
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` 
    : undefined;

  // Only fetch slots if we have a date and coordinates
  const shouldFetchSlots = Boolean(formattedDate && lat && lng);

  const { data: slotsResponse, isLoading, error } = useQuery<{ slots: TimeSlot[] }>({
    queryKey: ['/api/calendar/available-slots', formattedDate, lat, lng],
    enabled: shouldFetchSlots,
    queryFn: async () => {
      if (!formattedDate || !lat || !lng) return { slots: [] };
      
      const params = new URLSearchParams({
        date: formattedDate,
        lat: lat,
        lng: lng,
      });
      
      const response = await fetch(`/api/calendar/available-slots?${params}`);
      if (!response.ok) {
        throw new Error('Slots konnten nicht geladen werden');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Extract slots array from response
  const slots = slotsResponse?.slots || [];

  // Handle date selection
  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    
    if (newDate) {
      // Format date in local timezone (avoid UTC shift)
      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, '0');
      const day = String(newDate.getDate()).padStart(2, '0');
      const localDateStr = `${year}-${month}-${day}`;
      
      // Clear selected time when date changes
      onSlotSelect(localDateStr, '');
    } else {
      // Clear form state when calendar is deselected
      onSlotSelect('', '');
    }
  };

  // Handle slot selection
  const handleSlotSelect = (slot: TimeSlot) => {
    if (!date) return;
    
    // Format date in local timezone (avoid UTC shift)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const localDateStr = `${year}-${month}-${day}`;
    
    // Extract time from ISO timestamp (formatted field is safer)
    const time = slot.formatted || new Date(slot.start).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Berlin',
      hour12: false
    });
    
    onSlotSelect(localDateStr, time);
  };

  // Format time range for display
  const formatTimeRange = (slot: TimeSlot): string => {
    const startTime = slot.formatted || new Date(slot.start).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Berlin',
      hour12: false
    });
    
    const endTime = new Date(slot.end).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Berlin',
      hour12: false
    });
    
    return `${startTime} - ${endTime}`;
  };

  // Check if a slot is currently selected
  const isSlotSelected = (slot: TimeSlot): boolean => {
    if (!selectedTime || !date) return false;
    const slotTime = slot.formatted || new Date(slot.start).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Berlin',
      hour12: false
    });
    return slotTime === selectedTime;
  };

  return (
    <div className="space-y-4" data-testid="timeslot-picker">
      {/* Validation errors from form */}
      {(dateError || timeError) && (
        <Alert variant="destructive" data-testid="alert-validation-error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {dateError?.message || timeError?.message}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Address requirement notice */}
      {(!lat || !lng) && (
        <Alert data-testid="alert-address-required">
          <MapPin className="h-4 w-4" />
          <AlertDescription>
            Bitte geben Sie zuerst eine Adresse ein, um verfügbare Termine anzuzeigen.
          </AlertDescription>
        </Alert>
      )}

      {/* Date Picker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarIcon className="h-4 w-4" />
            Termin auswählen
          </CardTitle>
          <CardDescription>
            Bitte wählen Sie einen freien Terminblock im Kalender. 
            Jeder Termin umfasst etwa 90 Minuten vor Ort. Die angezeigten Slots berücksichtigen bereits andere Buchungen und Fahrzeiten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={(date) => {
              // Disable past dates (normalized to midnight for same-day bookings)
              const checkDate = new Date(date);
              checkDate.setHours(0, 0, 0, 0);
              return checkDate < normalizedMinDate;
            }}
            initialFocus
            className="rounded-md border"
            data-testid="calendar-date-picker"
          />
        </CardContent>
      </Card>

      {/* Time Slots */}
      {formattedDate && (lat && lng) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Verfügbare Zeiten
            </CardTitle>
            <CardDescription>
              {date && date.toLocaleDateString('de-DE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Loading state */}
            {isLoading && (
              <div className="space-y-2" data-testid="loading-slots">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            )}

            {/* Error state */}
            {error && (
              <Alert variant="destructive" data-testid="alert-error">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error instanceof Error ? error.message : 'Fehler beim Laden der Termine'}
                </AlertDescription>
              </Alert>
            )}

            {/* Available slots */}
            {!isLoading && !error && slots && (
              <>
                {slots.filter(s => s.available).length === 0 ? (
                  <Alert data-testid="alert-no-slots">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Keine verfügbaren Termine an diesem Tag. Bitte wählen Sie ein anderes Datum.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid gap-2" data-testid="slots-grid">
                    {slots
                      .filter(s => s.available)
                      .map((slot, index) => (
                        <Button
                          key={index}
                          variant={isSlotSelected(slot) ? "default" : "outline"}
                          className={cn(
                            "h-auto py-3 px-4 justify-between",
                            isSlotSelected(slot) && "border-primary"
                          )}
                          onClick={() => handleSlotSelect(slot)}
                          data-testid={`slot-${index}`}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">
                              {formatTimeRange(slot)}
                            </span>
                          </div>
                          {isSlotSelected(slot) && (
                            <Badge variant="secondary" data-testid="badge-selected">
                              Ausgewählt
                            </Badge>
                          )}
                        </Button>
                      ))}
                  </div>
                )}
              </>
            )}

            {/* Info text */}
            <p className="text-xs text-muted-foreground mt-4">
              Die Zeiten berücksichtigen automatisch Anfahrtswege zu anderen Terminen.
              Jeder Termin dauert ca. 90 Minuten.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
