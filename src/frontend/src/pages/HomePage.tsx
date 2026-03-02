import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, ChevronRight, MapPin, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import { Category, City, type Event } from "../backend";
import { EventCard } from "../components/EventCard";
import { useActor } from "../hooks/useActor";
import { useGetAllEvents, useRegisterForEvent } from "../hooks/useQueries";

interface HomePageProps {
  onNavigate: (page: Page) => void;
  isAuthenticated?: boolean;
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
  { value: null, label: "All" },
  { value: Category.businessMeeting, label: "Business Meeting" },
  { value: Category.collegeEvent, label: "College Event" },
  { value: Category.celebrityChiefGuest, label: "Celebrity Chief Guest" },
];

// Static featured events for the hero section
const FEATURED_STATS = [
  { label: "Events Hosted", value: "500+" },
  { label: "Cities Covered", value: "6" },
  { label: "Rewards Distributed", value: "₹50K+" },
];

function useHomeRegistrationState(events: Event[], isAuthenticated: boolean) {
  const { actor } = useActor();
  const { mutate: registerForEvent } = useRegisterForEvent();
  const [registrationData, setRegistrationData] = useState<
    Record<string, { count: number; registered: boolean; registering: boolean }>
  >({});
  const [fetched, setFetched] = useState(false);

  const eventsKey = events.map((e) => e.id.toString()).join(",");
  const prevKey = { current: "" };

  if (actor && eventsKey && eventsKey !== prevKey.current && !fetched) {
    prevKey.current = eventsKey;
    (async () => {
      try {
        const results = await Promise.all(
          events.map(async (event) => {
            const [count, registered] = await Promise.all([
              actor.getEventRegistrations(event.id),
              isAuthenticated
                ? actor.hasUserRegistered(event.id)
                : Promise.resolve(false),
            ]);
            return {
              id: event.id.toString(),
              count: Number(count),
              registered,
            };
          }),
        );
        const newData: Record<
          string,
          { count: number; registered: boolean; registering: boolean }
        > = {};
        for (const r of results) {
          newData[r.id] = {
            count: r.count,
            registered: r.registered,
            registering: false,
          };
        }
        setRegistrationData(newData);
        setFetched(true);
      } catch {
        // silently fail
      }
    })();
  }

  const handleRegister = (event: Event) => {
    const key = event.id.toString();
    setRegistrationData((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] ?? { count: 0, registered: false }),
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
            ...(prev[key] ?? { count: 0, registered: false }),
            registering: false,
          },
        }));
        const msg = err instanceof Error ? err.message : "";
        if (msg.toLowerCase().includes("already")) {
          toast.error("You're already registered for this event.");
        } else {
          toast.error("Registration failed. Please try again.");
        }
      },
    });
  };

  return { registrationData, handleRegister };
}

export function HomePage({
  onNavigate,
  isAuthenticated = false,
}: HomePageProps) {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const { data: events = [], isLoading } = useGetAllEvents();

  const filteredEvents = events.filter((e) => {
    if (selectedCity && e.city !== selectedCity) return false;
    if (selectedCategory && e.category !== selectedCategory) return false;
    return true;
  });

  // Show only first 6 on home
  const displayedEvents = filteredEvents.slice(0, 6);

  const { registrationData, handleRegister } = useHomeRegistrationState(
    displayedEvents,
    isAuthenticated,
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative h-56 md:h-80 w-full">
          <img
            src="/assets/generated/hero-banner.dim_1200x400.jpg"
            alt="EventConnect India - Vibrant events across India"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-primary-foreground/80 text-sm font-medium mb-1 tracking-wider uppercase">
                🇮🇳 Across India
              </p>
              <h1 className="font-display font-black text-2xl md:text-4xl text-white leading-tight mb-2">
                Where India's Best
                <br />
                <span className="text-amber-300">Events Unite</span>
              </h1>
              <p className="text-white/80 text-sm md:text-base mb-4 max-w-sm">
                Discover business meets, college fests & celebrity events. Earn
                ₹10–₹20 for each post!
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => onNavigate("events")}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  <CalendarDays className="w-4 h-4 mr-1.5" />
                  Explore Events
                </Button>
                <Button
                  onClick={() => onNavigate("music")}
                  size="sm"
                  variant="outline"
                  className="bg-white/20 border-white/40 text-white hover:bg-white/30"
                >
                  🎵 Music
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="bg-primary text-primary-foreground">
          <div className="flex items-center justify-around py-3 px-4">
            {FEATURED_STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display font-black text-lg">{stat.value}</p>
                <p className="text-xs text-primary-foreground/70">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reward Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mx-4 mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center shrink-0 reward-glow">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-amber-800">Earn Cash Rewards!</p>
          <p className="text-xs text-amber-700">
            Post events and earn ₹10–₹20 per post. Real rewards, real cash!
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => onNavigate("events")}
          className="ml-auto shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs"
        >
          Post Now
        </Button>
      </motion.div>

      {/* Events Section */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Featured Events
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("events")}
            className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
          >
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* City filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
          {CITIES.map((c) => (
            <button
              type="button"
              key={String(c.value)}
              onClick={() => setSelectedCity(c.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedCity === c.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={String(c.value)}
              onClick={() => setSelectedCategory(c.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedCategory === c.value
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-card text-muted-foreground border-border hover:border-accent/40 hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Event grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {["s1", "s2", "s3", "s4", "s5", "s6"].map((id) => (
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
            ))}
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">No events found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {selectedCity || selectedCategory
                ? "Try changing the filters"
                : "Be the first to post an event!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedEvents.map((event, i) => {
              const regData = registrationData[event.id.toString()];
              return (
                <EventCard
                  key={event.id.toString()}
                  event={event}
                  index={i}
                  isLoggedIn={isAuthenticated}
                  isRegistered={regData?.registered ?? false}
                  registrationCount={regData?.count}
                  isRegistering={regData?.registering ?? false}
                  onRegister={() => handleRegister(event)}
                />
              );
            })}
          </div>
        )}

        {filteredEvents.length > 6 && (
          <div className="mt-6 text-center">
            <Button onClick={() => onNavigate("events")} variant="outline">
              View All {filteredEvents.length} Events
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </section>

      {/* Upcoming Cities Section */}
      <section className="px-4 mt-8 mb-6">
        <h2 className="font-display font-bold text-lg text-foreground mb-4">
          🏙️ Events By City
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CITIES.slice(1).map((city) => {
            const count = events.filter((e) => e.city === city.value).length;
            return (
              <motion.button
                key={String(city.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedCity(city.value);
                  onNavigate("events");
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-sm transition-all text-left"
              >
                <span className="font-semibold text-sm text-card-foreground">
                  {city.label}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {count} events
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
