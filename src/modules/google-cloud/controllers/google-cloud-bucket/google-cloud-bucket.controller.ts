import { Controller, Post, Body, Res } from '@nestjs/common';
import { GoogleCloudBucketCoreService } from '../../services/google-cloud-bucket-core/google-cloud-bucket-core.service';

@Controller('google-cloud')
export class GoogleCloudBucketController {

    constructor(private GCBCsrvc: GoogleCloudBucketCoreService) {}

    @Post('bucket/upload')
    async processGoogleSpeechToText(@Body() requestbody, @Res() res): Promise<any> {
        console.log('/google-cloud/bucket/upload POST hit');
        if (this.GCBCsrvc.validateBodyForBuketFileUpload(requestbody)) {
            let response;
            if (requestbody.hasOwnProperty('parent_folder')) {
                response = await this.GCBCsrvc.initiateUpload(requestbody.parent_folder, requestbody.filePaths, requestbody.folderName, requestbody.bucketName, 'dir');
            } else {
                response = await this.GCBCsrvc.initiateUpload(requestbody.folderPath, requestbody.filePaths, requestbody.folderName, requestbody.bucketName);

            }
            if (response['ok']) {
                res.status(200).send({status: 200, message: `Uploading files to the Google Storage Bucket. Process started successfully.`});
            } else {
                res.status(500).send({status: response['status'] || 500, message: response['error']});
            }
        } else {
            res.status(400).send({status: 400, message: 'request body is not valid'});
        }
    }

    @Post('bucket/public')
    async processGoogle(@Body() requestbody, @Res() res): Promise<any> {
        console.log('/google-cloud/bucket/public POST hit');
        if (this.GCBCsrvc.validateBodyForBuketPublic(requestbody)) {
            const response = await this.GCBCsrvc.initiatePublicAccess(requestbody.bucketName, requestbody.objectNames);
            if (response['ok']) {
                res.status(200).send({status: 200, message: `Uploading files to the Google Storage Bucket. Process started successfully.`});
            } else {
                res.status(500).send({status: response['status'] || 500, message: response['error']});
            }
        } else {
            res.status(400).send({status: 400, message: 'request body is not valid'});
        }
    }
}
