import { Injectable, HttpService } from '@nestjs/common';
import { GoogleSentimentAnalysisUtilityService } from '../google-sentiment-analysis-utility/google-sentiment-analysis-utility.service';
import { AccessTokenGeneratorService } from '../../../automate-access-token/services/access-token-generator/access-token-generator.service';
import { DatabseCommonService } from '../../../read-db/services/database-common-service/databse-common/databse-common.service';
import { GoogleCloudEventHandlerService } from '../../event-handler/google-cloud-event-handler/google-cloud-event-handler.service';

@Injectable()
export class GoogleSentimentAnalysisCoreService {

    constructor(
        private gsauSrvc: GoogleSentimentAnalysisUtilityService,
        private httpSrvc: HttpService,
        private atgSrvc: AccessTokenGeneratorService,
        private dbCSrvc: DatabseCommonService,
        private emitter: GoogleCloudEventHandlerService,
    ) { }

    validateBodyForSentimentAnalysis(requestBody): boolean {
        let isValid = false;
        if (!requestBody || !Object.keys(requestBody).length) {
            console.log('auto sentiment analysis initiated');
            isValid = true;
        } else if (requestBody && requestBody.constructor === Object) {
            if (Object.keys(requestBody).length > 0) {
                if (Object.keys(requestBody).indexOf('data') > -1 && requestBody.data.length > 0) {
                    console.log('body is validated');
                    isValid = true;
                } else if (
                    (Object.keys(requestBody).indexOf('filePath') > -1 && requestBody.filePath) || 
                    (Object.keys(requestBody).indexOf('parent_folder') > -1 && requestBody.parent_folder)
                ) {
                    console.log('body is validated');
                    isValid = true;
                } else {
                    console.log('Failed to validate body. Please provide data or a filePath');
                }
            } else {
                console.error('body is empty. Please provide the request parameters.');
                isValid = false;
            }
        } else {
            console.error('request body is not of type object');
            isValid = false;
        }
        return isValid;
    }

    async initiateAnalysis(data, filePath, dirType= 'path'): Promise<object> {
        let fileData;
        if (dirType === 'data' && data) {
            // raw data is provided, directly proceed with it
            if (this.gsauSrvc.validateDataObject(data)) {
                fileData = data;
            } else {
                return {ok: false, error: 'data object is not valid', status: 400};
            }
        } else if (dirType === 'dir' || dirType === 'path') {

            if (dirType === 'dir') {
                console.log('inside dir type');
                // if parent_folder key is supplied
                filePath = this.dbCSrvc.getSpeechToTextSourcePath(filePath);
            }
            // check for the path
            const checkFilePath = this.gsauSrvc.checkIfFileExists(filePath);

            if (!checkFilePath) {
                return Promise.resolve({ error: 'No such file / folder exists', status: 400 });
            }
            fileData = this.gsauSrvc.getFileData(filePath);
            if (fileData.constructor === String) {
                fileData = JSON.parse(fileData);
            }
            return this.handleMultipleRequestsForTypeFile(fileData, filePath);
        }
        return this.handleMultipleRequests(fileData);
    }

    async handleMultipleRequests(fileData): Promise<any> {

        const sentimentAnalysisPromises = [{}];
        for (const dataEach of fileData) {
            const speechData = Object.entries(dataEach)[0][1];
            console.log('Speech Data : ' + speechData);
            let speeckDataCombined ;
            if (Array.isArray(speechData)) {
            console.log('initital speech data ', speechData);
            const cleanedSpeechData = speechData.map(sentence => {
                sentence = sentence.trim()[0].toUpperCase() + sentence.trim().slice(1);
                return sentence;
            });
            speeckDataCombined = cleanedSpeechData.join('. ');
            } else {
                console.log('Speech Data Not an array : ' + speechData);
            }
            const resp = await this.startSentimentAnalysisProcess(speeckDataCombined);
            if (resp) {
                const keyName = Object.keys(dataEach)[0];
                console.log('keyname is ', keyName);
                const dataObj = {};
                dataObj[keyName] = resp.data;
                sentimentAnalysisPromises[0][keyName] = resp.data;
            }
        }
        console.log('recieved response from Google Sentiment Analysis.', new Date().toTimeString());
        console.log('Response : ');
        console.log(sentimentAnalysisPromises);
        return Promise.resolve({ ok: true, message: 'Perform Sentiment Analysis. Process started successfully.', response: sentimentAnalysisPromises });

    }

