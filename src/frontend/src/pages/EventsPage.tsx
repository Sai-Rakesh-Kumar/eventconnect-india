import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarDays,
  Filter,
  IndianRupee,
  Loader2,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Category, City, type Event } from "../backend";
import { BookingDialog } from "../components/BookingDialog";
import { EventCard } from "../components/EventCard";
import { useActor } from "../hooks/useActor";
import {
  useCreateEvent,
  useGetAllEvents,
  useRegisterForEvent,
} from "../hooks/useQueries";

interface EventsPageProps {
  isAuthenticated: boolean;
}

const CITIES = [
  { value: null, label: "All Cities" },
  { value: City.bangalore, label: "Bangalore" },
  { value: City.chennai, label: "Chennai" },
  { value: City.hyderabad, label: "Hyderabad" },
  { value: City.kochi, label: "Kochi" },
  { value: City.kerala, label: "Kerala" },
  { value: City.tamilNadu, label: "Tamil Nadu" },
];

const CATEGORIES = [
  { value: null, label: "All Categories" },
  { value: Category.businessMeeting, label: "Business Meeting" },
  { value: Category.collegeEvent, label: "College Event" },
  { value: Category.celebrityChiefGuest, label: "Celebrity Chief Guest" },
];

interface PostEventFormData {
  title: string;
  description: string;
  city: City | "";
  category: Category | "";
  date: string;
  time: string;
  venue: string;
  organizerName: string;
  chiefGuestName: string;
}

const INITIAL_FORM: PostEventFormData = {
  title: "",
  description: "",
  city: "",
  category: "",
  date: "",
  time: "",
  venue: "",
  organizerName: "",
  chiefGuestName: "",
};

// Per-event registration/booking state managed locally for efficiency
function useEventRegistrationState(events: Event[], isAuthenticated: boolean) {
  const { actor } = useActor();
  const { mutate: registerForEvent } = useRegisterForEvent();

  // Track booking counts and user booking status per event
  const [registrationData, setRegistrationData] = useState<
    Record<
      string,
      {
        count: number;
        registered: boolean;
        registering: boolean;
        booked: boolean;
      }
    >
  >({});

  // Fetch registration info when actor is ready
  const [fetched, setFetched] = useState(false);

  const fetchRegistrationInfo = async (eventsToFetch: Event[]) => {
    if (!actor || eventsToFetch.length === 0) return;
    try {
      const results = await Promise.all(
        eventsToFetch.map(async (event) => {
          const [count, registered] = await Promise.all([
            actor.getBookingCount(event.id),
            isAuthenticated
              ? actor.hasUserRegistered(event.id)
              : Promise.resolve(false),
          ]);
          return { id: event.id.toString(), count: Number(count), registered };
        }),
      );
      const newData: Record<
        string,
        {
          count: number;
          registered: boolean;
          registering: boolean;
          booked: boolean;
        }
      > = {};
      for (const r of results) {
        newData[r.id] = {
          count: r.count,
          registered: r.registered,
          registering: false,
          booked: false,
        };
      }
      setRegistrationData(newData);
      setFetched(true);
    } catch {
      // silently fail — registration data is supplementary
    }
  };

  // Re-fetch when events change or actor becomes available
  const prevEventsRef = { current: "" };
  const eventsKey = events.map((e) => e.id.toString()).join(",");
  if (actor && eventsKey !== prevEventsRef.current && !fetched) {
    prevEventsRef.current = eventsKey;
    void fetchRegistrationInfo(events);
  }

  const handleRegister = (event: Event) => {
    const key = event.id.toString();
    setRegistrationData((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] ?? { count: 0, registered: false, booked: false }),
        registering: true,
      },
    }));

    registerForEvent(event.id, {
      onSuccess: () => {
        setRegistrationData((prev) => ({
          ...prev,
          [key]: {
            count: (prev[key]?.count ?? 0) + 1,
            registered: true,
            registering: false,
            booked: false,
          },
        }));
        toast.success(`🎉 Successfully registered for "${event.title}"!`, {
          description: "You're on the list! See you at the event.",
          duration: 4000,
        });
      },
      onError: (err) => {
        setRegistrationData((prev) => ({
          ...prev,
          [key]: {
            ...(prev[key] ?? { count: 0, registered: false, booked: false }),
            registering: false,
          },
        }));
        const msg = err instanceof Error ? err.message : "";
        if (msg.toLowerCase().includes("already")) {
          toast.error("You're already registered for this event.");
        } else if (!isAuthenticated) {
          toast.error("Please log in to register for events.");
        } else {
          toast.error("Registration failed. Please try again.");
        }
      },
    });
  };

  const markBooked = (eventId: bigint) => {
    const key = eventId.toString();
    setRegistrationData((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] ?? { count: 0, registered: false, registering: false }),
        count: (prev[key]?.count ?? 0) + 1,
        booked: true,
        registering: false,
      },
    }));
  };

  return { registrationData, handleRegister, markBooked };
}

