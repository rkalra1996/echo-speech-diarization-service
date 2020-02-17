import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksHandlerService } from './webhooks-handler.service';

describe('WebhooksHandlerService', () => {
  let service: WebhooksHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebhooksHandlerService],
    }).compile();

    service = module.get<WebhooksHandlerService>(WebhooksHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
