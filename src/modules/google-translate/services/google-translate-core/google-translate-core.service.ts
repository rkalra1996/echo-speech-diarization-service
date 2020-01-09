import { Injectable } from '@nestjs/common';
import { GoogleTranslateUtilityService } from './../google-translate-utility/google-translate-utility.service';

@Injectable()
export class GoogleTranslateCoreService {

    constructor(private gtuSrvc: GoogleTranslateUtilityService) {}

    async initiate(data) {
        // check if we need to send it to data type translator or file type translater
        if (data.hasOwnProperty('parent_folder')) {
            // get the path of the file to translate
            this.gtuSrvc.handleParentFolderRequest(data.parent_folder);
            return {ok: true, message: 'translation process has started successfully'};

        } else if (data.hasOwnProperty('data')) {
            return await this.gtuSrvc.handleDataRequest(data);
        }
    }
}
