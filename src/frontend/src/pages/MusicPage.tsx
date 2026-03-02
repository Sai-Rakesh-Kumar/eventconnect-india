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
import { Loader2, Music2, PlusCircle, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";
import { SongGenre as Genre } from "../backend";
import { SongCard, genreLabel } from "../components/SongCard";
import {
  useAddSong,
  useGetAllSongs,
  useSearchSongs,
} from "../hooks/useQueries";

interface MusicPageProps {
  isAuthenticated: boolean;
}

const GENRES = [
  { value: null, label: "All Genres" },
  { value: Genre.bollywood, label: "Bollywood" },
  { value: Genre.carnatic, label: "Carnatic" },
  { value: Genre.classical, label: "Classical" },
  { value: Genre.devotional, label: "Devotional" },
  { value: Genre.folk, label: "Folk" },
  { value: Genre.malayalam, label: "Malayalam" },
  { value: Genre.pop, label: "Pop" },
  { value: Genre.rock, label: "Rock" },
  { value: Genre.tamil, label: "Tamil" },
  { value: Genre.telugu, label: "Telugu" },
];

interface AddSongFormData {
  title: string;
  artist: string;
  genre: Genre | "";
  language: string;
  duration: string;
}

const INITIAL_ADD_FORM: AddSongFormData = {
  title: "",
  artist: "",
  genre: "",
  language: "",
  duration: "",
};

export function MusicPage({ isAuthenticated }: MusicPageProps) {
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState<AddSongFormData>(INITIAL_ADD_FORM);

  const deferredSearch = useDeferredValue(searchInput);
  const isSearching = deferredSearch.trim().length > 0;

  const { data: allSongs = [], isLoading: allLoading } = useGetAllSongs();
  const { data: searchResults = [], isLoading: searchLoading } =
    useSearchSongs(deferredSearch);
  const { mutate: addSong, isPending: addPending } = useAddSong();

  // Filter by genre client-side when no search
  const songsToShow = isSearching
    ? searchResults
    : selectedGenre
      ? allSongs.filter((s) => s.genre === selectedGenre)
      : allSongs;

  const isLoading = isSearching ? searchLoading : allLoading;

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.genre) return;

    addSong(
      {
        title: addForm.title,
        artist: addForm.artist,
        genre: addForm.genre,
        language: addForm.language,
        duration: addForm.duration,
      },
      {
        onSuccess: () => {
          setShowAddDialog(false);
          setAddForm(INITIAL_ADD_FORM);
          toast.success("Song added successfully! 🎵");
        },
        onError: () => {
          toast.error("Failed to add song. Please try again.");
        },
      },
    );
  };

  const updateAddForm = (field: keyof AddSongFormData, value: string) => {
    setAddForm((prev) => ({ ...prev, [field]: value }));
  };

  const isAddFormValid =
    addForm.title &&
    addForm.artist &&
    addForm.genre &&
    addForm.language &&
    addForm.duration;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-black text-2xl text-foreground flex items-center gap-2">
            <Music2 className="w-6 h-6 text-primary" />
            Music Library
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Bollywood, Carnatic, Tamil, Telugu & more
          </p>
        </div>
        {isAuthenticated ? (
          <Button
            onClick={() => setShowAddDialog(true)}
            className="gap-2 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Add Song
          </Button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm text-muted-foreground">
            🔒 Login to add songs
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search songs, artists..."
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

      {/* Genre tabs */}
      {!isSearching && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          {GENRES.map((g) => (
            <button
              type="button"
              key={String(g.value)}
              onClick={() => setSelectedGenre(g.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedGenre === g.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}

      {/* Song count */}
      {!isLoading && (
        <p className="text-xs text-muted-foreground mb-3">
          {songsToShow.length} song{songsToShow.length !== 1 ? "s" : ""}
          {isSearching
            ? ` for "${deferredSearch}"`
            : selectedGenre
              ? ` in ${genreLabel(selectedGenre)}`
              : " total"}
        </p>
      )}

      {/* Songs list */}
      {isLoading ? (
        <div className="space-y-3">
          {["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8"].map((id) => (
            <div
              key={id}
              className="flex items-center gap-4 p-4 rounded-xl border border-border"
            >
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      ) : songsToShow.length === 0 ? (
        <div className="text-center py-16">
          <Music2 className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="font-display font-bold text-xl text-muted-foreground">
            No songs found
          </p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            {isSearching
              ? `No results for "${deferredSearch}"`
              : "Be the first to add a song!"}
          </p>
          {isAuthenticated && !isSearching && (
            <Button onClick={() => setShowAddDialog(true)} className="mt-4">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Song
            </Button>
          )}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {songsToShow.map((song, i) => (
              <SongCard key={song.id.toString()} song={song} index={i} />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Add Song Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Music2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="font-display text-xl">
                  Add a Song
                </DialogTitle>
                <DialogDescription>
                  Contribute to the music library
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddSong} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="song-title">Song Title *</Label>
              <Input
                id="song-title"
                value={addForm.title}
                onChange={(e) => updateAddForm("title", e.target.value)}
                placeholder="e.g., Tum Hi Ho"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="artist">Artist / Singer *</Label>
              <Input
                id="artist"
                value={addForm.artist}
                onChange={(e) => updateAddForm("artist", e.target.value)}
                placeholder="e.g., Arijit Singh"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Genre *</Label>
                <Select
                  value={addForm.genre}
                  onValueChange={(v) => updateAddForm("genre", v)}
                  required
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

              <div className="space-y-1.5">
                <Label htmlFor="language">Language *</Label>
                <Input
                  id="language"
                  value={addForm.language}
                  onChange={(e) => updateAddForm("language", e.target.value)}
                  placeholder="e.g., Hindi"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="duration">Duration *</Label>
              <Input
                id="duration"
                value={addForm.duration}
                onChange={(e) => updateAddForm("duration", e.target.value)}
                placeholder="e.g., 4:22"
                pattern="\d+:\d{2}"
                title="Format: mm:ss"
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
                disabled={!isAddFormValid || addPending}
              >
                {addPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {addPending ? "Adding..." : "Add Song"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
