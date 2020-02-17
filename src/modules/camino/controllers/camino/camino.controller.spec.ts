import { Test, TestingModule } from '@nestjs/testing';
import { CaminoController } from './camino.controller';

describe('Camino Controller', () => {
  let controller: CaminoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaminoController],
    }).compile();

    controller = module.get<CaminoController>(CaminoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
