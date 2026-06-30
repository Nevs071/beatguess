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
async searchArtists(@Query('query') query?: string, @Query('q') q?: string) {
  const searchQuery = query ?? q ?? '';

  return this.musicService.searchArtists(searchQuery);
}

  @Get('artists/:artistId/tracks')
  getArtistTopTracks(@Param('artistId', ParseIntPipe) artistId: number) {
    return this.musicService.getArtistTopTracks(artistId);
  }
}