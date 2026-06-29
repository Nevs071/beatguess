"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { translations, type Language } from "@/lib/i18n";
import { useLanguage } from "@/lib/use-language";
import { usePlayer } from "@/lib/use-player";
import { saveScoreHistoryItem } from "@/lib/score-history";

type Difficulty = "easy" | "medium" | "hard";
type AnswerMode = "mcq" | "typed";
type TypedAnswerKind = "song" | "artist" | "album" | "mixed";
type ActiveTypedAnswerKind = "song" | "artist" | "album";

type TypedAnswerStatus = "correct" | "wrong" | null;

type PlayedTrackSegments = Record<string, number[]>;

type QuizOption = {
  id: number;
  title: string;
  artistName: string;
  albumTitle: string;
};

type QuizQuestion = {
  id: string;
  type: "guess_song_from_audio";
  difficulty: Difficulty;
  previewStartSeconds: number;
  previewDurationSeconds: number;
  preview: string;
  cover: string;
  coverLarge: string;
  artistName: string;
  albumTitle: string;
  correctTrackId: number;
  options: QuizOption[];
};

type AnswerResult = {
  questionId: string;
  selectedTitle: string;
  selectedArtistName: string;
  correctTitle: string;
  correctArtistName: string;
  isCorrect: boolean;
};

type QuizPlayTranslations = (typeof translations)[Language]["quizPlay"];

const PLAYED_TRACK_SEGMENTS_STORAGE_KEY = "beatguess-played-track-segments";
function normalizeTypedAnswer(answer: string) {
  return answer
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}
function getStableRandomIndex(seed: string, max: number) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return hash % max;
}

function getActiveTypedAnswerKind(
  typedAnswerKind: TypedAnswerKind,
  currentQuestion: QuizQuestion | undefined,
  questionIndex: number,
): ActiveTypedAnswerKind {
  if (typedAnswerKind !== "mixed") {
    return typedAnswerKind;
  }

  const mixedKinds: ActiveTypedAnswerKind[] = ["song", "artist", "album"];
  const seed = currentQuestion?.id ?? `question-${questionIndex}`;

  return mixedKinds[getStableRandomIndex(seed, mixedKinds.length)];
}

function getTypedCorrectAnswer(
  answerKind: ActiveTypedAnswerKind,
  currentQuestion: QuizQuestion,
  currentCorrectOption: QuizOption,
) {
  if (answerKind === "artist") {
    return currentQuestion.artistName || currentCorrectOption.artistName;
  }

  if (answerKind === "album") {
    return currentQuestion.albumTitle;
  }

  return currentCorrectOption.title;
}

type McqAnswerOption = {
  id: string;
  trackId: number;
  label: string;
  subtitle: string;
  isCorrect: boolean;
};

function getTrackAnswerValue(
  answerKind: ActiveTypedAnswerKind,
  currentQuestion: QuizQuestion,
  option: QuizOption,
) {
  if (answerKind === "artist") {
    return option.artistName;
  }

  if (answerKind === "album") {
    return option.albumTitle || currentQuestion.albumTitle;
  }

  return option.title;
}

function getUniqueMcqAnswerOptions(
  answerKind: ActiveTypedAnswerKind,
  currentQuestion: QuizQuestion,
  currentCorrectOption: QuizOption,
): McqAnswerOption[] {
  const correctAnswerValue = getTrackAnswerValue(
    answerKind,
    currentQuestion,
    currentCorrectOption,
  );

  const seenAnswers = new Set<string>();

  return currentQuestion.options
    .map((option) => {
      const label = getTrackAnswerValue(answerKind, currentQuestion, option);
      const normalizedLabel = normalizeTypedAnswer(label);

      if (!label || seenAnswers.has(normalizedLabel)) {
        return null;
      }

      seenAnswers.add(normalizedLabel);

      return {
        id: `${answerKind}-${normalizedLabel}-${option.id}`,
        trackId: option.id,
        label,
        subtitle: answerKind === "artist" ? "" : option.artistName,
        isCorrect:
          normalizeTypedAnswer(label) ===
          normalizeTypedAnswer(correctAnswerValue),
      };
    })
    .filter((option): option is McqAnswerOption => option !== null);
}

