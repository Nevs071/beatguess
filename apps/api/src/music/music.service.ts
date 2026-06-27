import { Injectable } from '@nestjs/common';

type DeezerArtist = {
  id: number;
  name: string;
  picture_medium: string;
  picture_big: string;
  nb_fan: number;
  nb_album: number;
};

type DeezerTrack = {
  id: number;
  title: string;
  preview: string;
  duration: number;
  rank: number;
  artist: {
    id: number;
    name: string;
  };
  album: {
    id: number;
    title: string;
    cover_medium: string;
    cover_big: string;
  };
};

@Injectable()
export class MusicService {
  async searchArtists(query: string) {
    const response = await fetch(
      `https://api.deezer.com/search/artist?q=${encodeURIComponent(query)}&limit=10`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch artists from Deezer');
    }

    const data = await response.json();

    return data.data.map((artist: DeezerArtist) => ({
      id: artist.id,
      name: artist.name,
      image: artist.picture_medium,
      imageLarge: artist.picture_big,
      fans: artist.nb_fan,
      albums: artist.nb_album,
    }));
  }

  async getArtistTopTracks(artistId: number) {
    const response = await fetch(
      `https://api.deezer.com/artist/${artistId}/top?limit=50`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch artist tracks from Deezer');
    }

    const data = await response.json();

    return data.data
      .filter((track: DeezerTrack) => Boolean(track.preview))
      .map((track: DeezerTrack) => ({
        id: track.id,
        title: track.title,
        preview: track.preview,
        duration: track.duration,
        rank: track.rank,
        artistId: track.artist.id,
        artistName: track.artist.name,
        albumId: track.album.id,
        albumTitle: track.album.title,
        cover: track.album.cover_medium,
        coverLarge: track.album.cover_big,
      }));
  }
}