import { Test, TestingModule } from '@nestjs/testing';
import { GoogleTranslateUtilityService } from './google-translate-utility.service';

describe('GoogleTranslateUtilityService', () => {
  let service: GoogleTranslateUtilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleTranslateUtilityService],
    }).compile();

    service = module.get<GoogleTranslateUtilityService>(GoogleTranslateUtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
