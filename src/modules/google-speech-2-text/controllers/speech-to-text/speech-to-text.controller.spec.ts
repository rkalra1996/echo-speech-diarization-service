import { Test, TestingModule } from '@nestjs/testing';
import { SpeechToTextController } from './speech-to-text.controller';

describe('SpeechToText Controller', () => {
  let controller: SpeechToTextController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpeechToTextController],
    }).compile();

    controller = module.get<SpeechToTextController>(SpeechToTextController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
