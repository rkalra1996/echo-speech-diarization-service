import { Controller, Post, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import { YoutubeDlCoreService } from './../../services/youtube-dl-core/youtube-dl-core.service';
import { YoutubeDlUtilityService } from '../../services/youtube-dl-utility/youtube-dl-utility.service';

@Controller('youtube-dl')
export class YoutubeDlController {

    constructor(private ydlUtilitySrvc: YoutubeDlUtilityService, private ydlCoreSrvc: YoutubeDlCoreService) {}

    @Post('data/post')
    @UseInterceptors(FileInterceptor('resource_file'))
    async readPostData(@Res() response: any, @UploadedFile() file): Promise<any> {
        console.log('/youtube-dl/post/data hit');

        const fileObject = this.ydlUtilitySrvc.getFileObject(file);
        console.log(fileObject);
        if (Array.isArray(fileObject.data)) {
            // send the file object with data to youtube-dl processor
            this.ydlCoreSrvc.initiate(fileObject);
            response.status(200).send({response: 'ok', message: `Corpus generation process started for ${fileObject.data.length} urls`});
        } else {
            response.status(400).send({status: 400, error: `Empty file cannot be read`});
        }
    }
}
