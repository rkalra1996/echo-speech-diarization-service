import { Controller, Body, Res, Post } from '@nestjs/common';
import { GoogleSentimentAnalysisCoreService } from '../../services/google-sentiment-analysis-core/google-sentiment-analysis-core.service';

@Controller('google-sentiment')
export class GoogleSentimentAnalysisController {

    constructor(private GSACsrvc: GoogleSentimentAnalysisCoreService) {}

    @Post('v1/analyse')
    async processGoogleSpeechToText(@Body() requestbody, @Res() res): Promise<any> {
        console.log('/google-cloud/v1/analyze POST hit');
        if (this.GSACsrvc.validateBodyForSentimentAnalysis(requestbody)) {
            const response = await this.GSACsrvc.initiateAnalysis(requestbody.data, requestbody.filePath);
            if (response['ok']) {
                res.status(200).send({status: 200, message: `Sentiment analysis started successfully.`});
            } else {
                res.status(500).send({status: response['status'] || 500, message: response['error']});
            }
        } else {
            res.status(400).send({status: 400, message: 'request body is not valid'});
        }
    }
}