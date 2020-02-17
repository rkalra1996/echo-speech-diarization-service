import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { GcloudTokenProviderService } from '../../../automate-access-token/services/gcloud-token-provider/gcloud-token-provider.service';
import { DatabseCommonService } from '../../../read-db/services/database-common-service/databse-common/databse-common.service';
import { GoogleCloudEventHandlerService } from '../../event-handler/google-cloud-event-handler/google-cloud-event-handler.service';

@Injectable()
export class GoogleSentimentAnalysisUtilityService {

    constructor(
        private tokenProvider: GcloudTokenProviderService,
        private dbcSrvc: DatabseCommonService,
        private emitter: GoogleCloudEventHandlerService,
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

        getTranslatedCombinedTranscriptData(dataObj) {
            console.log('dataObj is ', dataObj);
            const finalData = {
                transcript: {
                    combined_transcript: '',
                },
            };
            const transArray = [];
            dataObj.diarized_data.response.results_en.forEach(transcriptObj => {
                // replacing ascii code representation of ' with original '
                transArray.push(transcriptObj.alternatives[0].transcript);
            });
            console.log('trans array looks like ', transArray);
            finalData.transcript.combined_transcript = transArray.join(' ');
            console.log('finalData looks like ', finalData);
            return finalData;
        }

        processJSONFiles(jsonFilesToProcess, triggerPipeline = false) {
            return new Promise((resolve, reject) => {
                jsonFilesToProcess.forEach(jsonFile => {
                    const fileName = jsonFile.split('.json')[0];
                    const filePath = path.resolve(this.dbcSrvc.YOUTUBE_DL_DB_URL, 'Google_Speech_To_Text', fileName, jsonFile);
                    const fileData = {fileDetails: {}};
                    fileData.fileDetails['filePath'] = filePath;
                    fileData.fileDetails['fileName'] = fileName;
                    const fileDataString = this.getFileData(filePath);
                    fileData['fileData'] = JSON.parse(fileDataString);
                    // trigger event to start analysis
                    this.emitter.triggerEvent('START_SENTIMENT_ANALYSIS', fileData, triggerPipeline);
                });
                resolve({ok: true});
            });
        }
}
