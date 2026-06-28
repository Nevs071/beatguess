'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

type Difficulty = 'easy' | 'medium' | 'hard';

type PlayedTrackSegments = Record<string, number[]>;

type QuizOption = {
  id: number;
  title: string;
  artistName: string;
};

type QuizQuestion = {
  id: string;
  type: 'guess_song_from_audio';
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

const PLAYED_TRACK_SEGMENTS_STORAGE_KEY = 'beatguess-played-track-segments';

function readPlayedTrackSegments(): PlayedTrackSegments {
  try {
    const rawValue = localStorage.getItem(PLAYED_TRACK_SEGMENTS_STORAGE_KEY);

    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue);

    if (
      typeof parsedValue !== 'object' ||
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

function getResultRank(accuracy: number) {
  if (accuracy === 100) {
    return {
      title: 'BeatGuess Legend',
      description: 'Perfect score. You really know your music.',
      emoji: '👑',
    };
  }

  if (accuracy >= 91) {
    return {
      title: 'Music Genius',
      description: 'Almost perfect. Your music knowledge is elite.',
      emoji: '🧠',
    };
  }

  if (accuracy >= 76) {
    return {
      title: 'Hit Master',
      description: 'Very strong performance. You know the hits.',
      emoji: '🔥',
    };
  }

  if (accuracy >= 61) {
    return {
      title: 'Solid Ear',
      description: 'Good ear. You recognized most of the tracks.',
      emoji: '🎧',
    };
  }

  if (accuracy >= 41) {
    return {
      title: 'Beat Hunter',
      description: 'Not bad. You caught a good part of the quiz.',
      emoji: '🎯',
    };
  }

  if (accuracy >= 21) {
    return {
      title: 'Warm-up Listener',
      description: 'You are warming up. A few more rounds will help.',
      emoji: '🔊',
    };
  }

  if (accuracy >= 1) {
    return {
      title: 'Rookie Ear',
      description: 'You got at least one. Time to sharpen the ear.',
      emoji: '🌱',
    };
  }

  return {
    title: 'Silent Mode',
    description: 'No correct answer this time. Run it back.',
    emoji: '😅',
  };
}

function QuizPlayContent() {
  const searchParams = useSearchParams();
  const artistIdsParam = searchParams.get('artists');
  const difficultyParam = searchParams.get('difficulty');
  const amountParam = searchParams.get('amount');

  const parsedAmount = amountParam ? Number(amountParam) : 10;
  const questionAmount = [5, 10, 15, 20].includes(parsedAmount)
    ? parsedAmount
    : 10;

  const difficulty: Difficulty =
    difficultyParam === 'medium' || difficultyParam === 'hard'
      ? difficultyParam
      : 'easy';

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answerResults, setAnswerResults] = useState<AnswerResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const previewStartSeconds = currentQuestion?.previewStartSeconds ?? 0;

  const basePreviewDurationSeconds =
    currentQuestion?.previewDurationSeconds ??
    (difficulty === 'hard' ? 10 : difficulty === 'medium' ? 20 : 30);

  const effectivePreviewDurationSeconds =
    difficulty === 'easy' && audioDuration > 0
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

  const resultRank = getResultRank(accuracy);

  const progressText = useMemo(() => {
    if (questions.length === 0) {
      return '0 / 0';
    }

    return `${Math.min(currentQuestionIndex + 1, questions.length)} / ${
      questions.length
    }`;
  }, [currentQuestionIndex, questions.length]);

  useEffect(() => {
    async function loadQuiz() {
      if (!artistIdsParam) {
        setError('No artists selected. Go back and choose artists first.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const artistIds = artistIdsParam
          .split(',')
          .map((id) => Number(id))
          .filter(Boolean);

        const playedTrackSegments = readPlayedTrackSegments();

        const response = await fetch(`${API_BASE_URL}/quiz/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            artistIds,
            amount: questionAmount,
            difficulty,
            playedTrackSegments,
          }),
        });

        if (!response.ok) {
          throw new Error('Could not generate quiz');
        }

        const generatedQuestions: QuizQuestion[] = await response.json();

        const updatedPlayedTrackSegments: PlayedTrackSegments = {
          ...playedTrackSegments,
        };

        generatedQuestions.forEach((question) => {
          const trackId = String(question.correctTrackId);
          const previousSegments = updatedPlayedTrackSegments[trackId] ?? [];

          updatedPlayedTrackSegments[trackId] = Array.from(
            new Set([
              ...previousSegments,
              question.previewStartSeconds ?? 0,
            ]),
          );
        });

        const limitedHistory = Object.fromEntries(
          Object.entries(updatedPlayedTrackSegments).slice(-500),
        );

        savePlayedTrackSegments(limitedHistory);

        setQuestions(generatedQuestions);
        setCurrentQuestionIndex(0);
        setSelectedTrackId(null);
        setScore(0);
        setCorrectAnswers(0);
        setAnswerResults([]);
        setAudioCurrentTime(0);
        setAudioDuration(0);
        setIsAudioPlaying(false);
      } catch {
        setError('Could not load quiz. Check if the backend is running.');
      } finally {
        setIsLoading(false);
      }
    }

    loadQuiz();
  }, [artistIdsParam, difficulty, questionAmount]);

  function formatTime(seconds: number) {
    const safeSeconds = Math.max(0, seconds);
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  function answerQuestion(trackId: number) {
    if (!currentQuestion || selectedTrackId !== null) {
      return;
    }

    const selectedOption = currentQuestion.options.find(
      (option) => option.id === trackId,
    );

    const correctOption = currentQuestion.options.find(
      (option) => option.id === currentQuestion.correctTrackId,
    );

    if (!selectedOption || !correctOption) {
      return;
    }

    const isCorrect = trackId === currentQuestion.correctTrackId;

    setSelectedTrackId(trackId);

    setAnswerResults((currentResults) => [
      ...currentResults,
      {
        questionId: currentQuestion.id,
        selectedTitle: selectedOption.title,
        selectedArtistName: selectedOption.artistName,
        correctTitle: correctOption.title,
        correctArtistName: correctOption.artistName,
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
    setCurrentQuestionIndex((currentIndex) => currentIndex + 1);
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-zinc-400">Generating your quiz...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="max-w-xl rounded-3xl border border-red-500/30 bg-red-950/30 p-8 text-center">
          <h1 className="text-2xl font-bold">Quiz could not start</h1>
          <p className="mt-3 text-red-200">{error}</p>
          <a
            href="/quiz/custom-mix"
            className="mt-6 inline-block rounded-full bg-lime-400 px-6 py-3 font-semibold text-black"
          >
            Choose artists again
          </a>
        </div>
      </main>
    );
  }

  if (isFinished) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white">
        <section className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-lime-400/30 bg-zinc-950 p-8 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-lime-300">
              Quiz finished
            </p>

            <div className="mt-6 text-7xl">{resultRank.emoji}</div>

            <h1 className="mt-4 text-4xl font-bold md:text-5xl">
              {resultRank.title}
            </h1>

            <p className="mt-3 text-zinc-400">{resultRank.description}</p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-black p-5">
                <p className="text-sm text-zinc-500">Score</p>
                <p className="mt-2 text-3xl font-bold text-lime-300">
                  {score}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black p-5">
                <p className="text-sm text-zinc-500">Correct answers</p>
                <p className="mt-2 text-3xl font-bold text-lime-300">
                  {correctAnswers} / {questions.length}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-black p-5">
                <p className="text-sm text-zinc-500">Accuracy</p>
                <p className="mt-2 text-3xl font-bold text-lime-300">
                  {accuracy}%
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-5 text-left">
              <p className="text-sm font-semibold text-zinc-300">
                Answer review
              </p>

              <div className="mt-4 space-y-3">
                {answerResults.map((answer, index) => (
                  <div
                    key={answer.questionId}
                    className={`rounded-2xl border p-4 ${
                      answer.isCorrect
                        ? 'border-lime-400/40 bg-lime-400/10'
                        : 'border-red-400/40 bg-red-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">
                        Question {index + 1} {answer.isCorrect ? '✅' : '❌'}
                      </p>

                      <p
                        className={`text-sm font-semibold ${
                          answer.isCorrect ? 'text-lime-300' : 'text-red-300'
                        }`}
                      >
                        {answer.isCorrect ? 'Correct' : 'Wrong'}
                      </p>
                    </div>

                    <p className="mt-3 text-sm text-zinc-400">
                      Correct answer
                    </p>
                    <p className="font-semibold text-white">
                      {answer.correctTitle}{' '}
                      <span className="text-zinc-500">
                        — {answer.correctArtistName}
                      </span>
                    </p>

                    <p className="mt-3 text-sm text-zinc-400">Your answer</p>
                    <p className="font-semibold text-white">
                      {answer.selectedTitle}{' '}
                      <span className="text-zinc-500">
                        — {answer.selectedArtistName}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-5 text-left">
              <p className="text-sm font-semibold text-zinc-300">
                Rank system
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                0% Silent Mode · 1–20% Rookie Ear · 21–40% Warm-up Listener ·
                41–60% Beat Hunter · 61–75% Solid Ear · 76–90% Hit Master ·
                91–99% Music Genius · 100% BeatGuess Legend
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href="/quiz/custom-mix"
                className="rounded-full bg-lime-400 px-6 py-3 font-semibold text-black"
              >
                Play another mix
              </a>

              <a
                href="/"
                className="rounded-full border border-zinc-700 px-6 py-3 font-semibold text-white"
              >
                Back home
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
        <p className="text-zinc-400">No question available.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-4xl">
        <a href="/quiz/custom-mix" className="text-sm text-lime-300">
          ← Change artists
        </a>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm uppercase tracking-[0.3em] text-lime-300">
            Audio Quiz
          </p>
          <p className="text-sm text-zinc-400">{progressText}</p>
        </div>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900">
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
              <h1 className="text-3xl font-bold">Guess the song title</h1>
              <p className="mt-2 text-zinc-400">
                Listen to the preview and choose the correct song.
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

                <div className="rounded-full bg-zinc-900 p-4">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={toggleAudio}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 font-bold text-black"
                    >
                      {isAudioPlaying ? 'Ⅱ' : '▶'}
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
                      {formatTime(displayedCurrentTime)} /{' '}
                      {formatTime(effectivePreviewDurationSeconds)}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm text-zinc-500">
                Difficulty: {currentQuestion.difficulty} · Segment starts at:{' '}
                {previewStartSeconds}s · Preview limit:{' '}
                {effectivePreviewDurationSeconds}s
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedTrackId === option.id;
            const isCorrect = option.id === currentQuestion.correctTrackId;
            const showResult = selectedTrackId !== null;

            let resultClass =
              'border-zinc-800 bg-zinc-950 hover:border-lime-400';

            if (showResult && isCorrect) {
              resultClass = 'border-lime-400 bg-lime-400/20';
            }

            if (showResult && isSelected && !isCorrect) {
              resultClass = 'border-red-400 bg-red-500/20';
            }

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => answerQuestion(option.id)}
                disabled={showResult}
                className={`rounded-2xl border p-5 text-left transition ${resultClass}`}
              >
                <h2 className="text-lg font-semibold">{option.title}</h2>

                {showResult && (
                  <p className="mt-1 text-sm text-zinc-400">
                    {option.artistName}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-xl font-semibold">
            Score: {score} · Correct: {correctAnswers}
          </p>

          {selectedTrackId !== null && (
            <button
              type="button"
              onClick={nextQuestion}
              className="rounded-full bg-lime-400 px-8 py-3 font-semibold text-black transition hover:bg-lime-300"
            >
              Next
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
          Loading...
        </main>
      }
    >
      <QuizPlayContent />
    </Suspense>
  );
}