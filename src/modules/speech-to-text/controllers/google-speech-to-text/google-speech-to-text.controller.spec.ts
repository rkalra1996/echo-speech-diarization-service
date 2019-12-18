import { Test, TestingModule } from '@nestjs/testing';
import { GoogleSpeechToTextController } from './google-speech-to-text.controller';

describe('GoogleSpeechToText Controller', () => {
  let controller: GoogleSpeechToTextController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleSpeechToTextController],
    }).compile();

    controller = module.get<GoogleSpeechToTextController>(GoogleSpeechToTextController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
