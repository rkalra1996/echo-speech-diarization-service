import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeDlUtilityService } from './youtube-dl-utility.service';

describe('YoutubeDlUtilityService', () => {
  let service: YoutubeDlUtilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YoutubeDlUtilityService],
    }).compile();

    service = module.get<YoutubeDlUtilityService>(YoutubeDlUtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
