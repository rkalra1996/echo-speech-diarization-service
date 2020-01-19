import { Test, TestingModule } from '@nestjs/testing';
import { SpeechToTextEventUtilityService } from './speech-to-text-event-utility.service';

describe('SpeechToTextEventUtilityService', () => {
  let service: SpeechToTextEventUtilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpeechToTextEventUtilityService],
    }).compile();

    service = module.get<SpeechToTextEventUtilityService>(SpeechToTextEventUtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
