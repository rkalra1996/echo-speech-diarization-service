import { Test, TestingModule } from '@nestjs/testing';
import { GoogleSentimentAnalysisCoreService } from './google-sentiment-analysis-core.service';

describe('GoogleSentimentAnalysisCoreService', () => {
  let service: GoogleSentimentAnalysisCoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleSentimentAnalysisCoreService],
    }).compile();

    service = module.get<GoogleSentimentAnalysisCoreService>(GoogleSentimentAnalysisCoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
