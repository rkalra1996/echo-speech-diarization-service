import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeDlCoreService } from './youtube-dl-core.service';

describe('YoutubeDlCoreService', () => {
  let service: YoutubeDlCoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YoutubeDlCoreService],
    }).compile();

    service = module.get<YoutubeDlCoreService>(YoutubeDlCoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
