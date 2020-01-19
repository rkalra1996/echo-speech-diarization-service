import { Injectable, HttpService } from '@nestjs/common';
import { GcloudTokenProviderService } from './../../../../modules/automate-access-token/services/gcloud-token-provider/gcloud-token-provider.service';
import { AccessTokenGeneratorService } from './../../../../modules/automate-access-token/services/access-token-generator/access-token-generator.service';
import { DiarizationSpeakerService } from './../../../google-speaker-diarization/services/diarization-speaker/diarization-speaker.service';
import { GcsBucketFetcherService } from '../../../google-speaker-diarization/services/gcs-bucket-fetcher/gcs-bucket-fetcher.service';
import { DatabseCommonService } from '../../../read-db/services/database-common-service/databse-common/databse-common.service';
import { GoogleSpeechToTextUtilityService } from '../google-speech-to-text-utility/google-speech-to-text-utility.service';
import { SpeechToTextEventHandlerService } from '../../event-handler/speech-to-text-event-handler/speech-to-text-event-handler.service';

@Injectable()
export class GoogleSpeechToTextCoreService {

    constructor(
        private tokenProvider: GcloudTokenProviderService,
        private httpSrvc: HttpService,
        private atgSrvc: AccessTokenGeneratorService,
        private diarizationSpkSrvc: DiarizationSpeakerService,
        private gcsbfSrvc: GcsBucketFetcherService,
        private databaseCommSrvc: DatabseCommonService,
        private gsttuSrvc: GoogleSpeechToTextUtilityService,
        private eventEmitter: SpeechToTextEventHandlerService,
    ) { }
    validateBodyForSpeech2Text(requestBody): boolean {
        let isValid = false;
        if (requestBody && requestBody.constructor === Object) {
            if (!requestBody || Object.keys(requestBody).length === 0) {
                console.log('empty body execution initiated');
                isValid = true;
            } else if (Object.keys(requestBody).length > 0 && Object.keys(requestBody).indexOf('uris') > -1) {
                if (Array.isArray(requestBody.uris) && requestBody.uris.length > 0) {
                    if (Object.keys(requestBody).indexOf('resource_file') > -1) {
                        console.log('body is validated');
                        isValid = true;
                    } else {
                        console.log('body does not contain a key named resource_file, cannot dump data without knowing the name');
                        isValid = false;
                    }
                } else {
                    console.error('Either url key is not of aray type or it is empty');
                    isValid = false;
                }
            } else if ((Object.keys(requestBody).indexOf('filePath') > -1 && requestBody.filePath) || (Object.keys(requestBody).indexOf('parent_folder') > -1 && requestBody.parent_folder)) {
                console.log('body is validated');
                isValid = true;
            } else {
                console.error('body object does not have a key named uris');
                isValid = false;
            }
        } else {
            console.error('request body is not of type object');
            isValid = false;
        }
        return isValid;
    }

    async startInititateCallback2(diarizationID) {

        const res = await this.diarizationSpkSrvc.checkStatusFromDiarizationID(diarizationID);
        if (res.hasOwnProperty('error')) {
                console.log(`\nAn error occured while reading status of diarization id ${diarizationID} . Error : ${res.error['message']} \n status : ${res.error['response'].status}`);
                return -1;
            } else {
                return this.checkStatusAndProceed2(res['resp'].data, diarizationID);
            }

    }

    checkStatusAndProceed2(response, diarizationID) {
        // to check if the status has changed from pending / progress to complete / error
        if (response.name === diarizationID) {
            if (response.metadata.hasOwnProperty('progressPercent')) {
                if (response.metadata.progressPercent.toString() === '100' && response.hasOwnProperty('done') && response.done ===  true) {
                    // call ahead
                    // global.clearInterval(globalIteratorID);
                    console.log('\ncompleted... for ', diarizationID);
                    return response;
                    // add logic
                    // this.sendTranscribedAudio(response, videoDetailsForVis);
                }
                console.log(`\nTotal ${response.metadata.progressPercent}% complete.... for ${diarizationID}`);
                return 0;
            } else {
                console.log('0% complete... for ', diarizationID);
                return 0;
            }
        }
    }

