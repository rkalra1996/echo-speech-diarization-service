import { Controller, Post, UseInterceptors, Res, UploadedFiles, Get, Body, Param } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CaminoCoreService } from '../../services/camino-core/camino-core.service';
import { WebhooksHandlerService } from '../../services/webhooks-handler/webhooks-handler.service';

@Controller('camino')
export class CaminoController {
    constructor(
        private readonly caminoCoreSrvc: CaminoCoreService,
        private readonly webhhokHandler: WebhooksHandlerService,
        ) {}

    @Post('upload/feedback')
    @UseInterceptors(FilesInterceptor('feedback_files'))
    async startFeedbackRawDownload(@Res() res: any, @UploadedFiles() feedbackAudioFiles): Promise<any> {
        console.log('/camino/upload hit');
        const filesSaved = await this.caminoCoreSrvc.saveFilesToDB2(feedbackAudioFiles);
        if (filesSaved['ok']) {
            res.status(200).send({status: 200, message: 'Files have been saved, conversion process initiated as needed'});
        } else {
            console.log(filesSaved);
            res.status(filesSaved['status']).send({status: filesSaved['status'], error: filesSaved['error']});
        }
    }

    @Post('webhook/feedback-uploaded')
    async delegateWebhook(@Body() requestBody, @Res() response): Promise<any> {
        console.log('[WEBHOOK] camino/webhook/feedback-uploaded recieved');
        console.log(`${requestBody.bucket}/${requestBody.name}`);
        this.webhhokHandler.handleWebhookEvent(requestBody)
            .then(handlerResponse => {
                console.log('speech to text service has been started successfuly');
            })
            .catch(handlerError => {
                console.log('An Error occured while starting speech to text service', handlerError);
            });
        return response.status(200).send();
    }

}
