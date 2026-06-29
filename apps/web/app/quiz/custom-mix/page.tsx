"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { translations } from "@/lib/i18n";
import { useLanguage } from "@/lib/use-language";

type Artist = {
  id: number;
  name: string;
  image: string;
  imageLarge: string;
  fans: number;
  albums: number;
};

type Difficulty = "easy" | "medium" | "hard";
type AnswerMode = "mcq" | "typed";
type TypedAnswerKind = "song" | "artist" | "album" | "mixed";

type SetupStep =
  "artists" | "length" | "mode" | "type" | "difficulty" | "review";

const RECENT_ARTISTS_STORAGE_KEY = "beatguess-recent-artists";

export default function CustomMixPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language].customMix;

  const gameText = {
    en: {
      step: "Step",
      level: "Level",
      of: "of",
      results: "results",
      selected: "selected",
      length: "Length",
      mode: "Mode",
      type: "Type",
      quizSetup: "Quiz setup",
      yourChallenge: "Your challenge",
      completeLevels: "Complete each level to launch your music quiz.",
      selectArtistsToContinue: "Select artists to continue",
      nextLevel: "Next level →",
      back: "Back",
      finalLevel: "Final level",
      level01Title: "Build your lineup.",
      level01Description:
        "Search your favorite artists and create the music world for this quiz.",
      searchResults: "Search results",
      noArtistsYet: "No artists yet",
      noArtistsYetDescription:
        "Search an artist and your results will appear here.",
      yourLineup: "Your lineup",
      lineupEmptyTitle: "Your quiz lineup is empty",
      lineupEmptyDescription:
        "Add at least one artist to unlock the next level.",
      level02Title: "Pick your round length.",
      level02Description: "Choose how long this music battle should be.",
      level03Title: "Choose your battle mode.",
      level03Description:
        "Multiple choice is fast. Typing challenge is harder and more competitive.",
      level04Title: "What should players guess?",
      level04Description:
        "Decide what kind of music knowledge this quiz will test.",
      level05Title: "Set the difficulty.",
      level05Description:
        "The harder the level, the less time players hear from each track.",
      reviewTitle: "Your quiz is ready.",
      reviewDescription: "Review your challenge and launch the arena.",
      quickRound: "Quick round",
      quickRoundDescription: "A short warm-up before the real battle.",
      standardGame: "Standard game",
      standardGameDescription: "The best balance for a normal music quiz.",
      longSession: "Long session",
      longSessionDescription: "More tracks, more pressure, more points.",
      arenaChallenge: "Arena challenge",
      arenaChallengeDescription: "A full challenge for real music fans.",
      multipleChoiceDescription:
        "Pick the correct answer from several options.",
      typingChallengeDescription: "Type the answer yourself for a harder game.",
      songTitleDescription: "Guess the name of the song.",
      artistNameDescription: "Guess who performs the track.",
      albumNameDescription: "Guess the album connected to the track.",
      mixedDescription: "Every question can ask something different.",
      easyDescription: "Full 30-second preview.",
      mediumDescription: "Only 20 seconds to recognize the track.",
      hardDescription: "Only 10 seconds. No mercy.",
    },
    fr: {
      step: "Étape",
      level: "Niveau",
      of: "sur",
      results: "résultats",
      selected: "sélectionnés",
      length: "Longueur",
      mode: "Mode",
      type: "Type",
      quizSetup: "Configuration du quiz",
      yourChallenge: "Ton défi",
      completeLevels: "Complète chaque niveau pour lancer ton quiz musical.",
      selectArtistsToContinue: "Sélectionne des artistes pour continuer",
      nextLevel: "Niveau suivant →",
      back: "Retour",
      finalLevel: "Niveau final",
      level01Title: "Construis ta sélection.",
      level01Description:
        "Cherche tes artistes préférés et crée l’univers musical de ce quiz.",
      searchResults: "Résultats de recherche",
      noArtistsYet: "Aucun artiste pour le moment",
      noArtistsYetDescription:
        "Cherche un artiste et les résultats apparaîtront ici.",
      yourLineup: "Ta sélection",
      lineupEmptyTitle: "Ta sélection de quiz est vide",
      lineupEmptyDescription:
        "Ajoute au moins un artiste pour débloquer le niveau suivant.",
      level02Title: "Choisis la durée du round.",
      level02Description: "Choisis la durée de cette bataille musicale.",
      level03Title: "Choisis ton mode de jeu.",
      level03Description:
        "Le choix multiple est rapide. Le défi écrit est plus difficile et plus compétitif.",
      level04Title: "Que doivent deviner les joueurs ?",
      level04Description:
        "Décide quel type de connaissance musicale ce quiz va tester.",
      level05Title: "Règle la difficulté.",
      level05Description:
        "Plus le niveau est difficile, moins les joueurs entendent chaque extrait.",
      reviewTitle: "Ton quiz est prêt.",
      reviewDescription: "Vérifie ton défi et lance l’arène.",
      quickRound: "Round rapide",
      quickRoundDescription: "Un court échauffement avant le vrai défi.",
      standardGame: "Partie standard",
      standardGameDescription:
        "Le meilleur équilibre pour un quiz musical normal.",
      longSession: "Session longue",
      longSessionDescription:
        "Plus de titres, plus de pression, plus de points.",
      arenaChallenge: "Challenge arène",
      arenaChallengeDescription:
        "Un défi complet pour les vrais fans de musique.",
      multipleChoiceDescription:
        "Choisis la bonne réponse parmi plusieurs options.",
      typingChallengeDescription:
        "Écris la réponse toi-même pour un jeu plus difficile.",
      songTitleDescription: "Devine le nom de la chanson.",
      artistNameDescription: "Devine qui interprète le titre.",
      albumNameDescription: "Devine l’album lié au titre.",
      mixedDescription:
        "Chaque question peut demander quelque chose de différent.",
      easyDescription: "Extrait complet de 30 secondes.",
      mediumDescription: "Seulement 20 secondes pour reconnaître le titre.",
      hardDescription: "Seulement 10 secondes. Sans pitié.",
    },
    de: {
      step: "Schritt",
      level: "Level",
      of: "von",
      results: "Ergebnisse",
      selected: "ausgewählt",
      length: "Länge",
      mode: "Modus",
      type: "Typ",
      quizSetup: "Quiz-Setup",
      yourChallenge: "Deine Challenge",
      completeLevels: "Schließe jedes Level ab, um dein Musikquiz zu starten.",
      selectArtistsToContinue: "Wähle Künstler aus, um weiterzumachen",
      nextLevel: "Nächstes Level →",
      back: "Zurück",
      finalLevel: "Finales Level",
      level01Title: "Baue dein Line-up.",
      level01Description:
        "Suche deine Lieblingskünstler und erstelle die Musikwelt für dieses Quiz.",
      searchResults: "Suchergebnisse",
      noArtistsYet: "Noch keine Künstler",
      noArtistsYetDescription:
        "Suche einen Künstler, dann erscheinen die Ergebnisse hier.",
      yourLineup: "Dein Line-up",
      lineupEmptyTitle: "Deine Quiz-Auswahl ist leer",
      lineupEmptyDescription:
        "Füge mindestens einen Künstler hinzu, um das nächste Level freizuschalten.",
      level02Title: "Wähle die Rundendauer.",
      level02Description: "Wähle, wie lange diese Musik-Battle dauern soll.",
      level03Title: "Wähle deinen Battle-Modus.",
      level03Description:
        "Multiple Choice ist schnell. Die Schreib-Challenge ist schwieriger und kompetitiver.",
      level04Title: "Was sollen die Spieler erraten?",
      level04Description:
        "Entscheide, welches Musikwissen dieses Quiz testen soll.",
      level05Title: "Stelle die Schwierigkeit ein.",
      level05Description:
        "Je schwieriger das Level, desto weniger Zeit hören die Spieler pro Track.",
      reviewTitle: "Dein Quiz ist bereit.",
      reviewDescription: "Prüfe deine Challenge und starte die Arena.",
      quickRound: "Kurze Runde",
      quickRoundDescription: "Ein kurzes Warm-up vor der echten Battle.",
      standardGame: "Standardspiel",
      standardGameDescription: "Die beste Balance für ein normales Musikquiz.",
      longSession: "Lange Session",
      longSessionDescription: "Mehr Tracks, mehr Druck, mehr Punkte.",
      arenaChallenge: "Arena-Challenge",
      arenaChallengeDescription: "Eine volle Challenge für echte Musikfans.",
      multipleChoiceDescription:
        "Wähle die richtige Antwort aus mehreren Optionen.",
      typingChallengeDescription:
        "Tippe die Antwort selbst für ein schwierigeres Spiel.",
      songTitleDescription: "Errate den Namen des Songs.",
      artistNameDescription: "Errate, wer den Track performt.",
      albumNameDescription: "Errate das Album zum Track.",
      mixedDescription: "Jede Frage kann etwas anderes fragen.",
      easyDescription: "Voller 30-Sekunden-Ausschnitt.",
      mediumDescription: "Nur 20 Sekunden, um den Track zu erkennen.",
      hardDescription: "Nur 10 Sekunden. Keine Gnade.",
    },
  }[language];

  const [setupStep, setSetupStep] = useState<SetupStep>("artists");
  const [query, setQuery] = useState("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [questionAmount, setQuestionAmount] = useState(10);
  const [historyResetMessage, setHistoryResetMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [answerMode, setAnswerMode] = useState<AnswerMode>("mcq");
  const [typedAnswerKind, setTypedAnswerKind] =
    useState<TypedAnswerKind>("song");

  const setupSteps: SetupStep[] = [
    "artists",
    "length",
    "mode",
    "type",
    "difficulty",
    "review",
  ];

  const currentStepIndex = setupSteps.indexOf(setupStep);
  const progressPercent = ((currentStepIndex + 1) / setupSteps.length) * 100;

  const canGoNext = setupStep !== "artists" || selectedArtists.length > 0;

  const difficultyLabel =
    difficulty === "easy"
      ? t.easy
      : difficulty === "medium"
        ? t.medium
        : t.hard;

  const answerModeLabel =
    answerMode === "typed" ? t.typingChallenge : t.multipleChoice;

  const questionTypeLabel =
    typedAnswerKind === "artist"
      ? t.typeArtistNameOption
      : typedAnswerKind === "album"
        ? t.typeAlbumNameOption
        : typedAnswerKind === "mixed"
          ? t.mixedTypingOption
          : t.typeSongTitleOption;

  const lengthOptions = [
    {
      value: 5,
      label: gameText.quickRound,
      description: gameText.quickRoundDescription,
    },
    {
      value: 10,
      label: gameText.standardGame,
      description: gameText.standardGameDescription,
    },
    {
      value: 15,
      label: gameText.longSession,
      description: gameText.longSessionDescription,
    },
    {
      value: 20,
      label: gameText.arenaChallenge,
      description: gameText.arenaChallengeDescription,
    },
  ];

  const answerModeOptions: {
    value: AnswerMode;
    label: string;
    description: string;
  }[] = [
    {
      value: "mcq",
      label: t.multipleChoice,
      description: gameText.multipleChoiceDescription,
    },
    {
      value: "typed",
      label: t.typingChallenge,
      description: gameText.typingChallengeDescription,
    },
  ];

  const questionTypeOptions: {
    value: TypedAnswerKind;
    label: string;
    description: string;
  }[] = [
    {
      value: "song",
      label: t.typeSongTitleOption,
      description: gameText.songTitleDescription,
    },
    {
      value: "artist",
      label: t.typeArtistNameOption,
      description: gameText.artistNameDescription,
    },
    {
      value: "album",
      label: t.typeAlbumNameOption,
      description: gameText.albumNameDescription,
    },
    {
      value: "mixed",
      label: t.mixedTypingOption,
      description: gameText.mixedDescription,
    },
  ];

  const difficultyOptions: {
    value: Difficulty;
    label: string;
    description: string;
  }[] = [
    {
      value: "easy",
      label: t.easy,
      description: gameText.easyDescription,
    },
    {
      value: "medium",
      label: t.medium,
      description: gameText.mediumDescription,
    },
    {
      value: "hard",
      label: t.hard,
      description: gameText.hardDescription,
    },
  ];
  const defaultMusicTiles = [
    {
      label: "AFRO",
      icon: "♪",
      background:
        "linear-gradient(135deg, rgba(236,72,153,0.78), rgba(34,211,238,0.42))",
    },
    {
      label: "POP",
      icon: "♫",
      background:
        "linear-gradient(135deg, rgba(163,230,53,0.76), rgba(59,130,246,0.42))",
    },
    {
      label: "RAP",
      icon: "♬",
      background:
        "linear-gradient(135deg, rgba(168,85,247,0.78), rgba(236,72,153,0.38))",
    },
    {
      label: "RNB",
      icon: "♪",
      background:
        "linear-gradient(135deg, rgba(34,211,238,0.72), rgba(14,165,233,0.34))",
    },
    {
      label: "HITS",
      icon: "♫",
      background:
        "linear-gradient(135deg, rgba(249,115,22,0.70), rgba(236,72,153,0.42))",
    },
    {
      label: "BEAT",
      icon: "♬",
      background:
        "linear-gradient(135deg, rgba(132,204,22,0.72), rgba(34,211,238,0.36))",
    },
  ];

  const realArtistImages = [
    ...selectedArtists.map((artist) => artist.imageLarge || artist.image),
    ...artists.slice(0, 12).map((artist) => artist.imageLarge || artist.image),
  ].filter(Boolean);

  const backgroundTiles = Array.from({ length: 120 }, (_, index) => {
    const defaultTile = defaultMusicTiles[index % defaultMusicTiles.length];

    return {
      ...defaultTile,
      image:
        realArtistImages.length > 0
          ? realArtistImages[index % realArtistImages.length]
          : "",
    };
  });
  async function searchArtists() {
    if (query.trim().length < 2) {
      setError(t.errorShortQuery);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/music/artists/search?q=${encodeURIComponent(
          query.trim(),
        )}`,
      );

      if (!response.ok) {
        throw new Error("Failed to search artists");
      }

      const data: Artist[] = await response.json();
      setArtists(data);
    } catch {
      setError(t.errorSearch);
    } finally {
      setIsLoading(false);
    }
  }

  function selectArtist(artist: Artist) {
    const alreadySelected = selectedArtists.some(
      (selectedArtist) => selectedArtist.id === artist.id,
    );

    if (alreadySelected) {
      return;
    }

    setSelectedArtists([...selectedArtists, artist]);
  }

  function removeArtist(artistId: number) {
    setSelectedArtists(
      selectedArtists.filter((artist) => artist.id !== artistId),
    );
  }

  function resetPlayedHistory() {
    localStorage.removeItem("beatguess-played-track-segments");
    setHistoryResetMessage(t.historyResetMessage);

    setTimeout(() => {
      setHistoryResetMessage("");
    }, 3000);
  }

  function saveRecentArtistsForHomePage(artistsToSave: Artist[]) {
    try {
      const recentArtists = artistsToSave
        .slice(-3)
        .reverse()
        .map((artist) => ({
          id: artist.id,
          name: artist.name,
          image: artist.imageLarge || artist.image,
        }));

      localStorage.setItem(
        RECENT_ARTISTS_STORAGE_KEY,
        JSON.stringify(recentArtists),
      );
    } catch {
      // The quiz should still start if localStorage fails.
    }
  }

  function startQuiz() {
    if (selectedArtists.length === 0) {
      return;
    }

    const artistIds = selectedArtists.map((artist) => artist.id).join(",");

    saveRecentArtistsForHomePage(selectedArtists);

    router.push(
      `/quiz/play?artists=${artistIds}&difficulty=${difficulty}&amount=${questionAmount}&answerMode=${answerMode}&typedAnswerKind=${typedAnswerKind}`,
    );
  }

  function goToNextStep() {
    if (!canGoNext) {
      return;
    }

    const nextStep = setupSteps[currentStepIndex + 1];

    if (nextStep) {
      setSetupStep(nextStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goToPreviousStep() {
    const previousStep = setupSteps[currentStepIndex - 1];

    if (previousStep) {
      setSetupStep(previousStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function renderChoiceCards<T extends string | number>(
    options: {
      value: T;
      label: string;
      description: string;
    }[],
    selectedValue: T,
    onSelect: (value: T) => void,
  ) {
    return (
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`rounded-[2rem] border p-6 text-left transition hover:border-lime-400 ${
              selectedValue === option.value
                ? "border-lime-400 bg-gradient-to-br from-lime-400/15 via-cyan-400/10 to-pink-500/10 shadow-[0_0_50px_rgba(34,211,238,0.12)]"
                : "border-white/10 bg-[#0b1026]/80"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
  <div>
    <h3 className="text-3xl font-black text-white md:text-4xl">
      {option.label}
    </h3>

    <p className="mt-4 text-base leading-7 text-zinc-400">
      {option.description}
    </p>
  </div>

  {selectedValue === option.value && (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-400 text-lg font-black text-black">
      ✓
    </span>
  )}
</div>
          </button>
        ))}
      </div>
    );
  }

  function renderArtistsStep() {
    return (
      <div>
        <p className="text-xs font-black uppercase tracking-[0.35em] text-lime-300">
          {gameText.level} 01
        </p>

        <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
          {gameText.level01Title}
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
          {gameText.level01Description}
        </p>

        <div className="mt-8 rounded-[2rem] border border-zinc-800 bg-black/65 p-4 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  searchArtists();
                }
              }}
              placeholder={t.searchPlaceholder}
              className="min-h-16 flex-1 rounded-2xl border border-zinc-800 bg-black/55 px-5 text-lg text-white outline-none placeholder:text-zinc-600 focus:border-lime-400"
            />

            <button
              type="button"
              onClick={searchArtists}
              disabled={isLoading}
              className="min-h-16 rounded-2xl bg-lime-400 px-8 text-lg font-black text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? t.searchingButton : t.searchButton}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black">{gameText.searchResults}</h2>

            <span className="rounded-full border border-zinc-800 bg-black/65 px-4 py-2 text-sm text-zinc-400">
              {artists.length} {gameText.results}
            </span>
          </div>

          {artists.length === 0 ? (
            <div className="mt-5 rounded-[2rem] border border-dashed border-zinc-800 bg-black/65 px-6 py-14 text-center">
              <p className="text-5xl">♪</p>
              <h3 className="mt-5 text-2xl font-black">
                {gameText.noArtistsYet}
              </h3>
              <p className="mt-2 text-zinc-500">
                {gameText.noArtistsYetDescription}
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {artists.map((artist) => {
                const isSelected = selectedArtists.some(
                  (selectedArtist) => selectedArtist.id === artist.id,
                );

                return (
                  <button
                    key={artist.id}
                    type="button"
                    onClick={() => selectArtist(artist)}
                    className={`group overflow-hidden rounded-[1.75rem] border bg-black/65 text-left transition hover:border-lime-400 ${
                      isSelected ? "border-lime-400" : "border-zinc-800"
                    }`}
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={artist.imageLarge || artist.image}
                        alt={artist.name}
                        className="h-full w-full object-cover opacity-80 transition group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                      <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-black text-white">
                        {isSelected ? `✓ ${t.added}` : `+ ${t.add}`}
                      </div>

                      <h3 className="absolute bottom-4 left-4 right-4 truncate text-2xl font-black">
                        {artist.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between p-4">
                      <div className="text-sm text-zinc-400">
                        <p>
                          {artist.fans.toLocaleString()} {t.fans}
                        </p>
                        <p>
                          {artist.albums} {t.albums}
                        </p>
                      </div>

                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-xl font-black text-lime-300">
                        {isSelected ? "✓" : "+"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black">{gameText.yourLineup}</h2>

            <span className="rounded-full border border-zinc-800 bg-black/65 px-4 py-2 text-sm text-zinc-400">
              {selectedArtists.length} {gameText.selected}
            </span>
          </div>

          {selectedArtists.length === 0 ? (
            <div className="mt-5 rounded-[2rem] border border-dashed border-zinc-800 bg-black/65 px-6 py-12 text-center">
              <p className="text-5xl">♪</p>
              <h3 className="mt-4 text-xl font-black">
                {gameText.lineupEmptyTitle}
              </h3>
              <p className="mt-2 text-zinc-500">
                {gameText.lineupEmptyDescription}
              </p>
            </div>
          ) : (
            <div className="mt-5 flex flex-wrap gap-3">
              {selectedArtists.map((artist) => (
                <button
                  key={artist.id}
                  type="button"
                  onClick={() => removeArtist(artist.id)}
                  className="group flex items-center gap-3 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-2 text-white transition hover:border-red-400 hover:bg-red-500/10"
                >
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <span className="font-black">{artist.name}</span>
                  <span className="text-zinc-400 group-hover:text-red-300">
                    ×
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderStepContent() {
    if (setupStep === "artists") {
      return renderArtistsStep();
    }

    if (setupStep === "length") {
      return (
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-lime-300">
            {gameText.level} 02
          </p>

          <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
            {gameText.level02Title}
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
            {gameText.level02Description}
          </p>

          {renderChoiceCards(lengthOptions, questionAmount, setQuestionAmount)}
        </div>
      );
    }

    if (setupStep === "mode") {
      return (
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-lime-300">
            {gameText.level} 03
          </p>

          <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
            {gameText.level03Title}
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
            {gameText.level03Description}
          </p>

          {renderChoiceCards(answerModeOptions, answerMode, setAnswerMode)}
        </div>
      );
    }

    if (setupStep === "type") {
      return (
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-lime-300">
            {gameText.level} 04
          </p>

          <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
            {gameText.level04Title}
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
            {gameText.level04Description}
          </p>

          {renderChoiceCards(
            questionTypeOptions,
            typedAnswerKind,
            setTypedAnswerKind,
          )}
        </div>
      );
    }

    if (setupStep === "difficulty") {
      return (
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-lime-300">
            {gameText.level} 05
          </p>

          <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
            {gameText.level05Title}
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
            {gameText.level05Description}
          </p>

          {renderChoiceCards(difficultyOptions, difficulty, setDifficulty)}
        </div>
      );
    }

    return (
      <div>
        <p className="text-xs font-black uppercase tracking-[0.35em] text-lime-300">
          {gameText.finalLevel}
        </p>

        <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
          {gameText.reviewTitle}
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
          {gameText.reviewDescription}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[2rem] border border-zinc-800 bg-black/65 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              {t.artists}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {selectedArtists.map((artist) => (
                <div
                  key={artist.id}
                  className="flex items-center gap-3 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-2"
                >
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <span className="font-black">{artist.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-800 bg-black/65 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              {t.gameSetup}
            </p>

            <div className="mt-5 space-y-3">
              <div className="flex justify-between rounded-2xl border border-zinc-800 bg-black/55 px-4 py-3">
                <span className="text-zinc-400">{gameText.length}</span>
                <span className="font-black text-lime-300">
                  {questionAmount} {t.questions}
                </span>
              </div>

              <div className="flex justify-between rounded-2xl border border-zinc-800 bg-black/55 px-4 py-3">
                <span className="text-zinc-400">{gameText.mode}</span>
                <span className="font-black text-lime-300">
                  {answerModeLabel}
                </span>
              </div>

              <div className="flex justify-between rounded-2xl border border-zinc-800 bg-black/55 px-4 py-3">
                <span className="text-zinc-400">{gameText.type}</span>
                <span className="font-black text-lime-300">
                  {questionTypeLabel}
                </span>
              </div>

              <div className="flex justify-between rounded-2xl border border-zinc-800 bg-black/55 px-4 py-3">
                <span className="text-zinc-400">{t.difficulty}</span>
                <span className="font-black text-lime-300">
                  {difficultyLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] border border-zinc-800 bg-black/65 p-6">
          <h2 className="text-2xl font-black">{t.smartReplayTitle}</h2>

          <p className="mt-3 leading-7 text-zinc-400">
            {t.smartReplayDescription}
          </p>

          <button
            type="button"
            onClick={resetPlayedHistory}
            className="mt-5 rounded-2xl border border-zinc-700 px-5 py-3 font-bold text-white transition hover:border-lime-400 hover:text-lime-300"
          >
            {t.resetHistory}
          </button>

          {historyResetMessage && (
            <p className="mt-4 rounded-xl border border-lime-400/30 bg-lime-400/10 px-4 py-3 text-sm text-lime-200">
              {historyResetMessage}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom,rgba(163,230,53,0.16),transparent_35%),linear-gradient(135deg,#070018,#0B1026_45%,#020617)] px-4 pb-32 pt-24 text-white md:px-8 md:pt-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#160020] via-[#07152f] to-[#020617]" />

        <div className="absolute -left-32 -top-40 grid w-[150%] rotate-[-8deg] grid-cols-4 gap-5 opacity-70 md:grid-cols-6 lg:grid-cols-8">
          {backgroundTiles.map((tile, index) => (
            <div
              key={index}
              className={`relative h-40 overflow-hidden rounded-[1.5rem] border border-white/10 bg-cover bg-center shadow-2xl md:h-52 ${
                index % 2 === 0 ? "translate-y-10" : "-translate-y-4"
              }`}
              style={{
                backgroundImage: tile.image
                  ? `linear-gradient(to bottom, rgba(0,0,0,0.04), rgba(0,0,0,0.32)), url(${tile.image})`
                  : tile.background,
              }}
            >
              {!tile.image && (
                <div className="flex h-full flex-col justify-between p-4">
                  <span className="text-5xl font-black text-white/85">
                    {tile.icon}
                  </span>

                  <span className="text-2xl font-black tracking-[0.18em] text-white/80">
                    {tile.label}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-black/42 via-black/22 to-black/42" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-black/24 to-black/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.20),transparent_35%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(163,230,53,0.16),transparent_42%)]" />
      </div>
      <section className="relative mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <a
            href="/"
            className="rounded-full border border-zinc-800 bg-black px-4 py-2 text-sm font-black text-lime-300 transition hover:border-lime-400"
          >
            ← {t.backHome}
          </a>

          <div className="hidden rounded-full border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-400 md:block">
            {gameText.step} {currentStepIndex + 1} / {setupSteps.length}
          </div>
        </div>

        <div className="mt-6 rounded-full border border-zinc-800 bg-zinc-950 p-1">
          <div
            className="h-3 rounded-full bg-lime-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.12),transparent_34%),rgba(9,9,17,0.72)] p-5 shadow-[0_0_90px_rgba(236,72,153,0.10)] backdrop-blur-xl md:p-8">
            {renderStepContent()}

            <div className="mt-10 flex flex-col gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goToPreviousStep}
                disabled={currentStepIndex === 0}
                className="rounded-2xl border border-zinc-700 px-6 py-4 font-black text-white transition hover:border-lime-400 hover:text-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← {gameText.back}
              </button>

              {setupStep === "review" ? (
                <button
                  type="button"
                  onClick={startQuiz}
                  className="rounded-2xl bg-lime-400 px-8 py-4 text-lg font-black text-black transition hover:scale-[1.02] hover:bg-lime-300"
                >
                  ▶ {t.startQuiz}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goToNextStep}
                  disabled={!canGoNext}
                  className="rounded-2xl bg-lime-400 px-8 py-4 text-lg font-black text-black transition hover:scale-[1.02] hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {setupStep === "artists" && selectedArtists.length === 0
                    ? gameText.selectArtistsToContinue
                    : gameText.nextLevel}
                </button>
              )}
            </div>
          </section>

          <aside className="hidden lg:block">
            <div className="sticky top-8 rounded-[2rem] border border-white/10 bg-[#0b1026]/65 p-6 shadow-[0_0_70px_rgba(34,211,238,0.08)] backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-lime-300">
                {gameText.quizSetup}
              </p>

              <h2 className="mt-3 text-3xl font-black">
                {gameText.yourChallenge}
              </h2>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-zinc-800 bg-black/65 p-4">
                  <p className="text-sm text-zinc-500">{t.artists}</p>
                  <p className="mt-1 text-2xl font-black text-lime-300">
                    {selectedArtists.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black/65 p-4">
                  <p className="text-sm text-zinc-500">{gameText.length}</p>
                  <p className="mt-1 text-xl font-black">
                    {questionAmount} {t.questions}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black/65 p-4">
                  <p className="text-sm text-zinc-500">{gameText.mode}</p>
                  <p className="mt-1 text-xl font-black">{answerModeLabel}</p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black/65 p-4">
                  <p className="text-sm text-zinc-500">{t.questionType}</p>
                  <p className="mt-1 text-xl font-black">{questionTypeLabel}</p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black/65 p-4">
                  <p className="text-sm text-zinc-500">{t.difficulty}</p>
                  <p className="mt-1 text-xl font-black">{difficultyLabel}</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-lime-400/30 bg-lime-400/10 p-4">
                <p className="text-sm font-bold text-lime-200">
                  {gameText.level} {currentStepIndex + 1} {gameText.of}{" "}
                  {setupSteps.length}
                </p>

                <p className="mt-1 text-sm text-zinc-400">
                  {gameText.completeLevels}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
