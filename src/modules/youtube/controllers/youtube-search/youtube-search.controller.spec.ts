import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeSearchController } from './youtube-search.controller';

describe('YoutubeSearch Controller', () => {
  let controller: YoutubeSearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YoutubeSearchController],
    }).compile();

    controller = module.get<YoutubeSearchController>(YoutubeSearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