    async handleMultipleRequestsForTypeFile(fileData, filePath, auto = false, fileObjDetails?: object): Promise<any> {

        const sentimentAnalysisPromises = [];
        for (const dataEach of fileData['data']) {
            let speechData;
            if (dataEach['diarized_data']['response'].hasOwnProperty('results_en')) {
                console.log('detected translated results');
                // create the combined transcript from new translated data
                speechData = this.gsauSrvc.getTranslatedCombinedTranscriptData(dataEach);
                speechData = speechData['transcript'];
            } else {
                speechData = dataEach['transcript'];
            }
            if (speechData && speechData['combined_transcript']) {
            sentimentAnalysisPromises.push(this.startSentimentAnalysisProcess(speechData['combined_transcript']));
            } else {
                sentimentAnalysisPromises.push(Promise.resolve({data: null}));
            }
        }
        Promise.all(sentimentAnalysisPromises)
            .then((res: any) => {
                console.log('recieved response from Google Sentiment Analysis.', new Date().toTimeString());
                for (let i = 0; i < fileData['data'].length; i++) {
                    // console.log('Response from Sentiment Analysis : ' + JSON.stringify(res[i].data));
                    fileData.data[i]['sentiment'] = res[i].data;
                }
                this.gsauSrvc.writeSentimentToFileData(filePath, fileData);
                if (auto) {
                    this.emitter.triggerEvent('INITIATE_PROCESS_UPDATION', {filePath, fileObjDetails});
                }
            })
            .catch(err => {
                console.log('recieved error from Google Sentiment Analysis. ', new Date().toTimeString());
                console.log(err);
            });
        return Promise.resolve({ ok: true, message: 'Perform Sentiment Analysis. Process started successfully.' });
    }

    async startSentimentAnalysisProcess(speechData) {
        console.log('recieved startSentimentAnalysisProcess request at ', new Date().toTimeString());
        const requestDetails = this.gsauSrvc.getGoogleSentimentAnaysisRequestData(speechData);
        if (!!requestDetails) {
            console.log('request details created as ', requestDetails);
            return this.performSentimentAnalysis(requestDetails)
                .catch(async err => {
                    console.log('some error occured while hitting api, going inside refresh block');
                    console.log(err.toJSON());
                    if (err.response.status.toString() === '401' || err.response.code.toString() === '401') {
                        console.log('token has expired, refreshing the token');
                        console.log('sending refresh code request at ', new Date().toTimeString());
                        const isRefreshed = await this.atgSrvc.refreshAuthKey();
                        if (isRefreshed) {
                            console.log('sending handleRequest request at ', new Date().toTimeString());
                            return this.startSentimentAnalysisProcess(speechData);
                        } else {
                            console.log('unable to refresh auth key for gcloud, check manually');
                            return new Error('Unable to refresh the Google Auth Token. Try again later');
                        }
                    }
                });
        }
    }

    performSentimentAnalysis(requestDetails): Promise<any> {
        console.log('sending request to start the Sentiment Analysis ', new Date().toTimeString());
        return this.httpSrvc.post(requestDetails.url, requestDetails.data, requestDetails.requestConfig).toPromise();
    }

    async autoInitiate() {
        if (!this.dbCSrvc.isYTDirectoryPresent('Sentiment_Analysis')) {
            if (this.dbCSrvc.creteNewFolderInYTD_DB('Sentiment_Analysis')) {
                console.log('dir Sentiment_Analysis created');
            } else {
                throw new Error('An error occured while creating directory Sentiment_Analysis');
            }
        }
        const jsonFilesToProcess = this.dbCSrvc.readYTDFolderDetails('json', 'Google_Speech_To_Text');
        if (jsonFilesToProcess.length > 0) {
            const response = await this.gsauSrvc.processJSONFiles(jsonFilesToProcess);
            if (response['ok']) {
                console.log('Processing of json files for sentiment analysis has started successfully');
                return {ok: true};
            } else {
                return {ok: false, error: 'Could not start the Sentiment Analysis process, process ABORTED'};
            }
        } else {
            console.log('No files to process inside Google_Speech_To_Text');
            return {ok: true};
        }
    }

}
