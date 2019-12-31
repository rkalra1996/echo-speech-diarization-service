import { Controller, Post, Body, Res } from '@nestjs/common';
import { GoogleSpeechToTextCoreService } from '../../services/google-speech-to-text-core/google-speech-to-text-core.service';

@Controller('google-speech-to-text')
export class GoogleSpeechToTextController {

    constructor(private GS2TCsrvc: GoogleSpeechToTextCoreService) {}

    @Post('v1')
    async processGoogleSpeechToText(@Body() requestbody, @Res() res): Promise<any> {
        console.log('/google-speech-to-text/v1 POST hit');
        if (this.GS2TCsrvc.validateBodyForSpeech2Text(requestbody)) {
            let response;
            if (requestbody.hasOwnProperty('parent_folder')) {
                response = await this.GS2TCsrvc.initiate(requestbody.parent_folder, requestbody.uris, requestbody.resource_file, 'dir');
            } else {
                response = await this.GS2TCsrvc.initiate(requestbody.filePath, requestbody.uris, requestbody.resource_file);
            }
            if (response['ok']) {
                res.status(200).send({status: 200, message: `Your process id is same as your resource_file key`, data: {process_id: requestbody.resource_file}});
            } else {
                res.status(500).send({status: 500, message: 'Something went wrong in the server, contact later!'});
            }
        } else {
            res.status(400).send({status: 400, message: 'request body is not valid'});
        }
    }
}
