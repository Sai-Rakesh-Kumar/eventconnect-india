import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BookingRecord {
    eventId: bigint;
    bookingId: bigint;
    attendeeName: string;
    booker: Principal;
    bookingDate: string;
    phone: string;
    numberOfSeats: bigint;
}
export interface Movie {
    id: bigint;
    title: string;
    cast: string;
    description: string;
    director: string;
    language: Language;
    genre: MovieGenre;
    rating: bigint;
    releaseYear: bigint;
}
export interface Song {
    id: bigint;
    title: string;
    duration: string;
    language: string;
    genre: SongGenre;
    artist: string;
}
export interface Event {
    id: bigint;
    title: string;
    creator: Principal;
    chiefGuestName?: string;
    venue: string;
    city: City;
    date: string;
    description: string;
    organizerName: string;
    category: Category;
    rewardEarned: bigint;
}
export interface UserProfile {
    username: string;
    eventsPosted: Array<bigint>;
    rewardBalance: bigint;
}
export enum Category {
    collegeEvent = "collegeEvent",
    businessMeeting = "businessMeeting",
    celebrityChiefGuest = "celebrityChiefGuest"
}
export enum City {
    chennai = "chennai",
    kerala = "kerala",
    hyderabad = "hyderabad",
    tamilNadu = "tamilNadu",
    bangalore = "bangalore",
    kochi = "kochi"
}
export enum Language {
    tamil = "tamil",
    hindi = "hindi",
    malayalam = "malayalam",
    kannada = "kannada",
    telugu = "telugu"
}
export enum MovieGenre {
    action = "action",
    thriller = "thriller",
    comedy = "comedy",
    horror = "horror",
    devotional = "devotional",
    drama = "drama",
    romance = "romance",
    family = "family"
}
export enum SongGenre {
    pop = "pop",
    tamil = "tamil",
    carnatic = "carnatic",
    bollywood = "bollywood",
    folk = "folk",
    rock = "rock",
    malayalam = "malayalam",
    telugu = "telugu",
    devotional = "devotional",
    classical = "classical"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMovie(title: string, language: Language, genre: MovieGenre, releaseYear: bigint, director: string, cast: string, description: string, rating: bigint): Promise<void>;
    addSong(title: string, artist: string, genre: SongGenre, language: string, duration: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookEvent(eventId: bigint, attendeeName: string, phone: string, numberOfSeats: bigint, bookingDate: string): Promise<void>;
    createEvent(title: string, description: string, city: City, category: Category, date: string, venue: string, organizerName: string, chiefGuestName: string | null): Promise<void>;
    getAllEvents(): Promise<Array<Event>>;
    getAllMovies(): Promise<Array<Movie>>;
    getAllSongs(): Promise<Array<Song>>;
    getBookingCount(eventId: bigint): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEventBookings(eventId: bigint): Promise<Array<BookingRecord>>;
    getEventById(id: bigint): Promise<Event>;
    getEventRegistrations(eventId: bigint): Promise<bigint>;
    getEventsByCategory(category: Category): Promise<Array<Event>>;
    getEventsByCity(city: City): Promise<Array<Event>>;
    getMoviesByGenre(genre: MovieGenre): Promise<Array<Movie>>;
    getMoviesByLanguage(language: Language): Promise<Array<Movie>>;
    getMyBookings(): Promise<Array<BookingRecord>>;
    getSongsByGenre(genre: SongGenre): Promise<Array<Song>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasUserRegistered(eventId: bigint): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    registerForEvent(eventId: bigint): Promise<void>;
    saveCallerUserProfile(username: string): Promise<void>;
    searchMovies(searchTerm: string): Promise<Array<Movie>>;
    searchSongs(searchTerm: string): Promise<Array<Song>>;
}
