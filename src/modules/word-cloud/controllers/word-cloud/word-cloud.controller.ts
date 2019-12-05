import { Controller, Post, Body, Res } from '@nestjs/common';
import {Response} from 'express';
import { WordCloudGeneratorService } from '../../services/word-cloud-generator-service/word-cloud-generator.service';

@Controller('word-cloud')
export class WordCloudController {

    constructor(private wordCloudService: WordCloudGeneratorService) {}

    @Post('generate')
    async wordCloudGenerateHandler(@Body() requestBody, @Res() response: Response): Promise<any> {
        const image = await this.wordCloudService.drawWordCloud(requestBody);
        response.status(200).send({image});
    }
}
