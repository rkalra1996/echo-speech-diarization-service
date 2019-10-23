import { Test, TestingModule } from '@nestjs/testing';
import { GcRawService } from './gc-raw.service';

describe('GcRawService', () => {
  let service: GcRawService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GcRawService],
    }).compile();

    service = module.get<GcRawService>(GcRawService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
