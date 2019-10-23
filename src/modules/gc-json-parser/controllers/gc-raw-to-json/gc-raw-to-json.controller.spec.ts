import { Test, TestingModule } from '@nestjs/testing';
import { GcRawToJsonController } from './gc-raw-to-json.controller';

describe('GcRawToJson Controller', () => {
  let controller: GcRawToJsonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GcRawToJsonController],
    }).compile();

    controller = module.get<GcRawToJsonController>(GcRawToJsonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
