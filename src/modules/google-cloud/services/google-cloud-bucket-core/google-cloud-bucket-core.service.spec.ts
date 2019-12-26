import { Test, TestingModule } from '@nestjs/testing';
import { GoogleCloudBucketCoreService } from './google-cloud-bucket-core.service';

describe('GoogleCloudBucketCoreService', () => {
  let service: GoogleCloudBucketCoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleCloudBucketCoreService],
    }).compile();

    service = module.get<GoogleCloudBucketCoreService>(GoogleCloudBucketCoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
