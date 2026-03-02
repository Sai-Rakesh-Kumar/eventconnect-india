import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type BookingRecord,
  Category,
  City,
  type Event,
  Language,
  type Movie,
  MovieGenre,
  type Song,
  SongGenre,
  type UserProfile,
} from "../backend";
import { useActor } from "./useActor";

export { Category, City, Language, MovieGenre, SongGenre };
export type { BookingRecord };

// ── Events ─────────────────────────────────────────────────────────────────

export function useGetAllEvents() {
  const { actor, isFetching } = useActor();
  return useQuery<Event[]>({
    queryKey: ["events", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEvents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetEventsByCity(city: City | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Event[]>({
    queryKey: ["events", "city", city],
    queryFn: async () => {
      if (!actor || !city) return [];
      return actor.getEventsByCity(city);
    },
    enabled: !!actor && !isFetching && !!city,
  });
}

export function useGetEventsByCategory(category: Category | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Event[]>({
    queryKey: ["events", "category", category],
    queryFn: async () => {
      if (!actor || !category) return [];
      return actor.getEventsByCategory(category);
    },
    enabled: !!actor && !isFetching && !!category,
  });
}

export function useCreateEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      city: City;
      category: Category;
      date: string;
      venue: string;
      organizerName: string;
      chiefGuestName: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createEvent(
        data.title,
        data.description,
        data.city,
        data.category,
        data.date,
        data.venue,
        data.organizerName,
        data.chiefGuestName,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ── Songs ──────────────────────────────────────────────────────────────────

export function useGetAllSongs() {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["songs", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSongs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSongsByGenre(genre: SongGenre | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["songs", "genre", genre],
    queryFn: async () => {
      if (!actor || !genre) return [];
      return actor.getSongsByGenre(genre);
    },
    enabled: !!actor && !isFetching && !!genre,
  });
}

export function useSearchSongs(searchTerm: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["songs", "search", searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm.trim()) return [];
      return actor.searchSongs(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.trim().length > 0,
  });
}

export function useAddSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      artist: string;
      genre: SongGenre;
      language: string;
      duration: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addSong(
        data.title,
        data.artist,
        data.genre,
        data.language,
        data.duration,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });
}

// ── Movies ─────────────────────────────────────────────────────────────────

export function useGetAllMovies() {
  const { actor, isFetching } = useActor();
  return useQuery<Movie[]>({
    queryKey: ["movies", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMovies();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchMovies(searchTerm: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Movie[]>({
    queryKey: ["movies", "search", searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm.trim()) return [];
      return actor.searchMovies(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.trim().length > 0,
  });
}

export function useAddMovie() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      language: Language;
      genre: MovieGenre;
      releaseYear: bigint;
      director: string;
      cast: string;
      description: string;
      rating: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addMovie(
        data.title,
        data.language,
        data.genre,
        data.releaseYear,
        data.director,
        data.cast,
        data.description,
        data.rating,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
}

// ── Event Registrations ────────────────────────────────────────────────────

export function useGetEventRegistrations(eventId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["eventRegistrations", eventId?.toString()],
    queryFn: async () => {
      if (!actor || eventId === null) return BigInt(0);
      return actor.getEventRegistrations(eventId);
    },
    enabled: !!actor && !isFetching && eventId !== null,
  });
}

export function useHasUserRegistered(
  eventId: bigint | null,
  isLoggedIn: boolean,
) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["hasUserRegistered", eventId?.toString()],
    queryFn: async () => {
      if (!actor || eventId === null) return false;
      return actor.hasUserRegistered(eventId);
    },
    enabled: !!actor && !isFetching && eventId !== null && isLoggedIn,
  });
}

export function useRegisterForEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerForEvent(eventId);
    },
    onSuccess: (_data, eventId) => {
      queryClient.invalidateQueries({
        queryKey: ["eventRegistrations", eventId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["hasUserRegistered", eventId.toString()],
      });
    },
  });
}

// ── Bookings ───────────────────────────────────────────────────────────────

export function useBookEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      eventId: bigint;
      attendeeName: string;
      phone: string;
      numberOfSeats: bigint;
      bookingDate: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.bookEvent(
        data.eventId,
        data.attendeeName,
        data.phone,
        data.numberOfSeats,
        data.bookingDate,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["bookingCount", variables.eventId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
    },
  });
}

export function useGetMyBookings(isLoggedIn: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<BookingRecord[]>({
    queryKey: ["myBookings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyBookings();
    },
    enabled: !!actor && !isFetching && isLoggedIn,
  });
}

export function useGetBookingCount(eventId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["bookingCount", eventId?.toString()],
    queryFn: async () => {
      if (!actor || eventId === null) return BigInt(0);
      return actor.getBookingCount(eventId);
    },
    enabled: !!actor && !isFetching && eventId !== null,
  });
}

// ── User Profile ───────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}
