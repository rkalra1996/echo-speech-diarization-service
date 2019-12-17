import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeDlController } from './youtube-dl.controller';

describe('YoutubeDl Controller', () => {
  let controller: YoutubeDlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YoutubeDlController],
    }).compile();

    controller = module.get<YoutubeDlController>(YoutubeDlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
