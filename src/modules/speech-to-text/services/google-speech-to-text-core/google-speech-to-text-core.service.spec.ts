import { Test, TestingModule } from '@nestjs/testing';
import { GoogleSpeechToTextCoreService } from './google-speech-to-text-core.service';

describe('GoogleSpeechToTextCoreService', () => {
  let service: GoogleSpeechToTextCoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleSpeechToTextCoreService],
    }).compile();

    service = module.get<GoogleSpeechToTextCoreService>(GoogleSpeechToTextCoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
