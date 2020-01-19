import { Test, TestingModule } from '@nestjs/testing';
import { GoogleCloudEventHandlerService } from './google-cloud-event-handler.service';

describe('GoogleCloudEventHandlerService', () => {
  let service: GoogleCloudEventHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleCloudEventHandlerService],
    }).compile();

    service = module.get<GoogleCloudEventHandlerService>(GoogleCloudEventHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
