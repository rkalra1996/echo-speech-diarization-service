import { Test, TestingModule } from '@nestjs/testing';
import { WordCloudGeneratorService } from './word-cloud-generator.service';

describe('WordCloudGeneratorService', () => {
  let service: WordCloudGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WordCloudGeneratorService],
    }).compile();

    service = module.get<WordCloudGeneratorService>(WordCloudGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
