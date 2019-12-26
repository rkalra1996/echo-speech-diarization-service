import { Test, TestingModule } from '@nestjs/testing';
import { GoogleCloudBucketController } from './google-cloud-bucket.controller';

describe('GoogleCloudBucket Controller', () => {
  let controller: GoogleCloudBucketController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleCloudBucketController],
    }).compile();

    controller = module.get<GoogleCloudBucketController>(GoogleCloudBucketController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
