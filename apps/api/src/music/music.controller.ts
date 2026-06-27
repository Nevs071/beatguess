import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { MusicService } from './music.service';

@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get('artists/search')
  searchArtists(@Query('q') query: string) {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException(
        'Search query must contain at least 2 characters',
      );
    }

    return this.musicService.searchArtists(query.trim());
  }

  @Get('artists/:artistId/tracks')
  getArtistTopTracks(@Param('artistId', ParseIntPipe) artistId: number) {
    return this.musicService.getArtistTopTracks(artistId);
  }
}