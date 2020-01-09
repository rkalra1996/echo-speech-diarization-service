import { Test, TestingModule } from '@nestjs/testing';
import { GoogleTranslateController } from './google-translate.controller';

describe('GoogleTranslate Controller', () => {
  let controller: GoogleTranslateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleTranslateController],
    }).compile();

    controller = module.get<GoogleTranslateController>(GoogleTranslateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
