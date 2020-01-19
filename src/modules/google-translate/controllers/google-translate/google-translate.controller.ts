import { Controller, Post, Body, Res } from '@nestjs/common';
import { GoogleTranslateUtilityService } from './../../services/google-translate-utility/google-translate-utility.service';
import { GoogleTranslateCoreService } from './../../services/google-translate-core/google-translate-core.service';

@Controller('google-translate')
export class GoogleTranslateController {

    constructor(private gtcSrvc: GoogleTranslateCoreService, private gtuSrvc: GoogleTranslateUtilityService) {}

    @Post('')
    async GoogleTranslateHandler(@Body() requestBody, @Res() res): Promise<any> {
        console.log('POST /google-translate/');
        if (this.gtuSrvc.validateRequestBody(requestBody)) {
            let response;
            if (!requestBody || !Object.keys(requestBody).length) {
                response = await this.gtcSrvc.autoInitiate();
            } else {
                response = await this.gtcSrvc.initiate(requestBody);
            }
            console.log('recieved');
            if (response['ok']) {
                return res.status(200).send({ok: true, message: response['message']});
            } else {
                return res.status(response['status'] || 500).send({status: response['status'] || 500, error: response['error'] || 'An internal error occured, try again later'});
            }
        } else {
            console.log('body invalid');
            res.status(400).send({status: 400, error: 'Body is not valid'});
        }
    }
}
