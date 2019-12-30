import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeSearchUtilityService } from './youtube-search-utility.service';

describe('YoutubeSearchUtilityService', () => {
  let service: YoutubeSearchUtilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YoutubeSearchUtilityService],
    }).compile();

    service = module.get<YoutubeSearchUtilityService>(YoutubeSearchUtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
