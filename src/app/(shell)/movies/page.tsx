import { Star, Search } from "lucide-react";

const movies = [
  {
    id: 4,
    title: "Spider-Man: Across the Spider-Verse",
    overview:
      "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
    poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    rating: 8.6,
    year: "2023",
    genre: "Animation",
  },
  {
    id: 5,
    title: "Killers of the Flower Moon",
    overview:
      "When oil is discovered in 1920s Oklahoma under Osage Nation land, the Osage people are murdered one by one.",
    poster: "https://image.tmdb.org/t/p/w500/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg",
    rating: 7.6,
    year: "2023",
    genre: "Crime",
  },
  {
    id: 7,
    title: "Interstellar",
    overview:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    rating: 8.7,
    year: "2014",
    genre: "Sci-Fi",
  },
  {
    id: 8,
    title: "The Shawshank Redemption",
    overview:
      "Over the course of several years, two convicts form a friendship, seeking consolation and eventual redemption through basic compassion.",
    poster: "https://image.tmdb.org/t/p/w500/9cjIGR7B2Is7l5g8R3RlKkCl7J3.jpg",
    rating: 8.7,
    year: "1994",
    genre: "Drama",
  },
  {
    id: 9,
    title: "Parasite",
    overview:
      "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3xT.jpg",
    rating: 8.5,
    year: "2019",
    genre: "Thriller",
  },
  {
    id: 10,
    title: "Everything Everywhere All at Once",
    overview:
      "An aging Chinese immigrant is swept up in an insane adventure where she alone can save the world by exploring other universes.",
    poster: "https://image.tmdb.org/t/p/w500/wJGsiwN3Lr1bQE5O7g0s3cOkSXi.jpg",
    rating: 7.8,
    year: "2022",
    genre: "Sci-Fi",
  },
  {
    id: 11,
    title: "Blade Runner 2049",
    overview:
      "Officer K, a new blade runner for the LAPD, unearths a long-buried secret that has the potential to plunge what's left of society into chaos.",
    poster: "https://image.tmdb.org/t/p/w500/gaj7Nx1rP6g7m4Rf4kFR3fPvY5U.jpg",
    rating: 7.5,
    year: "2017",
    genre: "Sci-Fi",
  },
  {
    id: 12,
    title: "Whiplash",
    overview:
      "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
    poster: "https://image.tmdb.org/t/p/w500/7fn624j544lTlnq9zm44Kq9vYx4.jpg",
    rating: 8.5,
    year: "2014",
    genre: "Drama",
  },
];

const genres = ["All", "Sci-Fi", "Drama", "Action", "Animation", "Crime", "Comedy", "Thriller"];

export default function MoviesPage() {
  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold">Movie Library</h1>
          <p className="text-sm text-text-muted">
            Discover and explore popular movies from TMDB
          </p>
        </div>
        <span className="rounded-full bg-accent-cyan-muted px-3 py-1 text-xs font-medium text-accent-cyan">
          {movies.length} movies
        </span>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search movies..."
            className="w-full rounded-lg border border-border-default bg-surface-raised py-2.5 pl-10 pr-3 text-sm text-text-primary placeholder-text-muted transition focus:border-accent-cyan focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre, i) => (
            <button
              key={genre}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                i === 0
                  ? "bg-accent-cyan text-white"
                  : "border border-border-default bg-surface-raised text-text-secondary hover:border-accent-cyan hover:text-accent-cyan"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="group cursor-pointer overflow-hidden rounded-xl border border-border-default bg-surface-panel transition hover:border-accent-cyan/40 hover:shadow-lg hover:shadow-accent-cyan/5"
          >
            <div className="relative aspect-[2/3] overflow-hidden bg-surface-raised">
              <img
                src={movie.poster}
                alt={movie.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="absolute bottom-2 left-2 right-2 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="line-clamp-3 text-[11px] leading-relaxed text-gray-200">
                  {movie.overview}
                </p>
              </div>
              <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 backdrop-blur-sm">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span className="text-[11px] font-semibold text-white">
                  {movie.rating}
                </span>
              </div>
            </div>
            <div className="p-3">
              <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-text-primary group-hover:text-accent-cyan">
                {movie.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">{movie.year}</span>
                <span className="h-1 w-1 rounded-full bg-text-muted" />
                <span className="rounded bg-surface-raised px-1.5 py-0.5 text-[10px] font-medium text-text-secondary">
                  {movie.genre}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
