'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

type Difficulty = 'easy' | 'medium' | 'hard';

type QuizOption = {
  id: number;
  title: string;
  artistName: string;
};

type QuizQuestion = {
  id: string;
  type: 'guess_song_from_audio';
  difficulty: Difficulty;
  previewDurationSeconds: number;
  preview: string;
  cover: string;
  coverLarge: string;
  artistName: string;
  albumTitle: string;
  correctTrackId: number;
  options: QuizOption[];
};

function QuizPlayContent() {
  const searchParams = useSearchParams();
  const artistIdsParam = searchParams.get('artists');
  const difficultyParam = searchParams.get('difficulty');
  const amountParam = searchParams.get('amount');
  const questionAmount = amountParam ? Number(amountParam) : 10;

  const difficulty: Difficulty =
    difficultyParam === 'medium' || difficultyParam === 'hard'
      ? difficultyParam
      : 'easy';

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const previewLimitSeconds =
    currentQuestion?.previewDurationSeconds ??
    (difficulty === 'hard' ? 10 : difficulty === 'medium' ? 20 : 30);

  const effectivePreviewLimitSeconds =
    difficulty === 'easy' && audioDuration > 0
      ? Math.min(previewLimitSeconds, Math.floor(audioDuration))
      : previewLimitSeconds;

  const displayedCurrentTime = Math.min(
    Math.floor(audioCurrentTime),
    effectivePreviewLimitSeconds,
  );

  const isFinished =
    questions.length > 0 && currentQuestionIndex >= questions.length;

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

        const response = await fetch(`${API_BASE_URL}/quiz/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            artistIds,
            amount: questionAmount,
            difficulty,
          }),
        });

        if (!response.ok) {
          throw new Error('Could not generate quiz');
        }

        const generatedQuestions: QuizQuestion[] = await response.json();
        setQuestions(generatedQuestions);
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

    if (audio.currentTime >= effectivePreviewLimitSeconds) {
      audio.currentTime = 0;
      setAudioCurrentTime(0);
    }

    if (audio.paused) {
      audio.play();
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

    setSelectedTrackId(trackId);

    if (trackId === currentQuestion.correctTrackId) {
      setScore((currentScore) => currentScore + 100);
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
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="max-w-xl rounded-3xl border border-lime-400/30 bg-zinc-950 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-lime-300">
            Quiz finished
          </p>
          <h1 className="mt-4 text-5xl font-bold">Score: {score}</h1>
          <p className="mt-4 text-zinc-400">
            You played {questions.length} questions.
          </p>

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
                    setAudioDuration(event.currentTarget.duration);
                    setAudioCurrentTime(0);
                    setIsAudioPlaying(false);
                  }}
                  onTimeUpdate={(event) => {
                    const audio = event.currentTarget;

                    if (audio.currentTime >= effectivePreviewLimitSeconds) {
                      audio.pause();
                      audio.currentTime = effectivePreviewLimitSeconds;
                      setAudioCurrentTime(effectivePreviewLimitSeconds);
                      setIsAudioPlaying(false);
                      return;
                    }

                    setAudioCurrentTime(audio.currentTime);
                  }}
                  onEnded={() => {
                    setIsAudioPlaying(false);
                  }}
                />

                <div className="rounded-full bg-zinc-900 p-4">
                  <div className="flex items-center gap-4">
                    <button
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
                              effectivePreviewLimitSeconds > 0
                                ? (displayedCurrentTime /
                                    effectivePreviewLimitSeconds) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <p className="min-w-[90px] text-right text-sm text-zinc-300">
                      {formatTime(displayedCurrentTime)} /{' '}
                      {formatTime(effectivePreviewLimitSeconds)}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm text-zinc-500">
                Difficulty: {currentQuestion.difficulty} · Preview limit:{' '}
                {effectivePreviewLimitSeconds}s
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
          <p className="text-xl font-semibold">Score: {score}</p>

          {selectedTrackId !== null && (
            <button
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