    async initiate(filePath, googleBucketWAVUris, parentFolderName?: string, dirType = 'path'): Promise<object> {
        // collect urls, check if they are of google-cloud bucket types
        // start making requests to google cloud apis, also keep refreshing token whenever needed
        // collect response of all the apis and then dump them into one json file with the parent name being the same name as the youtubeDL_db folder name
        const processCollectionArray = [];

        if (dirType === 'dir') {
            // folderPath cotaines name of the parent folder
            filePath = this.databaseCommSrvc.getbucketUrlsFile(filePath);
        }
        if (filePath) {
            console.log('file path is ', filePath);
            googleBucketWAVUris = this.gsttuSrvc.getGoogleBucketFileUris(filePath);
        }
        for (const url of googleBucketWAVUris) {
            const processIDResponse = await this.handleMultiFilesRequest(url);
            console.log('recieved response as ', processIDResponse);
            processCollectionArray.push({process_id: processIDResponse.response.data.process_id, source_url: url});
        }
        if (processCollectionArray.length !== googleBucketWAVUris.length) {
            // something went wrong
            console.log('something went wrong which hiiting google speech to text apis, check manually');
            return Promise.resolve({ok: false, error: 'something went wrong which hiiting google speech to text apis, check manually'});
        }
        this.trackDiarizationStatus(processCollectionArray, parentFolderName);
        return Promise.resolve({ok: true, message: 'Speech to text is now working'});
    }

    trackDiarizationStatus(allFilesData, parentFolderName?: string) {
        console.log('recieved data for polling', typeof allFilesData);
        console.log(allFilesData.length);
        // Create 1 object with iterator for Each ID'S status and Json response
        //
        const checkStatus = {};
        for (let i = 0; i < allFilesData.length; i++) {
            // tslint:disable-next-line: no-shadowed-variable
            ((thisRef, i, allFilesData) => {
                const diarizationProcessId = allFilesData[i].process_id;
                checkStatus[diarizationProcessId] = {
                    status: 0,
                };
                console.log('timestamp ->', new Date());
                checkStatus[diarizationProcessId]['intervalId'] = setInterval(() => {
                    thisRef.gcsbfSrvc.initiate2(diarizationProcessId).then((response) => {
                        console.log('Response : ' + response);
                        // thisRef.diarizationSpkSrvc.checkStatusFromDiarizationID(diarizationProcessId).then((response) => {
                        if (response === -1) {
                            console.log('\nAn error occured while reading status of diarization id : ' + diarizationProcessId);
                            // global.clearInterval(iterator[i]);
                            checkStatus[diarizationProcessId]['status'] = 2;
                        } else if (response === 0) {
                            // do nothing for now
                        } else {
                            checkStatus[diarizationProcessId]['status'] = 1;
                            allFilesData[i]['source_url'] = allFilesData[i].source_url;
                            allFilesData[i]['diarized_data'] = response;
                            console.log('AllFilesData : ', allFilesData);
                            global.clearInterval(checkStatus[diarizationProcessId]['intervalId']);

                            const diarizationIds = Object.keys(checkStatus);
                            let check = false;
                            // console.log(diarizationIds);
                            diarizationIds.forEach(element => {
                                const status = checkStatus[element]['status'];
                                // console.log('status : ',status);
                                if (status === 0) {
                                check = true;
                                }
                            });
                            console.log('Check : ', check);
                            console.log('Process Completed for ID : ', diarizationProcessId);
                            if (!check) {
                                if (parentFolderName) {
                                    console.log('calling dump data to corpus database');
                                    thisRef.dumpDataToCorpusDB(allFilesData, parentFolderName);
                                } else {
                                    this.eventEmitter.triggerEvent('WRITE_SPEECH_TO_TEXT_RESPONSE_FOR_FILE', allFilesData);
                                }
                            }
                        }
                    });
                }, 5000);

            })(this, i, allFilesData);

        }
    }

