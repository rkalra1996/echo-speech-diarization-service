import { Test, TestingModule } from '@nestjs/testing';
import { KeyphrasePythonService } from './keyphrase-python.service';

describe('KeyphrasePythonService', () => {
  let service: KeyphrasePythonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeyphrasePythonService],
    }).compile();

    service = module.get<KeyphrasePythonService>(KeyphrasePythonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
