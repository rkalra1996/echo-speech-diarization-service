import { Test, TestingModule } from '@nestjs/testing';
import { CaminoCoreService } from './camino-core.service';

describe('CaminoCoreService', () => {
  let service: CaminoCoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CaminoCoreService],
    }).compile();

    service = module.get<CaminoCoreService>(CaminoCoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
