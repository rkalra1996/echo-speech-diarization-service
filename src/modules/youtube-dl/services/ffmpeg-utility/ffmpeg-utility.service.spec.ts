import { Test, TestingModule } from '@nestjs/testing';
import { FfmpegUtilityService } from './ffmpeg-utility.service';

describe('FfmpegUtilityService', () => {
  let service: FfmpegUtilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FfmpegUtilityService],
    }).compile();

    service = module.get<FfmpegUtilityService>(FfmpegUtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
