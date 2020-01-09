import { Test, TestingModule } from '@nestjs/testing';
import { GoogleTranslateCoreService } from './google-translate-core.service';

describe('GoogleTranslateCoreService', () => {
  let service: GoogleTranslateCoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleTranslateCoreService],
    }).compile();

    service = module.get<GoogleTranslateCoreService>(GoogleTranslateCoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
