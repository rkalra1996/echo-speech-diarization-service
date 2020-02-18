import { Injectable } from '@nestjs/common';
import { GoogleSpeechToTextCoreService } from './../../../speech-to-text/services/google-speech-to-text-core/google-speech-to-text-core.service';
import { StatusService } from './../../../../services/shared/status/status.service';

@Injectable()
export class WebhooksHandlerService {

    constructor(
        private readonly S2T: GoogleSpeechToTextCoreService,
        private readonly statusSrvc: StatusService) {}

    handleWebhookEvent(requestBody) {
        return new Promise((res, rej) => {
            const fileInfo = this.getFileInfo(requestBody);
            console.log('fileinfo to set status in status db is ');
            console.log(fileInfo);
            // call the speech to text api to start translation
            // update the status in status DB
            this.statusSrvc.updateStatus(fileInfo.filename, 1);
            this.S2T.autoInitiate(true)
            .then(started => {
                res();
            }).catch(initiateErr => {
                console.log('Error while initiating s2t');
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
