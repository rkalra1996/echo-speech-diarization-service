import { Test, TestingModule } from '@nestjs/testing';
import { SpeechToTextEventHandlerService } from './speech-to-text-event-handler.service';

describe('SpeechToTextEventHandlerService', () => {
  let service: SpeechToTextEventHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpeechToTextEventHandlerService],
    }).compile();

    service = module.get<SpeechToTextEventHandlerService>(SpeechToTextEventHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