    getSpeechToTextRequestData(url) {
        const googleSpeechToTextEndpoint = ' https://speech.googleapis.com/v1p1beta1/speech:longrunningrecognize';
        const newToken = this.tokenProvider.process_token;
        const DEFAULT_AUTHORIZATION = 'Bearer ' + newToken;
        const data = {
            config: {
                encoding: 'LINEAR16',
                languageCode: 'en-US',
                model: 'default',
                alternativeLanguageCodes: ['hi-IN'],
                enableAutomaticPunctuation: true,
            },
            audio: {
                uri: url || null,
            },
        };

        const requestConfig = {
            headers: {
                post: {
                    'Authorization': DEFAULT_AUTHORIZATION,
                    'Content-Type': 'application/json',
                },
            },
        };

        return {
            url: googleSpeechToTextEndpoint, data, requestConfig,
        };
    }

    hitSpeechToTextApi(requestDetails): Promise<any> {
        console.log('sending initiate speech-2-text request at ', new Date().toTimeString());
        const Response = this.httpSrvc.post(requestDetails.url, requestDetails.data, requestDetails.requestConfig).toPromise()
        .then((response: any) => {
            console.log('recieved response from initiate speech-2-text request at ', new Date().toTimeString());
            // capture the current diarization id and go further
            return Promise.resolve({response: {message: `Process started successfully`, data: {process_id: response.data.name, audio_url: requestDetails.data.audio.uri}}});
        })
        .catch(err => {
            console.log('recieved error from initiate speech-2-text request at ', new Date().toTimeString());
            console.log({error_status: err.response.status, status_text: err.response.statusText});
            return Promise.resolve({error: err.message, status: err.response.status, message: err.response.message || ''});
        });
        return Response;
    }

    async handleMultiFilesRequest(url) {
        console.log('recieved handleRequest request at ', new Date().toTimeString());
        const requestDetails = this.getSpeechToTextRequestData(url);
        if (!!requestDetails) {
            console.log('request details created as ', requestDetails);
            // hit the official url and wait for response
            const diarizationIDResponse = await this.hitSpeechToTextApi(requestDetails);
            if (diarizationIDResponse.hasOwnProperty('error')) {
                // check for unauthorized access
                if (diarizationIDResponse.status.toString() === '401') {
                    console.log('token has expired, refreshing the token');
                    console.log('sending refresh code request at ', new Date().toTimeString());
                    const isRefreshed = await this.atgSrvc.refreshAuthKey();
                    if (isRefreshed) {
                        console.log('sending handleRequest request at ', new Date().toTimeString());
                        return this.handleMultiFilesRequest(url);
                    } else {
                        console.log('unable to refresh auth key for gcloud, check manually');
                    }
                }
            } else if (diarizationIDResponse.hasOwnProperty('response')) {
                return diarizationIDResponse;
            }
        }

    }

    async dumpDataToCorpusDB(dataToConsume, parentFolderName?: string) {
       const parsedData = this.gsttuSrvc.parseDataForCorpusDB(dataToConsume, parentFolderName);
       const writeRes = [];
       writeRes.push(this.databaseCommSrvc.writeFileToyoutubeDLdb(parsedData));
    //    writeRes.push(this.databaseCommSrvc.writeTextFileToyoutubeDLdb(parsedData));

       Promise.all(writeRes).then((res) => {
       if (res[0]['ok'] && res[0]['ok']) {
           console.log('success updating the database');
       } else {
           console.log('failure updating the database');
       }
    });
    }

    async autoInitiate() {
        if (!this.databaseCommSrvc.isYTDirectoryPresent('Google_Speech_2_Text')) {
            if (this.databaseCommSrvc.creteNewFolderInYTD_DB('Google_Speech_2_Text')) {
                console.log('dir Google_Speech_2_Text created');
            } else {
                throw new Error('An error occured while creating directory Google_Cloud_Bucket folder');
            }
        }
        const jsonFilesToProcess = this.databaseCommSrvc.readYTDFolderDetails('json', 'Google_Cloud_Bucket');
        if (jsonFilesToProcess.length > 0) {
            const response = await this.gsttuSrvc.processJSONFiles(jsonFilesToProcess);
            if (response['ok']) {
                console.log('All Files have been proessed properly');
            } else {
                console.log('Could not complete the JSON process, process ABORTED');
            }
        } else {
            console.log('No files to process inside Google_Cloud_Bucket');
        }
        return {ok: true};
    }
}