function readPlayedTrackSegments(): PlayedTrackSegments {
  try {
    const rawValue = localStorage.getItem(PLAYED_TRACK_SEGMENTS_STORAGE_KEY);

    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue);

    if (
      typeof parsedValue !== "object" ||
      parsedValue === null ||
      Array.isArray(parsedValue)
    ) {
      return {};
    }

    return parsedValue as PlayedTrackSegments;
  } catch {
    return {};
  }
}

function savePlayedTrackSegments(playedTrackSegments: PlayedTrackSegments) {
  localStorage.setItem(
    PLAYED_TRACK_SEGMENTS_STORAGE_KEY,
    JSON.stringify(playedTrackSegments),
  );
}

function getDifficultyLabel(difficulty: Difficulty, t: QuizPlayTranslations) {
  if (difficulty === "hard") {
    return t.hard;
  }

  if (difficulty === "medium") {
    return t.medium;
  }

  return t.easy;
}

function getGuestName(language: Language) {
  if (language === "fr") {
    return "Invité";
  }

  if (language === "de") {
    return "Gast";
  }

  return "Guest";
}

function getScoresText(language: Language) {
  if (language === "fr") {
    return "Scores";
  }

  if (language === "de") {
    return "Punkte";
  }

  return "Scores";
}

function getSavedForText(playerName: string, language: Language) {
  if (language === "fr") {
    return `Sauvegardé pour ${playerName}`;
  }

  if (language === "de") {
    return `Gespeichert für ${playerName}`;
  }

  return `Saved for ${playerName}`;
}

function getResultRank(accuracy: number, t: QuizPlayTranslations) {
  if (accuracy === 100) {
    return {
      title: t.rankLegendTitle,
      description: t.rankLegendDescription,
      emoji: "👑",
    };
  }

  if (accuracy >= 91) {
    return {
      title: t.rankGeniusTitle,
      description: t.rankGeniusDescription,
      emoji: "🧠",
    };
  }

  if (accuracy >= 76) {
    return {
      title: t.rankHitMasterTitle,
      description: t.rankHitMasterDescription,
      emoji: "🔥",
    };
  }

  if (accuracy >= 61) {
    return {
      title: t.rankSolidEarTitle,
      description: t.rankSolidEarDescription,
      emoji: "🎧",
    };
  }

  if (accuracy >= 41) {
    return {
      title: t.rankBeatHunterTitle,
      description: t.rankBeatHunterDescription,
      emoji: "🎯",
    };
  }

  if (accuracy >= 21) {
    return {
      title: t.rankWarmupTitle,
      description: t.rankWarmupDescription,
      emoji: "🔊",
    };
  }

  if (accuracy >= 1) {
    return {
      title: t.rankRookieTitle,
      description: t.rankRookieDescription,
      emoji: "🌱",
    };
  }

  return {
    title: t.rankSilentTitle,
    description: t.rankSilentDescription,
    emoji: "😅",
  };
}
  
const quizBackgroundTiles = [
  {
    label: "BEAT",
    icon: "♪",
    background:
      "linear-gradient(135deg, rgba(236,72,153,0.76), rgba(34,211,238,0.42))",
  },
  {
    label: "QUIZ",
    icon: "♫",
    background:
      "linear-gradient(135deg, rgba(163,230,53,0.76), rgba(59,130,246,0.42))",
  },
  {
    label: "HITS",
    icon: "♬",
    background:
      "linear-gradient(135deg, rgba(168,85,247,0.78), rgba(236,72,153,0.38))",
  },
  {
    label: "PLAY",
    icon: "♪",
    background:
      "linear-gradient(135deg, rgba(34,211,238,0.72), rgba(14,165,233,0.34))",
  },
  {
    label: "DROP",
    icon: "♫",
    background:
      "linear-gradient(135deg, rgba(249,115,22,0.70), rgba(236,72,153,0.42))",
  },
  {
    label: "SCORE",
    icon: "♬",
    background:
      "linear-gradient(135deg, rgba(132,204,22,0.72), rgba(34,211,238,0.36))",
  },
];

