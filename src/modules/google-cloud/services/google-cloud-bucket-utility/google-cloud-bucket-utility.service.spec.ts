import { Test, TestingModule } from '@nestjs/testing';
import { GoogleCloudBucketUtilityService } from './google-cloud-bucket-utility.service';

describe('GoogleCloudBucketUtilityService', () => {
  let service: GoogleCloudBucketUtilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleCloudBucketUtilityService],
    }).compile();

    service = module.get<GoogleCloudBucketUtilityService>(GoogleCloudBucketUtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
