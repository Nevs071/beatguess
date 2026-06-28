import { BadRequestException, Injectable } from '@nestjs/common';
import { MusicService } from '../music/music.service';

type Difficulty = 'easy' | 'medium' | 'hard';

type PlayedTrackSegments = Record<string, number[]>;

type Track = {
  id: number;
  title: string;
  preview: string;
  duration: number;
  rank: number;
  artistId: number;
  artistName: string;
  albumId: number;
  albumTitle: string;
  cover: string;
  coverLarge: string;
};

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

@Injectable()
export class QuizService {
  constructor(private readonly musicService: MusicService) {}

  async generateQuiz(
    artistIds: number[],
    amount = 10,
    difficulty: Difficulty = 'easy',
    playedTrackSegments: PlayedTrackSegments = {},
  ): Promise<QuizQuestion[]> {
    if (!artistIds || artistIds.length === 0) {
      throw new BadRequestException('At least one artist is required');
    }

    const safeAmount = Math.min(Math.max(amount, 1), 20);

    const tracksByArtist = await Promise.all(
      artistIds.map((artistId) =>
        this.musicService.getArtistTopTracks(artistId),
      ),
    );

    const allTracks = tracksByArtist
      .flat()
      .filter((track: Track) => Boolean(track.preview));

    const uniqueTracks = this.removeDuplicateTracks(allTracks);

    if (uniqueTracks.length < 4) {
      throw new BadRequestException(
        'Not enough tracks with previews found for this quiz',
      );
    }

    const possibleStartSeconds =
      this.getPossiblePreviewStartSeconds(difficulty);

    const freshTracks = uniqueTracks.filter((track) => {
      const usedSegments = playedTrackSegments[String(track.id)] ?? [];
      return usedSegments.length === 0;
    });

    const replayableTracks = uniqueTracks.filter((track) => {
      const usedSegments = playedTrackSegments[String(track.id)] ?? [];

      if (usedSegments.length === 0) {
        return false;
      }

      return possibleStartSeconds.some(
        (startSecond) => !usedSegments.includes(startSecond),
      );
    });

    const preferredTracks = this.removeDuplicateTracks([
      ...freshTracks,
      ...replayableTracks,
    ]);

    const minimumNeededTracks = Math.min(safeAmount, uniqueTracks.length);

    const questionPool =
      preferredTracks.length >= minimumNeededTracks
        ? preferredTracks
        : uniqueTracks;

    const selectedTracks = this.shuffleArray(questionPool).slice(
      0,
      Math.min(safeAmount, questionPool.length),
    );

    return selectedTracks.map((correctTrack, index) => {
      const wrongOptions = this.shuffleArray(
        uniqueTracks.filter((track) => track.id !== correctTrack.id),
      ).slice(0, 3);

      const options = this.shuffleArray([correctTrack, ...wrongOptions]).map(
        (track) => ({
          id: track.id,
          title: track.title,
          artistName: track.artistName,
        }),
      );

      return {
        id: `question-${index + 1}-${correctTrack.id}`,
        type: 'guess_song_from_audio' as const,
        difficulty,
        previewStartSeconds: this.getPreviewStartSeconds(
          correctTrack.id,
          difficulty,
          playedTrackSegments,
        ),
        previewDurationSeconds: this.getPreviewDurationSeconds(difficulty),
        preview: correctTrack.preview,
        cover: correctTrack.cover,
        coverLarge: correctTrack.coverLarge,
        artistName: correctTrack.artistName,
        albumTitle: correctTrack.albumTitle,
        correctTrackId: correctTrack.id,
        options,
      };
    });
  }

  private removeDuplicateTracks(tracks: Track[]): Track[] {
    return tracks.filter(
      (track, index, self) =>
        self.findIndex((item) => item.id === track.id) === index,
    );
  }

  private shuffleArray<T>(items: T[]): T[] {
    return [...items].sort(() => Math.random() - 0.5);
  }

  private getPreviewDurationSeconds(difficulty: Difficulty): number {
    if (difficulty === 'hard') {
      return 10;
    }

    if (difficulty === 'medium') {
      return 20;
    }

    return 30;
  }

  private getPossiblePreviewStartSeconds(difficulty: Difficulty): number[] {
    if (difficulty === 'hard') {
      return [0, 10, 20];
    }

    if (difficulty === 'medium') {
      return [0, 10];
    }

    return [0];
  }

  private getPreviewStartSeconds(
    trackId: number,
    difficulty: Difficulty,
    playedTrackSegments: PlayedTrackSegments,
  ): number {
    const possibleStartSeconds =
      this.getPossiblePreviewStartSeconds(difficulty);

    const usedStartSeconds = playedTrackSegments[String(trackId)] ?? [];

    const unusedStartSeconds = possibleStartSeconds.filter(
      (startSecond) => !usedStartSeconds.includes(startSecond),
    );

    const startOptions =
      unusedStartSeconds.length > 0 ? unusedStartSeconds : possibleStartSeconds;

    return this.shuffleArray(startOptions)[0] ?? 0;
  }
}