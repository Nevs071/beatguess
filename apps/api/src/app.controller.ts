import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHome() {
    return {
      message: 'BeatGuess API is running',
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      app: 'BeatGuess API',
      version: '0.1.0',
    };
  }
}