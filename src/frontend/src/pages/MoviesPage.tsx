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
import { Film, Loader2, PlusCircle, Search, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";
import { Language, MovieGenre } from "../backend";
import {
  useAddMovie,
  useGetAllMovies,
  useSearchMovies,
} from "../hooks/useQueries";

interface MoviesPageProps {
  isAuthenticated: boolean;
}

const LANGUAGES: { value: Language | null; label: string }[] = [
  { value: null, label: "All Languages" },
  { value: Language.hindi, label: "Hindi" },
  { value: Language.tamil, label: "Tamil" },
  { value: Language.telugu, label: "Telugu" },
  { value: Language.malayalam, label: "Malayalam" },
  { value: Language.kannada, label: "Kannada" },
];

const GENRES: { value: MovieGenre | null; label: string }[] = [
  { value: null, label: "All" },
  { value: MovieGenre.action, label: "Action" },
  { value: MovieGenre.comedy, label: "Comedy" },
  { value: MovieGenre.drama, label: "Drama" },
  { value: MovieGenre.romance, label: "Romance" },
  { value: MovieGenre.thriller, label: "Thriller" },
  { value: MovieGenre.horror, label: "Horror" },
  { value: MovieGenre.devotional, label: "Devotional" },
  { value: MovieGenre.family, label: "Family" },
];

const LANGUAGE_COLORS: Record<Language, string> = {
  [Language.hindi]: "bg-orange-100 text-orange-700 border-orange-200",
  [Language.tamil]: "bg-red-100 text-red-700 border-red-200",
  [Language.telugu]: "bg-blue-100 text-blue-700 border-blue-200",
  [Language.malayalam]: "bg-green-100 text-green-700 border-green-200",
  [Language.kannada]: "bg-purple-100 text-purple-700 border-purple-200",
};

const GENRE_COLORS: Record<MovieGenre, string> = {
  [MovieGenre.action]: "bg-red-50 text-red-600",
  [MovieGenre.comedy]: "bg-yellow-50 text-yellow-600",
  [MovieGenre.drama]: "bg-indigo-50 text-indigo-600",
  [MovieGenre.romance]: "bg-pink-50 text-pink-600",
  [MovieGenre.thriller]: "bg-gray-100 text-gray-700",
  [MovieGenre.horror]: "bg-slate-100 text-slate-700",
  [MovieGenre.devotional]: "bg-amber-50 text-amber-600",
  [MovieGenre.family]: "bg-teal-50 text-teal-600",
};

function languageLabel(lang: Language): string {
  return LANGUAGES.find((l) => l.value === lang)?.label ?? lang;
}

function genreLabel(genre: MovieGenre): string {
  return GENRES.find((g) => g.value === genre)?.label ?? genre;
}

interface AddMovieFormData {
  title: string;
  language: Language | "";
  genre: MovieGenre | "";
  releaseYear: string;
  director: string;
  cast: string;
  description: string;
  rating: string;
}

const INITIAL_FORM: AddMovieFormData = {
  title: "",
  language: "",
  genre: "",
  releaseYear: new Date().getFullYear().toString(),
  director: "",
  cast: "",
  description: "",
  rating: "8",
};

export function MoviesPage({ isAuthenticated }: MoviesPageProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null,
  );
  const [selectedGenre, setSelectedGenre] = useState<MovieGenre | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState<AddMovieFormData>(INITIAL_FORM);

  const deferredSearch = useDeferredValue(searchInput);
  const isSearching = deferredSearch.trim().length > 0;

  const { data: allMovies = [], isLoading: allLoading } = useGetAllMovies();
  const { data: searchResults = [], isLoading: searchLoading } =
    useSearchMovies(deferredSearch);
  const { mutate: addMovie, isPending: addPending } = useAddMovie();

  // Client-side filter by language and genre when not searching
  const moviesToShow = isSearching
    ? searchResults
    : allMovies.filter((m) => {
        if (selectedLanguage && m.language !== selectedLanguage) return false;
        if (selectedGenre && m.genre !== selectedGenre) return false;
        return true;
      });

  const isLoading = isSearching ? searchLoading : allLoading;

  const updateForm = (field: keyof AddMovieFormData, value: string) => {
    setAddForm((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    addForm.title &&
    addForm.language &&
    addForm.genre &&
    addForm.releaseYear &&
    addForm.director &&
    addForm.cast &&
    addForm.description &&
    addForm.rating;

  const handleAddMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.language || !addForm.genre) return;

    const ratingValue = Math.round(Number.parseFloat(addForm.rating) * 10);

    addMovie(
      {
        title: addForm.title,
        language: addForm.language as Language,
        genre: addForm.genre as MovieGenre,
        releaseYear: BigInt(addForm.releaseYear),
        director: addForm.director,
        cast: addForm.cast,
        description: addForm.description,
        rating: BigInt(ratingValue),
      },
      {
        onSuccess: () => {
          setShowAddDialog(false);
          setAddForm(INITIAL_FORM);
          toast.success("Movie added successfully! 🎬");
        },
        onError: () => {
          toast.error("Failed to add movie. Please try again.");
        },
      },
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-black text-2xl text-foreground flex items-center gap-2">
            <Film className="w-6 h-6 text-primary" />
            Movies
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Hindi, Tamil, Telugu, Malayalam, Kannada &amp; more
          </p>
        </div>
        {isAuthenticated ? (
          <Button
            onClick={() => setShowAddDialog(true)}
            className="gap-2 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Add Movie
          </Button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm text-muted-foreground">
            🔒 Login to add movies
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search movies, directors, cast..."
          className="pl-9"
        />
        {isSearching && (
          <button
            type="button"
            onClick={() => setSearchInput("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>

      {/* Language tabs */}
      {!isSearching && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {LANGUAGES.map((lang) => (
            <button
              type="button"
              key={String(lang.value)}
              onClick={() => setSelectedLanguage(lang.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedLanguage === lang.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}

      {/* Genre filter row */}
      {!isSearching && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          {GENRES.map((g) => (
            <button
              type="button"
              key={String(g.value)}
              onClick={() => setSelectedGenre(g.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedGenre === g.value
                  ? "bg-secondary text-secondary-foreground border-secondary"
                  : "bg-card text-muted-foreground border-border hover:border-secondary/40 hover:text-foreground"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}

      {/* Count */}
      {!isLoading && (
        <p className="text-xs text-muted-foreground mb-3">
          {moviesToShow.length} movie{moviesToShow.length !== 1 ? "s" : ""}
          {isSearching ? ` for "${deferredSearch}"` : ""}
        </p>
      )}

      {/* Movie list */}
      {isLoading ? (
        <div className="space-y-3">
          {["s1", "s2", "s3", "s4", "s5", "s6"].map((id) => (
            <div
              key={id}
              className="flex items-start gap-4 p-4 rounded-xl border border-border"
            >
              <Skeleton className="w-12 h-16 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-6 w-12 rounded" />
            </div>
          ))}
        </div>
      ) : moviesToShow.length === 0 ? (
        <div className="text-center py-16">
          <Film className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="font-display font-bold text-xl text-muted-foreground">
            No movies found
          </p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            {isSearching
              ? `No results for "${deferredSearch}"`
              : "Be the first to add a movie!"}
          </p>
          {isAuthenticated && !isSearching && (
            <Button onClick={() => setShowAddDialog(true)} className="mt-4">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Movie
            </Button>
          )}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {moviesToShow.map((movie, i) => (
              <motion.div
                key={movie.id.toString()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all"
              >
                {/* Movie poster placeholder */}
                <div className="w-12 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  <Film className="w-6 h-6 text-muted-foreground/40" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
                    {movie.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Dir. {movie.director} &bull; {Number(movie.releaseYear)}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                    Cast: {movie.cast}
                  </p>
                  {movie.description && (
                    <p className="text-xs text-muted-foreground/60 mt-1 line-clamp-2">
                      {movie.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${LANGUAGE_COLORS[movie.language]}`}
                    >
                      {languageLabel(movie.language)}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${GENRE_COLORS[movie.genre]}`}
                    >
                      {genreLabel(movie.genre)}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex flex-col items-center gap-0.5 shrink-0">
                  <div className="flex items-center gap-0.5 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-700">
                      {(Number(movie.rating) / 10).toFixed(1)}
                    </span>
                  </div>
                  <span className="text-[9px] text-muted-foreground/60">
                    /10
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Add Movie Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Film className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="font-display text-xl">
                  Add a Movie
                </DialogTitle>
                <DialogDescription>
                  Contribute to the movies database
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddMovie} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="movie-title">Movie Title *</Label>
              <Input
                id="movie-title"
                value={addForm.title}
                onChange={(e) => updateForm("title", e.target.value)}
                placeholder="e.g., RRR"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Language *</Label>
                <Select
                  value={addForm.language}
                  onValueChange={(v) => updateForm("language", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.slice(1).map((l) => (
                      <SelectItem key={String(l.value)} value={String(l.value)}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Genre *</Label>
                <Select
                  value={addForm.genre}
                  onValueChange={(v) => updateForm("genre", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRES.slice(1).map((g) => (
                      <SelectItem key={String(g.value)} value={String(g.value)}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="release-year">Release Year *</Label>
                <Input
                  id="release-year"
                  type="number"
                  min="1900"
                  max="2099"
                  value={addForm.releaseYear}
                  onChange={(e) => updateForm("releaseYear", e.target.value)}
                  placeholder="e.g., 2022"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rating">Rating (1–10) *</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  value={addForm.rating}
                  onChange={(e) => updateForm("rating", e.target.value)}
                  placeholder="e.g., 8.5"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="director">Director *</Label>
              <Input
                id="director"
                value={addForm.director}
                onChange={(e) => updateForm("director", e.target.value)}
                placeholder="e.g., S. S. Rajamouli"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cast">Cast *</Label>
              <Input
                id="cast"
                value={addForm.cast}
                onChange={(e) => updateForm("cast", e.target.value)}
                placeholder="e.g., Ram Charan, Jr. NTR, Alia Bhatt"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={addForm.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="Brief plot summary..."
                rows={3}
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="flex-1"
                disabled={addPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!isFormValid || addPending}
              >
                {addPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {addPending ? "Adding..." : "Add Movie"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
