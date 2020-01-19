import { Test, TestingModule } from '@nestjs/testing';
import { GoogleCloudEventUtilityService } from './google-cloud-event-utility.service';

describe('GoogleCloudEventUtilityService', () => {
  let service: GoogleCloudEventUtilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleCloudEventUtilityService],
    }).compile();

    service = module.get<GoogleCloudEventUtilityService>(GoogleCloudEventUtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