function QuizMusicBackground() {
  const tiles = Array.from({ length: 120 }, (_, index) => {
    return quizBackgroundTiles[index % quizBackgroundTiles.length];
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#160020] via-[#07152f] to-[#020617]" />

      <div className="absolute -left-32 -top-40 grid w-[150%] rotate-[-8deg] grid-cols-4 gap-5 opacity-90 md:grid-cols-6 lg:grid-cols-8">
        {tiles.map((tile, index) => (
          <div
            key={index}
            className={`relative h-40 overflow-hidden rounded-[1.5rem] border border-white/10 shadow-2xl md:h-52 ${
              index % 2 === 0 ? "translate-y-10" : "-translate-y-4"
            }`}
            style={{
              background: tile.background,
            }}
          >
            <div className="flex h-full flex-col justify-between p-4">
              <span className="text-5xl font-black text-white/85">
                {tile.icon}
              </span>

              <span className="text-2xl font-black tracking-[0.18em] text-white/80">
                {tile.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-black/58 via-black/35 to-black/50" />
<div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/62" />
<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.22),transparent_35%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(163,230,53,0.18),transparent_42%)]" />
    </div>
  );
}

function QuizPlayContent() {
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const { player } = usePlayer();
  const t = translations[language].quizPlay;

  const artistIdsParam = searchParams.get("artists");
  const difficultyParam = searchParams.get("difficulty");
  const amountParam = searchParams.get("amount");
  const answerModeParam = searchParams.get("answerMode");
  const typedAnswerKindParam = searchParams.get("typedAnswerKind");

  const parsedAmount = amountParam ? Number(amountParam) : 10;
  const questionAmount = [5, 10, 15, 20].includes(parsedAmount)
    ? parsedAmount
    : 10;

  const difficulty: Difficulty =
    difficultyParam === "medium" || difficultyParam === "hard"
      ? difficultyParam
      : "easy";
  const answerMode: AnswerMode = answerModeParam === "typed" ? "typed" : "mcq";
  const typedAnswerKind: TypedAnswerKind =
    typedAnswerKindParam === "artist" ||
    typedAnswerKindParam === "album" ||
    typedAnswerKindParam === "mixed"
      ? typedAnswerKindParam
      : "song";

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resultSavedRef = useRef(false);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answerResults, setAnswerResults] = useState<AnswerResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [typedAnswerStatus, setTypedAnswerStatus] =
    useState<TypedAnswerStatus>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const activeTypedAnswerKind = getActiveTypedAnswerKind(
    typedAnswerKind,
    currentQuestion,
    currentQuestionIndex,
  );

  const currentCorrectOption =
    currentQuestion?.options.find(
      (option) => option.id === currentQuestion.correctTrackId,
    ) ?? null;
  const currentTypedCorrectAnswer =
    currentQuestion && currentCorrectOption
      ? getTypedCorrectAnswer(
          activeTypedAnswerKind,
          currentQuestion,
          currentCorrectOption,
        )
      : "";
  const currentMcqAnswerOptions =
    currentQuestion && currentCorrectOption
      ? getUniqueMcqAnswerOptions(
          activeTypedAnswerKind,
          currentQuestion,
          currentCorrectOption,
        )
      : [];

  const previewStartSeconds = currentQuestion?.previewStartSeconds ?? 0;

  const basePreviewDurationSeconds =
    currentQuestion?.previewDurationSeconds ??
    (difficulty === "hard" ? 10 : difficulty === "medium" ? 20 : 30);

  const effectivePreviewDurationSeconds =
    difficulty === "easy" && audioDuration > 0
      ? Math.max(1, Math.floor(audioDuration - previewStartSeconds))
      : basePreviewDurationSeconds;

  const previewEndSeconds =
    previewStartSeconds + effectivePreviewDurationSeconds;

  const displayedCurrentTime = Math.min(
    Math.max(Math.floor(audioCurrentTime - previewStartSeconds), 0),
    effectivePreviewDurationSeconds,
  );

  const isFinished =
    questions.length > 0 && currentQuestionIndex >= questions.length;

  const accuracy =
    questions.length > 0
      ? Math.round((correctAnswers / questions.length) * 100)
      : 0;

  const resultRank = getResultRank(accuracy, t);

  const progressText = useMemo(() => {
    if (questions.length === 0) {
      return "0 / 0";
    }

    return `${Math.min(currentQuestionIndex + 1, questions.length)} / ${
      questions.length
    }`;
  }, [currentQuestionIndex, questions.length]);

  useEffect(() => {
    async function loadQuiz() {
      if (!artistIdsParam) {
        setHasError(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setHasError(false);

      try {
        const artistIds = artistIdsParam
          .split(",")
          .map((id) => Number(id))
          .filter(Boolean);

        const playedTrackSegments = readPlayedTrackSegments();

        const response = await fetch(`${API_BASE_URL}/quiz/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            artistIds,
            amount: questionAmount,
            difficulty,
            playedTrackSegments,
          }),
        });

        if (!response.ok) {
          throw new Error("Could not generate quiz");
        }

        const generatedQuestions: QuizQuestion[] = await response.json();

        const updatedPlayedTrackSegments: PlayedTrackSegments = {
          ...playedTrackSegments,
        };

        generatedQuestions.forEach((question) => {
          const trackId = String(question.correctTrackId);
          const previousSegments = updatedPlayedTrackSegments[trackId] ?? [];

          updatedPlayedTrackSegments[trackId] = Array.from(
            new Set([...previousSegments, question.previewStartSeconds ?? 0]),
          );
        });

        const limitedHistory = Object.fromEntries(
          Object.entries(updatedPlayedTrackSegments).slice(-500),
        );

        savePlayedTrackSegments(limitedHistory);

        resultSavedRef.current = false;
        setQuestions(generatedQuestions);
        setCurrentQuestionIndex(0);
        setSelectedTrackId(null);
        setScore(0);
        setCorrectAnswers(0);
        setAnswerResults([]);
        setAudioCurrentTime(0);
        setAudioDuration(0);
        setIsAudioPlaying(false);
        setTypedAnswer("");
        setTypedAnswerStatus(null);
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadQuiz();
  }, [artistIdsParam, difficulty, questionAmount, answerMode, typedAnswerKind]);
  useEffect(() => {
    if (!isFinished || questions.length === 0 || resultSavedRef.current) {
      return;
    }

    resultSavedRef.current = true;

    saveScoreHistoryItem({
      id: crypto.randomUUID(),
      playerName: player?.name ?? getGuestName(language),
      score,
      correctAnswers,
      totalQuestions: questions.length,
      accuracy,
      difficulty,
      rankTitle: resultRank.title,
      createdAt: new Date().toISOString(),
    });
  }, [
    isFinished,
    questions.length,
    player?.name,
    score,
    correctAnswers,
    accuracy,
    difficulty,
    resultRank.title,
  ]);

  function formatTime(seconds: number) {
    const safeSeconds = Math.max(0, seconds);
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  function toggleAudio() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (
      audio.currentTime < previewStartSeconds ||
      audio.currentTime >= previewEndSeconds ||
      audio.ended
    ) {
      audio.currentTime = previewStartSeconds;
      setAudioCurrentTime(previewStartSeconds);
    }

    if (audio.paused) {
      void audio.play();
      setIsAudioPlaying(true);
    } else {
      audio.pause();
      setIsAudioPlaying(false);
    }
  }

  function answerQuestion(selectedOption: McqAnswerOption) {
    if (!currentQuestion || !currentCorrectOption || selectedTrackId !== null) {
      return;
    }

    setSelectedTrackId(selectedOption.trackId);

    setAnswerResults((currentResults) => [
      ...currentResults,
      {
        questionId: currentQuestion.id,
        selectedTitle: selectedOption.label,
        selectedArtistName: selectedOption.subtitle,
        correctTitle: currentTypedCorrectAnswer,
        correctArtistName:
          activeTypedAnswerKind === "artist" ? "" : currentQuestion.artistName,
        isCorrect: selectedOption.isCorrect,
      },
    ]);

    if (selectedOption.isCorrect) {
      setScore((currentScore) => currentScore + 100);
      setCorrectAnswers((currentCorrectAnswers) => currentCorrectAnswers + 1);
    }
  }
  function submitTypedAnswer() {
    if (!currentQuestion || !currentCorrectOption || selectedTrackId !== null) {
      return;
    }

    const cleanTypedAnswer = typedAnswer.trim();

    if (!cleanTypedAnswer) {
      return;
    }

    if (!currentTypedCorrectAnswer) {
      return;
    }

    const isCorrect =
      normalizeTypedAnswer(cleanTypedAnswer) ===
      normalizeTypedAnswer(currentTypedCorrectAnswer);

    setSelectedTrackId(currentQuestion.correctTrackId);
    setTypedAnswerStatus(isCorrect ? "correct" : "wrong");

    setAnswerResults((currentResults) => [
      ...currentResults,
      {
        questionId: currentQuestion.id,
        selectedTitle: cleanTypedAnswer,
        selectedArtistName: "",
        correctTitle: currentCorrectOption.title,
        correctArtistName: currentCorrectOption.artistName,
        isCorrect,
      },
    ]);

    if (isCorrect) {
      setScore((currentScore) => currentScore + 100);
      setCorrectAnswers((currentCorrectAnswers) => currentCorrectAnswers + 1);
    }
  }

  function nextQuestion() {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setAudioCurrentTime(0);
    setAudioDuration(0);
    setIsAudioPlaying(false);
    setSelectedTrackId(null);
    setTypedAnswer("");
    setTypedAnswerStatus(null);
    setCurrentQuestionIndex((currentIndex) => currentIndex + 1);
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-zinc-400">{t.loading}</p>
      </main>
    );
  }

  if (hasError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="max-w-xl rounded-3xl border border-red-500/30 bg-red-950/30 p-8 text-center">
          <h1 className="text-2xl font-bold">{t.quizCouldNotStart}</h1>
          <p className="mt-3 text-red-200">{t.noQuestion}</p>

          <a
            href="/quiz/custom-mix"
            className="mt-6 inline-block rounded-full bg-lime-400 px-6 py-3 font-semibold text-black"
          >
            {t.changeArtists}
          </a>
        </div>
      </main>
    );
  }

  if (isFinished) {
    return (
  <main className="relative min-h-screen overflow-hidden bg-[#020617] px-4 pb-32 pt-24 text-white md:px-6 md:py-10">
    <QuizMusicBackground />

    <section className="relative mx-auto max-w-4xl">
          <div className="rounded-3xl border border-lime-400/30 bg-zinc-950 p-8 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-lime-300">
              {t.quizFinished}
            </p>

            <div className="mt-6 text-7xl">{resultRank.emoji}</div>

            <h1 className="mt-4 text-4xl font-bold md:text-5xl">
              {resultRank.title}
            </h1>

            <p className="mt-3 text-zinc-400">{resultRank.description}</p>

            <p className="mt-3 text-sm text-lime-300">
              {getSavedForText(
                player?.name ?? getGuestName(language),
                language,
              )}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-black p-5">
                <p className="text-sm text-zinc-500">{t.score}</p>
                <p className="mt-2 text-3xl font-bold text-lime-300">{score}</p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black p-5">
                <p className="text-sm text-zinc-500">{t.correctAnswers}</p>
                <p className="mt-2 text-3xl font-bold text-lime-300">
                  {correctAnswers} / {questions.length}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black p-5">
                <p className="text-sm text-zinc-500">{t.accuracy}</p>
                <p className="mt-2 text-3xl font-bold text-lime-300">
                  {accuracy}%
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-5 text-left">
              <p className="text-sm font-semibold text-zinc-300">
                {t.answerReview}
              </p>

              <div className="mt-4 space-y-3">
                {answerResults.map((answer, index) => (
                  <div
                    key={answer.questionId}
                    className={`rounded-2xl border p-4 ${
                      answer.isCorrect
                        ? "border-lime-400/40 bg-lime-400/10"
                        : "border-red-400/40 bg-red-500/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">
                        {t.question} {index + 1}{" "}
                        {answer.isCorrect ? "✅" : "❌"}
                      </p>

                      <p
                        className={`text-sm font-semibold ${
                          answer.isCorrect ? "text-lime-300" : "text-red-300"
                        }`}
                      >
                        {answer.isCorrect ? t.correct : t.wrong}
                      </p>
                    </div>

                    <p className="mt-3 text-sm text-zinc-400">
                      {t.correctAnswer}
                    </p>
                    <p className="font-semibold text-white">
                      {answer.correctTitle}
                      {answer.correctArtistName && (
                        <span className="text-zinc-500">
                          {" "}
                          — {answer.correctArtistName}
                        </span>
                      )}
                    </p>

                    <p className="mt-3 text-sm text-zinc-400">{t.yourAnswer}</p>
                    <p className="font-semibold text-white">
                      {answer.selectedTitle}
                      {answer.selectedArtistName && (
                        <span className="text-zinc-500">
                          {" "}
                          — {answer.selectedArtistName}
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-5 text-left">
              <p className="text-sm font-semibold text-zinc-300">
                {t.rankSystem}
              </p>

              <p className="mt-2 text-sm text-zinc-500">{t.rankSystemText}</p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href="/quiz/custom-mix"
                className="rounded-full bg-lime-400 px-6 py-3 font-semibold text-black"
              >
                {t.playAnother}
              </a>

              <a
                href="/scores"
                className="rounded-full border border-lime-400 px-6 py-3 font-semibold text-lime-300"
              >
                {getScoresText(language)}
              </a>

              <a
                href="/"
                className="rounded-full border border-zinc-700 px-6 py-3 font-semibold text-white"
              >
                {t.backHome}
              </a>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!currentQuestion) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-zinc-400">{t.noQuestion}</p>
      </main>
    );
  }

  return (
  <main className="relative min-h-screen overflow-hidden bg-[#020617] px-4 pb-32 pt-24 text-white md:px-6 md:py-10">
    <QuizMusicBackground />

    <section className="relative mx-auto max-w-5xl">
        <a href="/quiz/custom-mix" className="text-sm text-lime-300">
          ← {t.changeArtists}
        </a>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm uppercase tracking-[0.3em] text-lime-300">
            {t.audioQuiz}
          </p>
          <p className="text-sm text-zinc-400">{progressText}</p>
        </div>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-black/35 p-6 shadow-[0_0_80px_rgba(34,211,238,0.10)] backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-3xl border border-white/10 bg-black/45 shadow-[0_0_40px_rgba(163,230,53,0.10)] backdrop-blur-xl">
              {selectedTrackId === null ? (
                <span className="text-4xl">🎵</span>
              ) : (
                <img
                  src={currentQuestion.cover}
                  alt={currentQuestion.albumTitle}
                  className="h-32 w-32 rounded-3xl object-cover"
                />
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold">
                {answerMode === "typed"
                  ? activeTypedAnswerKind === "artist"
                    ? t.typeArtistTitle
                    : activeTypedAnswerKind === "album"
                      ? t.typeAlbumTitle
                      : t.typeSongTitle
                  : t.guessTitle}
              </h1>

              <p className="mt-2 text-zinc-400">
                {answerMode === "typed"
                  ? activeTypedAnswerKind === "artist"
                    ? t.typeArtistDescription
                    : activeTypedAnswerKind === "album"
                      ? t.typeAlbumDescription
                      : t.typeSongDescription
                  : t.guessDescription}
              </p>

              <div className="mt-6">
                <audio
                  ref={audioRef}
                  key={currentQuestion.id}
                  src={currentQuestion.preview}
                  onLoadedMetadata={(event) => {
                    const audio = event.currentTarget;

                    setAudioDuration(audio.duration);
                    audio.currentTime = previewStartSeconds;
                    setAudioCurrentTime(previewStartSeconds);
                    setIsAudioPlaying(false);
                  }}
                  onTimeUpdate={(event) => {
                    const audio = event.currentTarget;

                    if (audio.currentTime >= previewEndSeconds) {
                      audio.pause();
                      setAudioCurrentTime(previewEndSeconds);
                      setIsAudioPlaying(false);
                      return;
                    }

                    setAudioCurrentTime(audio.currentTime);
                  }}
                  onEnded={() => {
                    setAudioCurrentTime(previewEndSeconds);
                    setIsAudioPlaying(false);
                  }}
                />

                <div className="rounded-full border border-white/10 bg-black/50 p-4 backdrop-blur-xl">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={toggleAudio}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 font-bold text-black"
                    >
                      {isAudioPlaying ? "Ⅱ" : "▶"}
                    </button>

                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-700">
                        <div
                          className="h-full bg-lime-400 transition-all"
                          style={{
                            width: `${
                              effectivePreviewDurationSeconds > 0
                                ? (displayedCurrentTime /
                                    effectivePreviewDurationSeconds) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <p className="min-w-[90px] text-right text-sm text-zinc-300">
                      {formatTime(displayedCurrentTime)} /{" "}
                      {formatTime(effectivePreviewDurationSeconds)}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm text-zinc-500">
                {t.difficulty}: {getDifficultyLabel(difficulty, t)} ·{" "}
                {t.segmentStartsAt}: {previewStartSeconds}s · {t.previewLimit}:{" "}
                {effectivePreviewDurationSeconds}s
              </p>
            </div>
          </div>
        </div>

        {answerMode === "mcq" ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {currentMcqAnswerOptions.map((option) => {
              const isSelected = selectedTrackId === option.trackId;
              const isCorrect = option.isCorrect;
              const showResult = selectedTrackId !== null;

            let resultClass =
  "border-white/10 bg-black/35 backdrop-blur-xl hover:border-lime-400 hover:bg-white/10";

              if (showResult && isCorrect) {
                resultClass = "border-lime-400 bg-lime-400/20";
              }

              if (showResult && isSelected && !isCorrect) {
                resultClass = "border-red-400 bg-red-500/20";
              }

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => answerQuestion(option)}
                  disabled={showResult}
                  className={`rounded-2xl border p-5 text-left transition ${resultClass}`}
                >
                  <h2 className="text-lg font-semibold">{option.label}</h2>

                  {showResult && option.subtitle && (
                    <p className="mt-1 text-sm text-zinc-400">
                      {option.subtitle}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-white/10 bg-black/55 p-5 shadow-[0_0_70px_rgba(236,72,153,0.08)] backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">
              {t.typeYourAnswer}
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={typedAnswer}
                onChange={(event) => setTypedAnswer(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submitTypedAnswer();
                  }
                }}
                disabled={selectedTrackId !== null}
                placeholder={
                  activeTypedAnswerKind === "artist"
                    ? t.typedArtistPlaceholder
                    : activeTypedAnswerKind === "album"
                      ? t.typedAlbumPlaceholder
                      : t.typedAnswerPlaceholder
                }
                className="flex-1 rounded-2xl border border-white/10 bg-black/35 px-5 py-4 text-white outline-none placeholder:text-zinc-600 focus:border-lime-400 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="button"
                onClick={submitTypedAnswer}
                disabled={!typedAnswer.trim() || selectedTrackId !== null}
                className="rounded-2xl bg-lime-400 px-6 py-4 font-black text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t.submitAnswer}
              </button>
            </div>

            {typedAnswerStatus && (
              <div
                className={`mt-4 rounded-2xl border p-4 ${
                  typedAnswerStatus === "correct"
                    ? "border-lime-400/40 bg-lime-400/10 text-lime-200"
                    : "border-red-400/40 bg-red-500/10 text-red-200"
                }`}
              >
                <p className="font-bold">
                  {typedAnswerStatus === "correct"
                    ? t.typedCorrect
                    : t.typedWrong}
                </p>

                {typedAnswerStatus === "wrong" && currentCorrectOption && (
                  <p className="mt-2 text-sm">
                    {t.correctWas}: {currentTypedCorrectAnswer}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <p className="text-xl font-semibold">
            {t.score}: {score} · {t.correct}: {correctAnswers}
          </p>

          {selectedTrackId !== null && (
            <button
              type="button"
              onClick={nextQuestion}
              className="rounded-full bg-lime-400 px-8 py-3 font-semibold text-black transition hover:bg-lime-300"
            >
              {t.next}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

export default function QuizPlayPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-black text-white">
          BeatGuess...
        </main>
      }
    >
      <QuizPlayContent />
    </Suspense>
  );
}
