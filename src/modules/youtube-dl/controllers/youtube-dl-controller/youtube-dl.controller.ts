import { Controller, Post, Res, UseInterceptors, UploadedFile, Body, UploadedFiles } from '@nestjs/common';
import {FileInterceptor, FilesInterceptor} from '@nestjs/platform-express';
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
        } else if (file) {
            // read from file
            fileObject = this.ydlUtilitySrvc.getFileObject(file);
        } else {
            console.log('empty body code is executing');
            fileObject = null;
        }
        if (fileObject && Array.isArray(fileObject.data)) {
            // send the file object with data to youtube-dl processor
            this.ydlCoreSrvc.initiate(fileObject);
            response.status(200).send({response: 'ok', message: 'Corpus generation process started for ' + fileObject.data.length + ' urls'});
        } else if (fileObject === null) {
            // send the file object with data to youtube-dl processor
            this.ydlCoreSrvc.autoInitiate();
            response.status(200).send({response: 'ok', message: 'Corpus generation process started'});
        } else {
            response.status(400).send({status: 400, error: `Empty file cannot be read`});
        }
    }

    @Post('data/upload')
    @UseInterceptors(FilesInterceptor('audio_files'))
    async startRawDownload(@Res() res: any, @UploadedFiles() audioFiles): Promise<any> {
        console.log('/youtube-dl/data/upload hit');
        const filesSaved = await this.ydlCoreSrvc.saveFilesToDB(audioFiles);
        if (filesSaved['ok']) {
            res.status(200).send({status: 200, message: 'Files have been saved, conversion process initiated as needed'});
        } else {
            res.status(filesSaved['status']).send({status: filesSaved['status'], error: filesSaved['error']});
        }
    }

    @Post('v2/data/download')
    async downloadFilesFromSource(@Body() requestBody: object, @Res() response: any): Promise<any> {
        console.log('body recieved is ', requestBody);
        if (this.ydlUtilitySrvc.validateSourceURLRequest(requestBody)) {
            console.log('body is valid');
            const isStarted = await this.ydlCoreSrvc.saveFilesToDB(null, requestBody, 'body');
            if (isStarted['ok']) {
                return response.status(200).send({status: 200, message: 'Download process started successfully!'})
            } else {
                return response.status(isStarted['status']).send({status: isStarted['status'], error: isStarted['error']});
            }
        } else {
            return response.status(400).send({status: 400, error: 'Body is invalid!'})
        }
    }
}
