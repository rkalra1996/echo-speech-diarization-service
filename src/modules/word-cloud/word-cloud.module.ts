import { Module } from '@nestjs/common';
import { WordCloudController } from './controllers/word-cloud/word-cloud.controller';
import { WordCloudGeneratorService } from './services/word-cloud-generator-service/word-cloud-generator.service';

@Module({
    controllers: [WordCloudController],
    providers: [WordCloudGeneratorService],
})
export class WordCloudModule {}