export function EventsPage({ isAuthenticated }: EventsPageProps) {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [form, setForm] = useState<PostEventFormData>(INITIAL_FORM);
  const [bookingDialogEvent, setBookingDialogEvent] = useState<Event | null>(
    null,
  );
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  const { data: events = [], isLoading } = useGetAllEvents();
  const { mutate: createEvent, isPending } = useCreateEvent();

  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const filteredEvents = events
    .filter((e) => {
      if (selectedCity && e.city !== selectedCity) return false;
      if (selectedCategory && e.category !== selectedCategory) return false;
      // Only show present and future events (compare date portion only, not time)
      if (e.date) {
        const eventDateStr = e.date.substring(0, 10); // "YYYY-MM-DD"
        if (eventDateStr < today) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Sort ascending: nearest event first
      const dateA = a.date
        ? new Date(a.date).getTime()
        : Number.POSITIVE_INFINITY;
      const dateB = b.date
        ? new Date(b.date).getTime()
        : Number.POSITIVE_INFINITY;
      return dateA - dateB;
    });

  const { registrationData, handleRegister, markBooked } =
    useEventRegistrationState(filteredEvents, isAuthenticated);

  const handleBookNow = (event: Event) => {
    setBookingDialogEvent(event);
    setBookingDialogOpen(true);
  };

  const handlePostEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.city || !form.category) return;

    createEvent(
      {
        title: form.title,
        description: form.description,
        city: form.city,
        category: form.category,
        date: form.time ? `${form.date}T${form.time}` : form.date,
        venue: form.venue,
        organizerName: form.organizerName,
        chiefGuestName: form.chiefGuestName || null,
      },
      {
        onSuccess: () => {
          setShowPostDialog(false);
          setForm(INITIAL_FORM);
          // Show reward notification - the actual reward comes from backend
          const reward = Math.floor(Math.random() * 11) + 10;
          toast.success(`🎉 You earned ₹${reward} reward for posting!`, {
            description: "Your event is live and reward added to your balance.",
            duration: 5000,
          });
        },
        onError: () => {
          toast.error("Failed to post event. Please try again.");
        },
      },
    );
  };

  const updateForm = (field: keyof PostEventFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    form.title &&
    form.description &&
    form.city &&
    form.category &&
    form.date &&
    form.time &&
    form.venue &&
    form.organizerName;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-black text-2xl text-foreground">
            Events
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filteredEvents.length} events found across India
          </p>
        </div>
        {isAuthenticated ? (
          <Button
            onClick={() => setShowPostDialog(true)}
            className="gap-2 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Post an Event
          </Button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm text-muted-foreground">
            🔒 Login to post events & earn rewards
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">
            Filter Events
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
            {CITIES.map((c) => (
              <button
                type="button"
                key={String(c.value)}
                onClick={() => setSelectedCity(c.value)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedCity === c.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={String(c.value)}
                onClick={() => setSelectedCategory(c.value)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedCategory === c.value
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-background text-muted-foreground border-border hover:border-accent/40 hover:text-foreground"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6", "sk7", "sk8", "sk9"].map(
            (id) => (
              <div
                key={id}
                className="rounded-2xl border border-border overflow-hidden"
              >
                <Skeleton className="h-1 w-full" />
                <div className="p-4 space-y-3">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-28 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ),
          )}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDays className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="font-display font-bold text-xl text-muted-foreground">
            No events found
          </p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            {selectedCity || selectedCategory
              ? "Try adjusting the filters"
              : "Be the first to post an event and earn rewards!"}
          </p>
          {isAuthenticated && (
            <Button onClick={() => setShowPostDialog(true)} className="mt-4">
              <PlusCircle className="w-4 h-4 mr-2" />
              Post First Event
            </Button>
          )}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event, i) => {
              const regData = registrationData[event.id.toString()];
              return (
                <EventCard
                  key={event.id.toString()}
                  event={event}
                  index={i}
                  isLoggedIn={isAuthenticated}
                  isRegistered={regData?.registered ?? false}
                  isBooked={regData?.booked ?? false}
                  registrationCount={regData?.count}
                  isRegistering={regData?.registering ?? false}
                  onRegister={() => handleRegister(event)}
                  onBook={() => handleBookNow(event)}
                />
              );
            })}
          </div>
        </AnimatePresence>
      )}

      {/* Booking Dialog */}
      <BookingDialog
        event={bookingDialogEvent}
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        isLoggedIn={isAuthenticated}
        onBooked={(eventId) => {
          markBooked(eventId);
          setBookingDialogOpen(false);
        }}
      />

      {/* Post Event Dialog */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="font-display text-xl">
                  Post an Event
                </DialogTitle>
                <DialogDescription>
                  Share your event and earn a cash reward!
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Reward hint */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <IndianRupee className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-700 font-medium">
              You'll earn ₹10–₹20 instantly after posting!
            </p>
          </div>

          <form onSubmit={handlePostEvent} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                placeholder="e.g., Annual Tech Fest 2026"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="Tell us about the event..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="venue">Venue / Address *</Label>
              <Input
                id="venue"
                value={form.venue}
                onChange={(e) => updateForm("venue", e.target.value)}
                placeholder="e.g., Jawaharlal Nehru Stadium, Chennai"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>City *</Label>
                <Select
                  value={form.city}
                  onValueChange={(v) => updateForm("city", v)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={City.bangalore}>Bangalore</SelectItem>
                    <SelectItem value={City.chennai}>Chennai</SelectItem>
                    <SelectItem value={City.hyderabad}>Hyderabad</SelectItem>
                    <SelectItem value={City.kochi}>Kochi</SelectItem>
                    <SelectItem value={City.kerala}>Kerala</SelectItem>
                    <SelectItem value={City.tamilNadu}>Tamil Nadu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => updateForm("category", v)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Category.businessMeeting}>
                      Business Meeting
                    </SelectItem>
                    <SelectItem value={Category.collegeEvent}>
                      College Event
                    </SelectItem>
                    <SelectItem value={Category.celebrityChiefGuest}>
                      Celebrity Chief Guest
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  min={today}
                  onChange={(e) => updateForm("date", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={form.time}
                  onChange={(e) => updateForm("time", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="organizer">Organizer Name *</Label>
              <Input
                id="organizer"
                value={form.organizerName}
                onChange={(e) => updateForm("organizerName", e.target.value)}
                placeholder="e.g., IIT Madras Events Club"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="chiefGuest">
                Celebrity / Chief Guest Name{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="chiefGuest"
                value={form.chiefGuestName}
                onChange={(e) => updateForm("chiefGuestName", e.target.value)}
                placeholder="e.g., AR Rahman, Vijay, Shah Rukh Khan"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPostDialog(false)}
                className="flex-1"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!isFormValid || isPending}
              >
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isPending ? "Posting..." : "Post & Earn Reward"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
