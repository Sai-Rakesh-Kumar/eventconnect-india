import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { Navigation } from "./components/Navigation";
import { ProfileSetupModal } from "./components/ProfileSetupModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import { EventsPage } from "./pages/EventsPage";
import { HomePage } from "./pages/HomePage";
import { MoviesPage } from "./pages/MoviesPage";
import { MusicPage } from "./pages/MusicPage";
import { ProfilePage } from "./pages/ProfilePage";

export type Page = "home" | "events" | "music" | "movies" | "profile";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen bg-background mandala-bg">
      <Navigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isAuthenticated={isAuthenticated}
      />

      <main className="pb-20 md:pb-0 md:pt-16">
        {currentPage === "home" && (
          <HomePage
            onNavigate={setCurrentPage}
            isAuthenticated={isAuthenticated}
          />
        )}
        {currentPage === "events" && (
          <EventsPage isAuthenticated={isAuthenticated} />
        )}
        {currentPage === "music" && (
          <MusicPage isAuthenticated={isAuthenticated} />
        )}
        {currentPage === "movies" && (
          <MoviesPage isAuthenticated={isAuthenticated} />
        )}
        {currentPage === "profile" && (
          <ProfilePage
            isAuthenticated={isAuthenticated}
            onNavigateToLogin={() => setCurrentPage("home")}
          />
        )}
      </main>

      {showProfileSetup && <ProfileSetupModal />}
      <Toaster richColors position="top-center" />
    </div>
  );
}
