import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { GcloudTokenProviderService } from '../../../automate-access-token/services/gcloud-token-provider/gcloud-token-provider.service';

@Injectable()
export class GoogleSentimentAnalysisUtilityService {

    constructor(
        private tokenProvider: GcloudTokenProviderService,
        ) {}

        checkIfFileExists(filePath) {
            return fs.existsSync(filePath);
        }

        getFileData(filePath) {
            return fs.readFileSync(filePath, { encoding: 'utf-8' });
        }

        writeSentimentToFileData(filePath, fileData) {
            // console.log('Data :::::::: ' , fileData);
            // console.log(typeof fileData);
            fs.writeFileSync(filePath, JSON.stringify({data: fileData.data}), { encoding: 'utf-8' });
        }

        getGoogleSentimentAnaysisRequestData(speechData) {
            const googleSentimentAnalysisEndpoint = 'https://language.googleapis.com/v1/documents:analyzeSentiment';
            const newToken = this.tokenProvider.process_token;
            const DEFAULT_AUTHORIZATION = 'Bearer ' + newToken;
            const data = {encodingType: 'UTF8' , document: {type: 'PLAIN_TEXT', content: speechData}};
            //   console.log('Data : ', data);
            const requestConfig = {
                headers: {
                    post: {
                        'Authorization': DEFAULT_AUTHORIZATION,
                        'Content-Type': 'application/json',
                    },
                },
            };

            return {
                url: googleSentimentAnalysisEndpoint, data, requestConfig,
            };
        }
}
