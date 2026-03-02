import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Loader2, Phone, Ticket, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Event } from "../backend";
import { useBookEvent } from "../hooks/useQueries";

interface BookingDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoggedIn: boolean;
  onBooked: (eventId: bigint) => void;
}

interface BookingFormData {
  attendeeName: string;
  phone: string;
  numberOfSeats: string;
}

const INITIAL_FORM: BookingFormData = {
  attendeeName: "",
  phone: "",
  numberOfSeats: "1",
};

export function BookingDialog({
  event,
  open,
  onOpenChange,
  onBooked,
}: BookingDialogProps) {
  const [form, setForm] = useState<BookingFormData>(INITIAL_FORM);
  const { mutate: bookEvent, isPending } = useBookEvent();

  const updateForm = (field: keyof BookingFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    const seats = Number.parseInt(form.numberOfSeats, 10);
    if (Number.isNaN(seats) || seats < 1 || seats > 10) {
      toast.error("Please select 1–10 seats.");
      return;
    }

    const bookingDate = new Date().toISOString().split("T")[0];

    bookEvent(
      {
        eventId: event.id,
        attendeeName: form.attendeeName.trim(),
        phone: form.phone.trim(),
        numberOfSeats: BigInt(seats),
        bookingDate,
      },
      {
        onSuccess: () => {
          toast.success(`Booking confirmed! See you at ${event.title}`, {
            description: `${seats} seat${seats > 1 ? "s" : ""} booked for ${form.attendeeName}.`,
            duration: 5000,
          });
          onBooked(event.id);
          onOpenChange(false);
          setForm(INITIAL_FORM);
        },
        onError: (err) => {
          const msg = err instanceof Error ? err.message : "";
          if (msg.toLowerCase().includes("already")) {
            toast.error("You've already booked this event.");
          } else {
            toast.error("Booking failed. Please try again.");
          }
        },
      },
    );
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isPending) {
      setForm(INITIAL_FORM);
    }
    onOpenChange(nextOpen);
  };

  const isFormValid =
    form.attendeeName.trim() &&
    form.phone.trim() &&
    form.numberOfSeats &&
    Number.parseInt(form.numberOfSeats, 10) >= 1;

  if (!event) return null;

  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Ticket className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="font-display text-lg leading-tight line-clamp-2">
                Book: {event.title}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-1.5 mt-0.5 text-xs">
                <Calendar className="w-3 h-3 shrink-0" />
                {formattedDate}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Attendee Name */}
          <div className="space-y-1.5">
            <Label htmlFor="booking-name" className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Attendee Name *
            </Label>
            <Input
              id="booking-name"
              value={form.attendeeName}
              onChange={(e) => updateForm("attendeeName", e.target.value)}
              placeholder="Your full name"
              required
              disabled={isPending}
              autoComplete="name"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label
              htmlFor="booking-phone"
              className="flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              Phone Number *
            </Label>
            <Input
              id="booking-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => updateForm("phone", e.target.value)}
              placeholder="+91 98765 43210"
              required
              disabled={isPending}
              autoComplete="tel"
            />
            <p className="text-xs text-muted-foreground">
              Indian mobile number (e.g. +91 XXXXX XXXXX)
            </p>
          </div>

          {/* Number of Seats */}
          <div className="space-y-1.5">
            <Label
              htmlFor="booking-seats"
              className="flex items-center gap-1.5"
            >
              <Ticket className="w-3.5 h-3.5" />
              Number of Seats *
            </Label>
            <Input
              id="booking-seats"
              type="number"
              min={1}
              max={10}
              value={form.numberOfSeats}
              onChange={(e) => updateForm("numberOfSeats", e.target.value)}
              required
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Maximum 10 seats per booking
            </p>
          </div>

          {/* Booking date info */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/60 border border-border text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 shrink-0 text-primary" />
            <span>
              Booking date:{" "}
              <span className="font-semibold text-foreground">
                {new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>{" "}
              (today)
            </span>
          </div>

          <DialogFooter className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isPending}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4 mr-2" />
                  Confirm Booking
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
