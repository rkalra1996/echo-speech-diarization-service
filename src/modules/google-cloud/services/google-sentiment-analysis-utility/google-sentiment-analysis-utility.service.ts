import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { GcloudTokenProviderService } from '../../../automate-access-token/services/gcloud-token-provider/gcloud-token-provider.service';
import e = require('express');

@Injectable()
export class GoogleSentimentAnalysisUtilityService {

    constructor(
        private tokenProvider: GcloudTokenProviderService,
        ) {}

        checkIfFileExists(filePath) {
            try {
                return fs.existsSync(filePath);
            } catch (e) {
                console.log('Catched error while checking file path', e);
                return false;
            }
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

        /**
         * Validates data object, The object must contain an array of objects with atleast one element
         * @param dataToValidate
         * @returns  true if valid
         */
        validateDataObject(dataToValidate) {
            let isValid = false;
            if (dataToValidate) {
                if (Array.isArray(dataToValidate) && dataToValidate.length > 0) {
                    // check only the first entry type , assuming rest will be same
                    if (dataToValidate[0] && (dataToValidate[0].constructor === Object)) {
                        console.log('data is valid');
                        isValid = true;
                    } else {
                        console.log('type of array elements inside data key is not object');
                    }
                } else {
                    console.log('data key is not of type array of is empty array');
                }
            } else {
                console.log('data object does not contain data key');
            }
            return isValid;
        }
}
