import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeSearchCoreService } from './youtube-search-core.service';

describe('YoutubeSearchCoreService', () => {
  let service: YoutubeSearchCoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YoutubeSearchCoreService],
    }).compile();

    service = module.get<YoutubeSearchCoreService>(YoutubeSearchCoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
