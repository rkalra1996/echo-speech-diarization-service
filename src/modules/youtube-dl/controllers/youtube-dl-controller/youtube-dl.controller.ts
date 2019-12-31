import { Controller, Post, Res, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import { YoutubeDlCoreService } from './../../services/youtube-dl-core/youtube-dl-core.service';
import { YoutubeDlUtilityService } from '../../services/youtube-dl-utility/youtube-dl-utility.service';

@Controller('youtube-dl')
export class YoutubeDlController {

    constructor(private ydlUtilitySrvc: YoutubeDlUtilityService, private ydlCoreSrvc: YoutubeDlCoreService) {}

    @Post('data/post')
    @UseInterceptors(FileInterceptor('resource_file'))
    async readPostData(@Res() response: any, @UploadedFile() file, @Body() requestBody): Promise<any> {
        console.log('/youtube-dl/post/data hit');
        let fileObject;
        if (requestBody && requestBody.hasOwnProperty('parent_folder') && typeof requestBody.parent_folder === 'string' && requestBody.parent_folder.length > 0) {
            // read the folder name from body and fetch the file
            fileObject = this.ydlUtilitySrvc.getFileObject(requestBody.parent_folder, 'path');
        } else {
            // read from file
            fileObject = this.ydlUtilitySrvc.getFileObject(file);
        }

        console.log(fileObject);
        if (Array.isArray(fileObject.data)) {
            // send the file object with data to youtube-dl processor
            this.ydlCoreSrvc.initiate(fileObject);
            response.status(200).send({response: 'ok', message: 'Corpus generation process started for ' + fileObject.data.length + ' urls'});
        } else {
            response.status(400).send({status: 400, error: `Empty file cannot be read`});
        }
    }
}
