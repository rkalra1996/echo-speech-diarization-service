import { Injectable } from '@nestjs/common';
import { GoogleSpeechToTextCoreService } from './../../../speech-to-text/services/google-speech-to-text-core/google-speech-to-text-core.service';

@Injectable()
export class WebhooksHandlerService {

    constructor(private readonly S2T: GoogleSpeechToTextCoreService) {}

    handleWebhookEvent(requestBody) {
        return new Promise((res, rej) => {
            const fileInfo = this.getFileInfo(requestBody);
            console.log(fileInfo);
            // call the speech to text api to start translation
            this.S2T.autoInitiate().then(started => {
                res();
            });
        });
    }

    getFileInfo(fileData) {
        const fileInfoArray = fileData['name'].split('/');
        const bucketname = fileData['bucket'];
        const filename = fileInfoArray[1];
        const gsURI = fileData['mediaURI'];
        const mediaSize = fileData['size'];
        const uploadedOn = fileData['timeCreated'];
        const modifiedOn = fileData['updated'];
        return {
            bucketname,
            filename,
            gsURI,
            mediaSize,
            uploadedOn,
            modifiedOn,
        };
    }
}
