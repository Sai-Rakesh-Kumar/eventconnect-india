import { Clock, Globe, Music2 } from "lucide-react";
import { motion } from "motion/react";
import { SongGenre as Genre, type Song } from "../backend";

interface SongCardProps {
  song: Song;
  index?: number;
}

function genreColor(genre: Genre): string {
  const map: Record<Genre, string> = {
    [Genre.bollywood]: "bg-pink-100 text-pink-700 border-pink-200",
    [Genre.carnatic]: "bg-amber-100 text-amber-700 border-amber-200",
    [Genre.classical]: "bg-purple-100 text-purple-700 border-purple-200",
    [Genre.devotional]: "bg-orange-100 text-orange-700 border-orange-200",
    [Genre.folk]: "bg-green-100 text-green-700 border-green-200",
    [Genre.malayalam]: "bg-teal-100 text-teal-700 border-teal-200",
    [Genre.pop]: "bg-blue-100 text-blue-700 border-blue-200",
    [Genre.rock]: "bg-red-100 text-red-700 border-red-200",
    [Genre.tamil]: "bg-yellow-100 text-yellow-700 border-yellow-200",
    [Genre.telugu]: "bg-indigo-100 text-indigo-700 border-indigo-200",
  };
  return map[genre] ?? "bg-muted text-muted-foreground border-border";
}

export function genreLabel(genre: Genre): string {
  const map: Record<Genre, string> = {
    [Genre.bollywood]: "Bollywood",
    [Genre.carnatic]: "Carnatic",
    [Genre.classical]: "Classical",
    [Genre.devotional]: "Devotional",
    [Genre.folk]: "Folk",
    [Genre.malayalam]: "Malayalam",
    [Genre.pop]: "Pop",
    [Genre.rock]: "Rock",
    [Genre.tamil]: "Tamil",
    [Genre.telugu]: "Telugu",
  };
  return map[genre] ?? genre;
}

export function SongCard({ song, index = 0 }: SongCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:shadow-md hover:bg-card/80 transition-all duration-200 group"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Music2 className="w-5 h-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-sm text-card-foreground truncate">
          {song.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${genreColor(song.genre)}`}
        >
          {genreLabel(song.genre)}
        </span>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Globe className="w-3 h-3" />
            {song.language}
          </span>
          <span className="flex items-center gap-0.5">
            <Clock className="w-3 h-3" />
            {song.duration}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
