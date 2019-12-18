import { Controller, Post, Body, Res } from '@nestjs/common';
import { GoogleSpeechToTextCoreService } from '../../services/google-speech-to-text-core/google-speech-to-text-core.service';

@Controller('google-speech-to-text')
export class GoogleSpeechToTextController {

    constructor(private GS2TCsrvc: GoogleSpeechToTextCoreService) {}

    @Post('v1')
    async processGoogleSpeechToText(@Body() requestbody, @Res() res): Promise<any> {
        console.log('/google-speech-to-text/v1 POST hit');
        if (this.GS2TCsrvc.validateBodyForSpeech2Text(requestbody)) {
            const response = await this.GS2TCsrvc.initiate(requestbody.urls);
            if (response['ok']) {
                res.status(200).send({status: 200, data: 'Some data will be here'});
            } else {
                res.status(500).send({status: 500, message: 'Something went wrong in the server, contact later!'});
            }
        } else {
            res.status(400).send({status: 400, message: 'request body is not valid'});
        }
    }
}
