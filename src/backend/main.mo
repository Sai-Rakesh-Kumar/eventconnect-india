import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type City = { #bangalore; #chennai; #hyderabad; #kochi; #kerala; #tamilNadu };
  public type Category = { #businessMeeting; #collegeEvent; #celebrityChiefGuest };
  public type MovieGenre = { #action; #comedy; #drama; #romance; #thriller; #horror; #devotional; #family };
  public type SongGenre = { #bollywood; #carnatic; #telugu; #tamil; #malayalam; #pop; #rock; #classical; #devotional; #folk };
  public type Language = { #hindi; #tamil; #telugu; #malayalam; #kannada };

  public type Event = {
    id : Nat;
    title : Text;
    description : Text;
    city : City;
    category : Category;
    date : Text;
    venue : Text;
    organizerName : Text;
    chiefGuestName : ?Text;
    rewardEarned : Nat;
    creator : Principal;
  };

  public type Song = {
    id : Nat;
    title : Text;
    artist : Text;
    genre : SongGenre;
    language : Text;
    duration : Text;
  };

  public type Movie = {
    id : Nat;
    title : Text;
    language : Language;
    genre : MovieGenre;
    releaseYear : Nat;
    director : Text;
    cast : Text;
    description : Text;
    rating : Nat;
  };

  public type UserProfile = {
    username : Text;
    rewardBalance : Nat;
    eventsPosted : [Nat];
  };

  public type BookingRecord = {
    bookingId : Nat;
    eventId : Nat;
    attendeeName : Text;
    phone : Text;
    numberOfSeats : Nat;
    bookingDate : Text;
    booker : Principal;
  };

  module Event {
    func cityToNat(city : City) : Nat {
      switch (city) {
        case (#bangalore) { 0 };
        case (#chennai) { 1 };
        case (#hyderabad) { 2 };
        case (#kochi) { 3 };
        case (#kerala) { 4 };
        case (#tamilNadu) { 5 };
      };
    };

    func categoryToNat(category : Category) : Nat {
      switch (category) {
        case (#businessMeeting) { 0 };
        case (#collegeEvent) { 1 };
        case (#celebrityChiefGuest) { 2 };
      };
    };

    public func compareByCityCategoryTitle(event1 : Event, event2 : Event) : Order.Order {
      switch (Nat.compare(cityToNat(event1.city), cityToNat(event2.city))) {
        case (#equal) {
          Nat.compare(categoryToNat(event1.category), categoryToNat(event2.category));
        };
        case (order) { order };
      };
    };
  };

  module Movie {
    public func compareById(movie1 : Movie, movie2 : Movie) : Order.Order {
      Nat.compare(movie1.id, movie2.id);
    };
  };

  module Song {
    public func compareById(song1 : Song, song2 : Song) : Order.Order {
      Nat.compare(song1.id, song2.id);
    };
  };

  let events = Map.empty<Nat, Event>();
  let songs = Map.empty<Nat, Song>();
  let movies = Map.empty<Nat, Movie>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let eventRegistrations = Map.empty<Nat, List.List<Principal>>();
  let bookings = Map.empty<Nat, BookingRecord>();

  var nextEventId = 1;
  var nextSongId = 1;
  var nextMovieId = 1;
  var nextBookingId = 1;

  system func preupgrade() {
    if (nextEventId == 1) {
      initializeEventSeedData();
    };
    if (nextSongId == 1) {
      initializeSongSeedData();
    };
    if (nextMovieId == 1) {
      initializeMovieSeedData();
    };
  };

  func initializeEventSeedData() {
    let event1 : Event = {
      id = nextEventId;
      title = "Bangalore Business Summit";
      description = "Annual business summit in Bangalore.";
      city = #bangalore;
      category = #businessMeeting;
      date = "2026-04-10T10:00";
      venue = "Bangalore International Exhibition Centre, Tumkur Road, Bangalore";
      organizerName = "EventConnect India";
      chiefGuestName = null;
      rewardEarned = 15;
      creator = Principal.fromText("2vxsx-fae");
    };

    let event2 : Event = {
      id = nextEventId + 1;
      title = "Chennai Cultural Fest";
      description = "Celebration of arts and culture in Chennai.";
      city = #chennai;
      category = #collegeEvent;
      date = "2026-05-20T14:00";
      venue = "Anna Centenary Library, Chennai";
      organizerName = "EventConnect India";
      chiefGuestName = ?"Celebrity Chief Guest";
      rewardEarned = 18;
      creator = Principal.fromText("2vxsx-fae");
    };

    let event3 : Event = {
      id = nextEventId + 2;
      title = "Hyderabad Tech Conclave 2026";
      description = "Technology conference in Hyderabad.";
      city = #hyderabad;
      category = #businessMeeting;
      date = "2026-06-15T09:00";
      venue = "Hyderabad International Convention Centre, Hyderabad";
      organizerName = "EventConnect India";
      chiefGuestName = ?"Satya Nadella";
      rewardEarned = 17;
      creator = Principal.fromText("2vxsx-fae");
    };

    let event4 : Event = {
      id = nextEventId + 3;
      title = "Kerala Celebrity Night";
      description = "Celebrity event in Kerala.";
      city = #kerala;
      category = #celebrityChiefGuest;
      date = "2026-07-04T18:00";
      venue = "Kochi Marine Drive, Kochi, Kerala";
      organizerName = "EventConnect India";
      chiefGuestName = ?"Mohanlal";
      rewardEarned = 20;
      creator = Principal.fromText("2vxsx-fae");
    };

    let event5 : Event = {
      id = nextEventId + 4;
      title = "Tamil Nadu College Fest";
      description = "College festival in Tamil Nadu.";
      city = #tamilNadu;
      category = #collegeEvent;
      date = "2026-08-12T10:00";
      venue = "Anna University Campus, Chennai, Tamil Nadu";
      organizerName = "EventConnect India";
      chiefGuestName = ?"Vijay";
      rewardEarned = 15;
      creator = Principal.fromText("2vxsx-fae");
    };

    let event6 : Event = {
      id = nextEventId + 5;
      title = "Kochi Business Expo 2027";
      description = "Business expo in Kochi.";
      city = #kochi;
      category = #businessMeeting;
      date = "2027-02-14T09:30";
      venue = "Lulu International Convention Centre, Kochi";
      organizerName = "EventConnect India";
      chiefGuestName = null;
      rewardEarned = 12;
      creator = Principal.fromText("2vxsx-fae");
    };

    events.add(event1.id, event1);
    events.add(event2.id, event2);
    events.add(event3.id, event3);
    events.add(event4.id, event4);
    events.add(event5.id, event5);
    events.add(event6.id, event6);

    nextEventId += 6;
  };

  func initializeSongSeedData() {
    let genres : [(Text, SongGenre)] = [
      ("bollywood", #bollywood),
      ("carnatic", #carnatic),
      ("telugu", #telugu),
      ("tamil", #tamil),
      ("malayalam", #malayalam),
      ("pop", #pop),
      ("rock", #rock),
      ("classical", #classical),
      ("devotional", #devotional),
      ("folk", #folk),
    ];

    for ((genreName, genre) in genres.values()) {
      for (i in Nat.range(1, 4)) {
        let song : Song = {
          id = nextSongId;
          title = genreName.concat(" Song " # i.toText());
          artist = genreName.concat(" Artist " # i.toText());
          genre;
          language = "Indian";
          duration = "3:30";
        };
        songs.add(song.id, song);
        nextSongId += 1;
      };
    };
  };

  func initializeMovieSeedData() {
    let moviesData : [(Text, Language, MovieGenre, Nat, Text, Text, Text, Nat)] = [
      // Hindi
      ("Dilwale Dulhania Le Jayenge", #hindi, #romance, 1995, "Aditya Chopra", "Shah Rukh Khan, Kajol", "Classic Bollywood romance.", 85),
      ("3 Idiots", #hindi, #comedy, 2009, "Rajkumar Hirani", "Aamir Khan, Kareena Kapoor", "Comedy-drama about engineering students.", 90),
      ("Gadar: Ek Prem Katha", #hindi, #action, 2001, "Anil Sharma", "Sunny Deol, Ameesha Patel", "Action-packed love story.", 80),
      // Tamil
      ("Baahubali: The Beginning", #tamil, #action, 2015, "S. S. Rajamouli", "Prabhas, Rana Daggubati", "Epic action film.", 88),
      ("Vikram Vedha", #tamil, #thriller, 2017, "Pushkar-Gayathri", "Madhavan, Vijay Sethupathi", "Thriller with action elements.", 85),
      ("Kanchana", #tamil, #horror, 2011, "Raghava Lawrence", "Raghava Lawrence", "Comedy horror film.", 75),
      // Kannada
      ("KGF: Chapter 1", #kannada, #action, 2018, "Prashanth Neel", "Yash, Srinidhi Shetty", "Action-packed crime drama.", 87),
      ("RangiTaranga", #kannada, #thriller, 2015, "Anup Bhandari", "Nirup Bhandari", "Thriller with suspense.", 83),
      ("Ugramm", #kannada, #action, 2014, "Prashanth Neel", "Sriimurali", "Action-packed revenge saga.", 81),
      // Telugu
      ("Baahubali: The Beginning", #telugu, #action, 2015, "S. S. Rajamouli", "Prabhas, Rana Daggubati", "Epic action film.", 88),
      ("Arjun Reddy", #telugu, #romance, 2017, "Sandeep Reddy Vanga", "Vijay Deverakonda, Shalini Pandey", "Romantic drama film.", 84),
      ("Geetha Govindam", #telugu, #comedy, 2018, "Parasuram", "Vijay Deverakonda, Rashmika Mandanna", "Romantic comedy.", 82),
      // Malayalam
      ("Drishyam", #malayalam, #thriller, 2013, "Jeethu Joseph", "Mohanlal, Meena", "Suspense thriller.", 87),
      ("Premam", #malayalam, #romance, 2015, "Alphonse Puthren", "Nivin Pauly, Sai Pallavi", "Romantic coming-of-age film.", 85),
      ("Narasimham", #malayalam, #action, 2000, "Shaji Kailas", "Mohanlal, Aishwarya", "Action drama.", 82),
    ];

    for ((title, language, genre, releaseYear, director, cast, description, rating) in moviesData.values()) {
      let movie : Movie = {
        id = nextMovieId;
        title;
        language;
        genre;
        releaseYear;
        director;
        cast;
        description;
        rating;
      };
      movies.add(movie.id, movie);
      nextMovieId += 1;
    };
  };

  public shared ({ caller }) func createEvent(
    title : Text,
    description : Text,
    city : City,
    category : Category,
    date : Text,
    venue : Text,
    organizerName : Text,
    chiefGuestName : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create events");
    };

    let reward = 10 + (nextEventId % 11);

    let event : Event = {
      id = nextEventId;
      title;
      description;
      city;
      category;
      date;
      venue;
      organizerName;
      chiefGuestName;
      rewardEarned = reward;
      creator = caller;
    };

    events.add(nextEventId, event);

    switch (userProfiles.get(caller)) {
      case (null) {
        let profile : UserProfile = {
          username = organizerName;
          rewardBalance = reward;
          eventsPosted = [nextEventId];
        };
        userProfiles.add(caller, profile);
      };
      case (?profile) {
        let updatedProfile : UserProfile = {
          username = profile.username;
          rewardBalance = profile.rewardBalance + reward;
          eventsPosted = profile.eventsPosted.concat([nextEventId]);
        };
        userProfiles.add(caller, updatedProfile);
      };
    };

    nextEventId += 1;
  };

  public query ({ caller }) func getAllEvents() : async [Event] {
    events.values().toArray().sort(Event.compareByCityCategoryTitle);
  };

  public query ({ caller }) func getEventsByCity(city : City) : async [Event] {
    let filtered = events.values().filter(
      func(event) { event.city == city }
    );
    filtered.toArray();
  };

  public query ({ caller }) func getEventsByCategory(category : Category) : async [Event] {
    let filtered = events.values().filter(
      func(event) { event.category == category }
    );
    filtered.toArray();
  };

  public query ({ caller }) func getEventById(id : Nat) : async Event {
    switch (events.get(id)) {
      case (null) { Runtime.trap("Event not found") };
      case (?event) { event };
    };
  };

  public shared ({ caller }) func addSong(
    title : Text,
    artist : Text,
    genre : SongGenre,
    language : Text,
    duration : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add songs");
    };

    let song : Song = {
      id = nextSongId;
      title;
      artist;
      genre;
      language;
      duration;
    };

    songs.add(nextSongId, song);
    nextSongId += 1;
  };

  public query ({ caller }) func getAllSongs() : async [Song] {
    songs.values().toArray().sort(Song.compareById);
  };

  public query ({ caller }) func getSongsByGenre(genre : SongGenre) : async [Song] {
    let filtered = songs.values().filter(
      func(song) { song.genre == genre }
    );
    filtered.toArray();
  };

  public query ({ caller }) func searchSongs(searchTerm : Text) : async [Song] {
    let filtered = songs.values().filter(
      func(song) {
        (song.title.contains(#text searchTerm) or song.artist.contains(#text searchTerm));
      }
    );
    filtered.toArray();
  };

  public shared ({ caller }) func addMovie(
    title : Text,
    language : Language,
    genre : MovieGenre,
    releaseYear : Nat,
    director : Text,
    cast : Text,
    description : Text,
    rating : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add movies");
    };

    let movie : Movie = {
      id = nextMovieId;
      title;
      language;
      genre;
      releaseYear;
      director;
      cast;
      description;
      rating;
    };

    movies.add(nextMovieId, movie);
    nextMovieId += 1;
  };

  public query ({ caller }) func getAllMovies() : async [Movie] {
    movies.values().toArray().sort(Movie.compareById);
  };

  public query ({ caller }) func getMoviesByLanguage(language : Language) : async [Movie] {
    let filtered = movies.values().filter(
      func(movie) { movie.language == language }
    );
    filtered.toArray();
  };

  public query ({ caller }) func getMoviesByGenre(genre : MovieGenre) : async [Movie] {
    let filtered = movies.values().filter(
      func(movie) { movie.genre == genre }
    );
    filtered.toArray();
  };

  public query ({ caller }) func searchMovies(searchTerm : Text) : async [Movie] {
    let filtered = movies.values().filter(
      func(movie) {
        (movie.title.contains(#text searchTerm) or movie.director.contains(#text searchTerm) or movie.cast.contains(#text searchTerm));
      }
    );
    filtered.toArray();
  };

  public shared ({ caller }) func registerForEvent(eventId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register for events");
    };

    switch (eventRegistrations.get(eventId)) {
      case (null) {
        let newList = List.singleton(caller);
        eventRegistrations.add(eventId, newList);
      };
      case (?existingList) {
        if (existingList.any(func(p) { p == caller })) {
          Runtime.trap("Already registered for this event");
        };
        existingList.add(caller);
      };
    };
  };

  public query ({ caller }) func getEventRegistrations(eventId : Nat) : async Nat {
    switch (eventRegistrations.get(eventId)) {
      case (null) { 0 };
      case (?registrations) { registrations.size() };
    };
  };

  public query ({ caller }) func hasUserRegistered(eventId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check registration");
    };

    switch (eventRegistrations.get(eventId)) {
      case (null) { false };
      case (?registeredUsers) { registeredUsers.any(func(p) { p == caller }) };
    };
  };

  public shared ({ caller }) func bookEvent(
    eventId : Nat,
    attendeeName : Text,
    phone : Text,
    numberOfSeats : Nat,
    bookingDate : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can book events");
    };

    if (not events.containsKey(eventId)) {
      Runtime.trap("Event not found for booking");
    };

    let duplicateBooking = bookings.values().any(
      func(b) { b.eventId == eventId and b.booker == caller }
    );
    if (duplicateBooking) {
      Runtime.trap("Already booked");
    };

    let bookingRec : BookingRecord = {
      bookingId = nextBookingId;
      eventId;
      attendeeName;
      phone;
      numberOfSeats;
      bookingDate;
      booker = caller;
    };

    bookings.add(nextBookingId, bookingRec);

    switch (eventRegistrations.get(eventId)) {
      case (null) {
        let newList = List.singleton(caller);
        eventRegistrations.add(eventId, newList);
      };
      case (?existingList) {
        if (not existingList.any(func(p) { p == caller })) {
          existingList.add(caller);
        };
      };
    };

    nextBookingId += 1;
  };

  public query ({ caller }) func getMyBookings() : async [BookingRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };

    let records = bookings.values().filter(
      func(b) { b.booker == caller }
    );
    records.toArray();
  };

  public query ({ caller }) func getEventBookings(eventId : Nat) : async [BookingRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can view all event bookings");
    };

    let eventBookings = bookings.values().filter(
      func(b) { b.eventId == eventId }
    );

    eventBookings.toArray();
  };

  public query ({ caller }) func getBookingCount(eventId : Nat) : async Nat {
    bookings.values().filter(
      func(b) { b.eventId == eventId }
    ).toArray().size();
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    let profile : UserProfile = {
      username;
      rewardBalance = 0;
      eventsPosted = [];
    };
    userProfiles.add(caller, profile);
  };
};
