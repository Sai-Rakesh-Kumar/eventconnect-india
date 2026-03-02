import { Button } from "@/components/ui/button";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  IndianRupee,
  Loader2,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { Category, City, type Event } from "../backend";

interface EventCardProps {
  event: Event;
  index?: number;
  onRegister?: () => void;
  onBook?: () => void;
  isRegistered?: boolean;
  isBooked?: boolean;
  registrationCount?: number;
  isLoggedIn?: boolean;
  isRegistering?: boolean;
}

export function cityLabel(city: City): string {
  const labels: Record<City, string> = {
    [City.bangalore]: "Bangalore",
    [City.chennai]: "Chennai",
    [City.hyderabad]: "Hyderabad",
    [City.kochi]: "Kochi",
    [City.kerala]: "Kerala",
    [City.tamilNadu]: "Tamil Nadu",
  };
  return labels[city] ?? city;
}

export function categoryLabel(category: Category): string {
  const labels: Record<Category, string> = {
    [Category.collegeEvent]: "College Event",
    [Category.businessMeeting]: "Business Meeting",
    [Category.celebrityChiefGuest]: "Celebrity Chief Guest",
  };
  return labels[category] ?? category;
}

function CityBadge({ city }: { city: City }) {
  const classMap: Record<City, string> = {
    [City.bangalore]: "city-badge-bangalore",
    [City.chennai]: "city-badge-chennai",
    [City.hyderabad]: "city-badge-hyderabad",
    [City.kochi]: "city-badge-kochi",
    [City.kerala]: "city-badge-kerala",
    [City.tamilNadu]: "city-badge-tamilnadu",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${classMap[city]}`}
    >
      <MapPin className="w-3 h-3" />
      {cityLabel(city)}
    </span>
  );
}

function CategoryBadge({ category }: { category: Category }) {
  const classMap: Record<Category, string> = {
    [Category.collegeEvent]: "category-badge-college",
    [Category.businessMeeting]: "category-badge-business",
    [Category.celebrityChiefGuest]: "category-badge-celebrity",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${classMap[category]}`}
    >
      {categoryLabel(category)}
    </span>
  );
}

export function EventCard({
  event,
  index = 0,
  onRegister,
  onBook,
  isRegistered = false,
  isBooked = false,
  registrationCount,
  isLoggedIn = false,
  isRegistering = false,
}: EventCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
    >
      {/* Color accent strip based on category */}
      <div
        className={`h-1 w-full ${
          event.category === Category.celebrityChiefGuest
            ? "bg-gradient-to-r from-amber-400 to-orange-500"
            : event.category === Category.businessMeeting
              ? "bg-gradient-to-r from-emerald-500 to-teal-500"
              : "bg-gradient-to-r from-blue-500 to-violet-500"
        }`}
      />

      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <CityBadge city={event.city} />
          <CategoryBadge category={event.category} />
        </div>

        <h3 className="font-display font-bold text-base text-card-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {event.description}
        </p>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          {/* Exact date & time - shown prominently */}
          <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-primary/5 border border-primary/15">
            <Calendar className="w-3.5 h-3.5 shrink-0 text-primary mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/70 leading-none mb-0.5">
                Event Date
              </p>
              <p className="font-bold text-foreground text-xs">
                {new Date(event.date).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              {event.date.includes("T") && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Clock className="w-3 h-3" />
                  {new Date(event.date).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              )}
            </div>
          </div>
          {event.venue && (
            <div className="flex items-start gap-1.5">
              <Building2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{event.venue}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Organizer: {event.organizerName}</span>
          </div>
          {event.chiefGuestName && (
            <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
              <Star className="w-4 h-4 shrink-0 text-amber-500 fill-amber-400" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 leading-none mb-0.5">
                  Chief Guest / Celebrity
                </p>
                <p className="text-sm font-bold text-amber-900 truncate">
                  {event.chiefGuestName}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer: reward, directions, register */}
        <div className="mt-3 space-y-2">
          {/* Top row: reward + directions */}
          <div className="flex items-center justify-between">
            {Number(event.rewardEarned) > 0 && (
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                <IndianRupee className="w-3 h-3" />
                <span>Reward: ₹{Number(event.rewardEarned)} earned</span>
              </div>
            )}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                event.venue
                  ? `${event.venue} ${cityLabel(event.city)} India`
                  : `${event.title} ${cityLabel(event.city)} India`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <MapPin className="w-3 h-3" />
              Directions
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Registration row */}
          <div className="flex items-center gap-2 pt-1 border-t border-border/60">
            {/* Registration count */}
            {registrationCount !== undefined && registrationCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                {Number(registrationCount)} registered
              </span>
            )}

            <div className="ml-auto">
              {isBooked || isRegistered ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Booked ✓
                </span>
              ) : isLoggedIn ? (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBook ? onBook() : onRegister?.();
                  }}
                  disabled={isRegistering}
                  className="h-7 px-3 text-xs font-semibold"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    "Book Now"
                  )}
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground italic">
                  Login to book
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
