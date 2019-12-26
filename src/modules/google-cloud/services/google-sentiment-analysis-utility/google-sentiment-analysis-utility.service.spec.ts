import { Test, TestingModule } from '@nestjs/testing';
import { GoogleSentimentAnalysisUtilityService } from './google-sentiment-analysis-utility.service';

describe('GoogleSentimentAnalysisUtilityService', () => {
  let service: GoogleSentimentAnalysisUtilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleSentimentAnalysisUtilityService],
    }).compile();

    service = module.get<GoogleSentimentAnalysisUtilityService>(GoogleSentimentAnalysisUtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
