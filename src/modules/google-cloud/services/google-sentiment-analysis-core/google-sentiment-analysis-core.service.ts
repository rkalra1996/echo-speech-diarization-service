import { Injectable, HttpService } from '@nestjs/common';
import { GoogleSentimentAnalysisUtilityService } from '../google-sentiment-analysis-utility/google-sentiment-analysis-utility.service';
import { AccessTokenGeneratorService } from '../../../automate-access-token/services/access-token-generator/access-token-generator.service';

@Injectable()
export class GoogleSentimentAnalysisCoreService {

    constructor(
        private gsauSrvc: GoogleSentimentAnalysisUtilityService,
        private httpSrvc: HttpService,
        private atgSrvc: AccessTokenGeneratorService,
    ) { }

    validateBodyForSentimentAnalysis(requestBody): boolean {
        let isValid = false;
        if (requestBody && requestBody.constructor === Object) {
            if (Object.keys(requestBody).length > 0) {
                if (Object.keys(requestBody).indexOf('data') > -1 && requestBody.data.length > 0) {
                    console.log('body is validated');
                    isValid = true;
                } else if (Object.keys(requestBody).indexOf('filePath') > -1 && requestBody.filePath) {
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

    async initiateAnalysis(data, filePath): Promise<object> {

        if (data) {
            console.log('Raw data is not supported. Please provide a json file path.');
        }
        const checkFilePath = this.gsauSrvc.checkIfFileExists(filePath);

        if (!checkFilePath) {
            return Promise.resolve({ error: 'No such file exists at path : ' + filePath, status: 400 });
        }
        const fileData = this.gsauSrvc.getFileData(filePath);
        // console.log(fileData);
        return this.handleMultipleRequests(JSON.parse(fileData), filePath);
    }

    async handleMultipleRequests(fileData, filePath): Promise<any> {

        const sentimentAnalysisPromises = [];
        for (const dataEach of fileData['data']) {
            // const speechToTextResponseData = dataEach.diarized_data.response.results;
            // const checkSentimentIfPresent = speechToTextResponseData[speechToTextResponseData.length - 1];
            // let speechToTextLastData;
            // if (checkSentimentIfPresent.documentSentiment) {
            //     speechToTextLastData = speechToTextResponseData[speechToTextResponseData.length - 2];
            // } else {
            //     speechToTextLastData = speechToTextResponseData[speechToTextResponseData.length - 1];
            // }
            const speechData = dataEach.transcript.combined_transcript;
            console.log('Speech Data : ' + speechData);
            sentimentAnalysisPromises.push(this.startSentimentAnalysisProcess(speechData));
        }
        Promise.all(sentimentAnalysisPromises)
            .then((res: any) => {
                console.log('recieved response from Google Sentiment Analysis.', new Date().toTimeString());
                // console.log('Data :::::::: ' , JSON.stringify(fileData));
                for (let i = 0; i < fileData['data'].length; i++) {
                    // console.log('Res : ' + JSON.stringify(res[i]));
                    // console.log('Res : ' + res[i].data);
                    console.log('Response from Sentiment Analysis : ' + JSON.stringify(res[i].data));
                    // const results = fileData.data[i].diarized_data.response.results;
                    // const checkSentimentIfPresent = results[results.length - 1];
                    fileData.data[i]['sentiment'] = res[i].data;
                    // if (checkSentimentIfPresent.documentSentiment) {
                    //     fileData.data[i].diarized_data.response.results[results.length - 1] = res[i].data;
                    //  } else {
                    //      fileData.data[i].diarized_data.response.results.push(res[i].data);
                    //  }
                }
                this.gsauSrvc.writeSentimentToFileData(filePath, fileData);
                // return Promise.resolve({response: {message: `Process completed successfully`, data: {name: res.name, id: res.id}}});
            })
            .catch(err => {
                console.log('recieved error from Google Sentiment Analysis. ', new Date().toTimeString());
                console.log(err);
                // return Promise.resolve({error: err.message, status: err.code});
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
                    if (err.response.status === '401' || err.response.code === '401') {
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
        // this.httpSrvc.post(requestDetails.url, requestDetails.data, requestDetails.requestConfig).toPromise()
        // .then((res) => {
        //     console.log(res, 'response fromsentianalysis');
        // }).catch((err) => {
        //     console.log('error caught from promise', err)
        // });
        return this.httpSrvc.post(requestDetails.url, requestDetails.data, requestDetails.requestConfig).toPromise();
    }

}
