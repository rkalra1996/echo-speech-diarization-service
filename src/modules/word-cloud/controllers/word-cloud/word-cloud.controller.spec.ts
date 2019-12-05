import { Test, TestingModule } from '@nestjs/testing';
import { WordCloudController } from './word-cloud.controller';

describe('WordCloud Controller', () => {
  let controller: WordCloudController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WordCloudController],
    }).compile();

    controller = module.get<WordCloudController>(WordCloudController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
