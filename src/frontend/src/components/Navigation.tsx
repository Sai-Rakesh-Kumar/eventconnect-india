import { Calendar, Film, Home, IndianRupee, Music2, User } from "lucide-react";
import { motion } from "motion/react";
import type { Page } from "../App";
import { useGetCallerUserProfile } from "../hooks/useQueries";
import LoginButton from "./LoginButton";

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isAuthenticated: boolean;
}

const navItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "events", label: "Events", icon: Calendar },
  { id: "music", label: "Music", icon: Music2 },
  { id: "movies", label: "Movies", icon: Film },
  { id: "profile", label: "Profile", icon: User },
];

export function Navigation({
  currentPage,
  onNavigate,
  isAuthenticated,
}: NavigationProps) {
  const { data: userProfile } = useGetCallerUserProfile();

  return (
    <>
      {/* Desktop top nav */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-6 py-3 bg-card/95 backdrop-blur-md border-b border-border shadow-xs">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">
              E
            </span>
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            EventConnect <span className="text-primary">India</span>
          </span>
        </button>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === item.id
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {currentPage === item.id && (
                <motion.div
                  layoutId="nav-indicator-desktop"
                  className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && userProfile && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/20 border border-gold/30">
              <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-sm font-bold text-amber-700">
                {Number(userProfile.rewardBalance)}
              </span>
            </div>
          )}
          <LoginButton />
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${
                currentPage === item.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {currentPage === item.id && (
                <motion.div
                  layoutId="nav-indicator-mobile"
                  className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                />
              )}
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-card/95 backdrop-blur-md border-b border-border">
        <span className="font-display font-bold text-base text-foreground">
          EventConnect <span className="text-primary">India</span>
        </span>
        <div className="flex items-center gap-2">
          {isAuthenticated && userProfile && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold/20 border border-gold/30">
              <IndianRupee className="w-3 h-3 text-amber-600" />
              <span className="text-xs font-bold text-amber-700">
                {Number(userProfile.rewardBalance)}
              </span>
            </div>
          )}
          <LoginButton />
        </div>
      </header>
    </>
  );
}
