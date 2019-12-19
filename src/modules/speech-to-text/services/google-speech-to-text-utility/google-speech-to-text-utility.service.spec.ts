import { Test, TestingModule } from '@nestjs/testing';
import { GoogleSpeechToTextUtilityService } from './google-speech-to-text-utility.service';

describe('GoogleSpeechToTextUtilityService', () => {
  let service: GoogleSpeechToTextUtilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleSpeechToTextUtilityService],
    }).compile();

    service = module.get<GoogleSpeechToTextUtilityService>(GoogleSpeechToTextUtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
