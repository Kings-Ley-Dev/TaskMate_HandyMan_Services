import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AvailabilityCalendarProps {
  providerId: string;
  editable?: boolean;
}

interface TimeSlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const AvailabilityCalendar = ({ providerId, editable = false }: AvailabilityCalendarProps) => {
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, [providerId]);

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from("availability")
        .select("*")
        .eq("provider_id", providerId);

      if (error) throw error;

      if (data && data.length > 0) {
        setAvailability(data);
      } else {
        // Initialize with default availability
        const defaultSlots = DAYS.map((_, index) => ({
          day_of_week: index,
          start_time: "09:00",
          end_time: "17:00",
          is_available: index >= 1 && index <= 5, // Monday to Friday
        }));
        setAvailability(defaultSlots);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (dayIndex: number) => {
    setAvailability((prev) =>
      prev.map((slot) =>
        slot.day_of_week === dayIndex
          ? { ...slot, is_available: !slot.is_available }
          : slot
      )
    );
  };

  const handleTimeChange = (dayIndex: number, field: "start_time" | "end_time", value: string) => {
    setAvailability((prev) =>
      prev.map((slot) =>
        slot.day_of_week === dayIndex ? { ...slot, [field]: value } : slot
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Delete existing availability
      await supabase
        .from("availability")
        .delete()
        .eq("provider_id", providerId);

      // Insert new availability
      const { error } = await supabase.from("availability").insert(
        availability.map((slot) => ({
          provider_id: providerId,
          day_of_week: slot.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_available: slot.is_available,
        }))
      );

      if (error) throw error;

      toast.success("Availability updated successfully");
      fetchAvailability();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading availability...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {availability.map((slot) => (
          <div key={slot.day_of_week} className="flex items-center gap-4">
            {editable && (
              <Checkbox
                checked={slot.is_available}
                onCheckedChange={() => handleToggleDay(slot.day_of_week)}
              />
            )}
            <Label className="w-28">{DAYS[slot.day_of_week]}</Label>
            {slot.is_available ? (
              <>
                <input
                  type="time"
                  value={slot.start_time}
                  onChange={(e) =>
                    handleTimeChange(slot.day_of_week, "start_time", e.target.value)
                  }
                  disabled={!editable}
                  className="px-3 py-2 border rounded-md"
                />
                <span>to</span>
                <input
                  type="time"
                  value={slot.end_time}
                  onChange={(e) =>
                    handleTimeChange(slot.day_of_week, "end_time", e.target.value)
                  }
                  disabled={!editable}
                  className="px-3 py-2 border rounded-md"
                />
              </>
            ) : (
              <span className="text-muted-foreground">Unavailable</span>
            )}
          </div>
        ))}
        {editable && (
          <Button onClick={handleSave} disabled={saving} className="w-full mt-4">
            {saving ? "Saving..." : "Save Availability"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
