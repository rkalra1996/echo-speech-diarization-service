import { Test, TestingModule } from '@nestjs/testing';
import { GoogleSentimentAnalysisController } from './google-sentiment-analysis.controller';

describe('GoogleSentimentAnalysis Controller', () => {
  let controller: GoogleSentimentAnalysisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleSentimentAnalysisController],
    }).compile();

    controller = module.get<GoogleSentimentAnalysisController>(GoogleSentimentAnalysisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
