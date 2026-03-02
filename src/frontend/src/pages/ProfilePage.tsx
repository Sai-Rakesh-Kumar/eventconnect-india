import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Award,
  CalendarDays,
  IndianRupee,
  LogIn,
  Sparkles,
  Ticket,
  User,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { EventCard } from "../components/EventCard";
import LoginButton from "../components/LoginButton";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetAllEvents,
  useGetCallerUserProfile,
  useGetMyBookings,
} from "../hooks/useQueries";

interface ProfilePageProps {
  isAuthenticated: boolean;
  onNavigateToLogin: () => void;
}

export function ProfilePage({ isAuthenticated }: ProfilePageProps) {
  const { identity } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const { data: allEvents = [] } = useGetAllEvents();
  const { data: myBookings = [], isLoading: bookingsLoading } =
    useGetMyBookings(isAuthenticated);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <LogIn className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-display font-black text-2xl text-foreground mb-2">
          Join EventConnect India
        </h2>
        <p className="text-muted-foreground max-w-sm mb-6">
          Log in to post events, track your rewards, and manage your profile.
        </p>
        <div className="flex items-center gap-3 flex-wrap justify-center mb-6">
          {[
            { icon: CalendarDays, label: "Post Events" },
            { icon: IndianRupee, label: "Earn Rewards" },
            { icon: Sparkles, label: "Get Recognized" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border"
            >
              <Icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
        <LoginButton />
      </div>
    );
  }

  if (profileLoading || !isFetched) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-4 p-6 bg-card rounded-2xl border border-border">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <User className="w-12 h-12 text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground">Setting up your profile...</p>
      </div>
    );
  }

  // Get this user's posted events
  const userEventIds = new Set(
    userProfile.eventsPosted.map((id) => id.toString()),
  );
  const userEvents = allEvents.filter((e) => userEventIds.has(e.id.toString()));

  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 8)}...${principal.slice(-6)}`
    : "";

  const rewardBalance = Number(userProfile.rewardBalance);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Profile header card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border overflow-hidden mb-4"
      >
        {/* Decorative header */}
        <div className="h-16 bg-gradient-to-r from-primary via-accent to-primary/60" />

        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div className="w-16 h-16 rounded-full bg-card border-4 border-card flex items-center justify-center shadow-sm">
              <User className="w-8 h-8 text-primary" />
            </div>
            <LoginButton />
          </div>

          <h2 className="font-display font-black text-xl text-foreground">
            {userProfile.username}
          </h2>
          {shortPrincipal && (
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              {shortPrincipal}
            </p>
          )}
        </div>
      </motion.div>

      {/* Reward balance */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 mb-4 reward-glow"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-1">
              Total Rewards Earned
            </p>
            <div className="flex items-center gap-2">
              <IndianRupee className="w-6 h-6 text-amber-600" />
              <span className="font-display font-black text-3xl text-amber-700">
                {rewardBalance}
              </span>
            </div>
            <p className="text-xs text-amber-600/80 mt-1">
              ₹10–₹20 per event posted
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-amber-400/20 flex items-center justify-center">
            <Award className="w-8 h-8 text-amber-500" />
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-3 mb-6"
      >
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display font-black text-2xl text-foreground">
            {userProfile.eventsPosted.length}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Events Posted</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display font-black text-2xl text-foreground">
            ₹{rewardBalance > 0 ? rewardBalance : "0"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Balance</p>
        </div>
      </motion.div>

      {/* User's events */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-display font-bold text-base text-foreground mb-3 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          Your Events ({userEvents.length})
        </h3>

        {userEvents.length === 0 ? (
          <div className="text-center py-10 bg-card rounded-xl border border-border">
            <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-medium text-muted-foreground">
              No events posted yet
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Post your first event to earn ₹10–₹20!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {userEvents.map((event, i) => (
              <EventCard key={event.id.toString()} event={event} index={i} />
            ))}
          </div>
        )}
      </motion.div>

      {/* My Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6"
      >
        <h3 className="font-display font-bold text-base text-foreground mb-3 flex items-center gap-2">
          <Ticket className="w-4 h-4 text-primary" />
          My Bookings ({myBookings.length})
        </h3>

        {bookingsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <Skeleton key={n} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : myBookings.length === 0 ? (
          <div className="text-center py-10 bg-card rounded-xl border border-border">
            <Ticket className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-medium text-muted-foreground">No bookings yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Go book an event!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myBookings.map((booking) => {
              const matchedEvent = allEvents.find(
                (e) => e.id.toString() === booking.eventId.toString(),
              );
              return (
                <motion.div
                  key={booking.bookingId.toString()}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl border border-border p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-display font-bold text-sm text-foreground line-clamp-1">
                        {matchedEvent?.title ??
                          `Event #${booking.eventId.toString()}`}
                      </p>
                      {matchedEvent?.date && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(matchedEvent.date).toLocaleDateString(
                            "en-IN",
                            {
                              weekday: "short",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </p>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 shrink-0">
                      <Ticket className="w-3 h-3" />
                      Booked
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {booking.attendeeName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {Number(booking.numberOfSeats)} seat
                      {Number(booking.numberOfSeats) > 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      Booked on{" "}
                      {new Date(booking.bookingDate).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Footer */}
      <footer className="mt-8 text-center">
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
