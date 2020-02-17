import { Injectable, HttpService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { DatabseCommonService } from '../../../read-db/services/database-common-service/databse-common/databse-common.service';
import { GcloudTokenProviderService } from '../../../automate-access-token/services/gcloud-token-provider/gcloud-token-provider.service';
import { AccessTokenGeneratorService } from '../../../automate-access-token/services/access-token-generator/access-token-generator.service';
import { GcsBucketFetcherService } from '../../../google-speaker-diarization/services/gcs-bucket-fetcher/gcs-bucket-fetcher.service';
import { SpeechToTextEventHandlerService } from '../../event-handler/speech-to-text-event-handler/speech-to-text-event-handler.service';
import e = require('express');



@Injectable()
export class GoogleSpeechToTextUtilityService {

    constructor(private dbcSrvc: DatabseCommonService,
                private tokenProvider: GcloudTokenProviderService,
                private atgSrvc: AccessTokenGeneratorService,
                private httpSrvc: HttpService,
                private gcbfSrvc: GcsBucketFetcherService,
                private eventEmitter: SpeechToTextEventHandlerService,
        ) {}

    parseDataForCorpusDB(responseData, parentFolderName?: string) {
        console.log('parent folder name is ', parentFolderName);
        const finalObject = {};
        if (typeof parentFolderName === 'string') {
            // the combined file will be saved in a particular folder
            finalObject['parent_folder_name'] = parentFolderName;
        } else if (responseData[0].hasOwnProperty('fileData')) {
            finalObject['fileData'] = responseData[0].fileData;
        }
        // collect all the text properly
        finalObject['data'] = responseData.map((urlResponse) => {
            const res = this.reducer(urlResponse);
            if (res) {
                return res;
            } else {
                urlResponse.diarized_data.response['results'] = [];
                urlResponse['transcript'] = null;
                return urlResponse;
            }
        });

        return finalObject;
    }

    reducer(urlResponse) {
        if (this.validateUrlResponse(urlResponse)) {
            const transcriptArray = urlResponse.diarized_data.response.results || [];
            if (transcriptArray.length) {

                const combinedText = transcriptArray.reduce((finalText, currentTranscript) => {
                    // pick the transcript and add it in the final Text
                    return finalText + (currentTranscript.alternatives[0].transcript ? currentTranscript.alternatives[0].transcript : '');
                }, '');
                // push it as the last entry in the results array

                urlResponse['transcript'] = {combined_transcript: combinedText};
            }
            // urlResponse.diarized_data.response.results = transcriptArray;
            return urlResponse;
        } else {
            return undefined;
        }
    }

    validateUrlResponse(dataToValidate) {
        try {
            if (dataToValidate && dataToValidate.constructor === Object) {
                if (Object.keys(dataToValidate).length && dataToValidate.hasOwnProperty('diarized_data')) {
                    if (dataToValidate.diarized_data.hasOwnProperty('response') && dataToValidate.diarized_data.response) {
                        if (dataToValidate.diarized_data.response.hasOwnProperty('results') && Array.isArray(dataToValidate.diarized_data.response.results)) {
                            console.log('urlResponse is verified');
                            return true;
                        }
                    }
                }
            }
            return false;
        } catch(e) {
            console.log('Error while validating urlResponse body, sending false forward', e);
            return false;
        }
    }

    getGoogleBucketFileUris(filePath) {

        const filePaths = this.readDataFromFile(filePath);
        console.log('File Paths : ' + filePaths);
        return filePaths;
    }

    readDataFromFile(filePath) {
        try {
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, { encoding: 'utf-8' }).split(',');
        } else {
            return new Error('Unable to locate the file at the specified path : ' + filePath);
        }
    } catch (e) {
        console.log('Some Error Occured while reading file : ', e);
    }
    }

    processJSONFiles(jsonFilesToProcess, continueToTranslation = false) {
        return new Promise((resolve, reject) => {
            const JSONFilePromises = [];
            jsonFilesToProcess.forEach(jsonFile => {
                // get the wav parent folder corresponding to json file
                const filePath = this.dbcSrvc.getuploadSourcePath(`Google_Cloud_Bucket/${jsonFile}`);
                const fileName = jsonFile.split('.json')[0];
                if (filePath) {
                    console.log('file path is ', filePath);
                    const gcloudUris = this.getGoogleCloudURIs(filePath);
                    const fileObj = {filePath, fileName, gcloudUris};
                    JSONFilePromises.push(this.handleFileRequest(fileObj));
                } else {
                    throw new Error('An Error occured while reading parent folder Google_Cloud_Bucket');
                }
            });
            if (JSONFilePromises.length > 0) {
                Promise.all(JSONFilePromises)
                .then(FilesResponse => {
                    console.log('ProcessID Response for all speech to text files has been recieved');
                    // start polling for each of the audio files
                    FilesResponse.forEach(JSONFileResponse => {
                        this.eventEmitter.triggerEvent('START_POLL_ON_FILE', JSONFileResponse, continueToTranslation);
                    });

                })
                .catch(allFilesError => {
                    console.log('An error occured while processing json files for speech-to-text');
                    console.log(allFilesError);
                });
            }
            resolve({ok: true});
        });
    }

    startPollingByProcessID(processObj) {
        return new Promise((resolve, reject) => {
            const intervalTracker = {};
            const requestDetails = this.getPollingRequestData(processObj.processID);
            global.setInterval(() => {
                console.log(`timestamp for ${processObj.processID} --> ${new Date().toLocaleString()}`);
                this.httpSrvc.get(requestDetails.url, requestDetails.requestConfig).toPromise()
                .then(response => {
                    this.gcbfSrvc.checkStatusAndProceed2(response['resp'].data, processObj.processID);
                    resolve(response);
                })
                .catch(error => {});
            }, 10000);
        });
    }

    getPollingRequestData(processID) {
        const requestConfig = {
            headers: {
                get: {
                    'Authorization': 'Bearer ' + this.tokenProvider.process_token,
                    'Content-Type': 'application/json',
                },
            },
        };
        const url = `https://speech.googleapis.com/v1/operations/${processID}`;
        return {url, requestConfig};
    }

    async handleFileRequest(fileData) {
        console.log('initiating speech to text for JSON ', fileData);
        return new Promise((resolve, reject) => {
            const fileCloudUriPromises = [];
            fileData.gcloudUris.forEach(uri => {
                const requestDetails = this.getSpeechToTextRequestData(uri);
                if (requestDetails) {
                    fileCloudUriPromises.push(this.hitSpeechToTextApi(requestDetails, fileData));
                } else {
                    console.log(`unable to create request details for file ${fileData.fileName} for some reason`);
                    reject({ok: false});
                }
            });
            if (fileCloudUriPromises.length > 0) {
                Promise.all(fileCloudUriPromises)
            .then(fileProcessResponse => {
                console.log('file process response is ', JSON.stringify(fileProcessResponse));
                resolve(fileProcessResponse);
            })
            .catch(fileProcessError => {
                console.log('An error occured while retrieveing process IDs for file ', fileData.fileName);
                console.log(fileProcessError);
                reject();
            });
            } else {
                console.log(false);
            }
        });
    }

    async hitSpeechToTextApi(requestDetails, fileData): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log(`sending hitSpeechToTextApi request for uri ${requestDetails.data.audio.uri} at ${new Date().toTimeString()}`);
            this.httpSrvc.post(requestDetails.url, requestDetails.data, requestDetails.requestConfig).toPromise()
                .then((response: any) => {
                    // capture the current diarization id and go further
                    console.log('recieved response for ', requestDetails.data.audio.uri);
                    console.log(response.data);
                    resolve({ processID: response.data.name, google_cloud_uri: requestDetails.data.audio.uri, fileData });
                })
                .catch(error => {
                    console.log('recieved error from hitSpeechToTextApi request at ', new Date().toTimeString());
                    if (error.hasOwnProperty('response')) {
                        console.log(error.response);
                        if (error.response.status.toString() === '401' || error.response.code.toString() === '401') {
                            console.log('unauthorized for uri ', requestDetails.data.audio.uri);
                            console.log('sending refresh code request at ', new Date().toTimeString());
                            this.atgSrvc.refreshAuthKey()
                            .then(refreshed => {
                                if (refreshed) {
                                    // setting new auth key
                                    requestDetails = this.tokenProvider.updateAuthTokenInRequest(requestDetails);
                                    console.log(`sending hitSpeechToTextApi request again for ${requestDetails.data.audio.uri} at ${new Date().toTimeString()}\n with refresh key as ${requestDetails.requestConfig.headers.post.Authorization}`);
                                    this.httpSrvc.post(requestDetails.url, requestDetails.data, requestDetails.requestConfig).toPromise()
                                    .then(resp => {
                                        resolve({ processID: resp.data.name, google_cloud_uri: requestDetails.data.audio.uri, fileData });
                                    })
                                    .catch(e => {
                                        console.log('recieved error while hitting api with refresh token');
                                        console.log(e);
                                        if (e.response.status.toString() === '400' || e.response.code.toString() === '400') {
                                            console.log('400 triggered', e.response.data.error);
                                            reject(e);
                                        } else {
                                            reject(e);
                                        }
                                        reject(e);
                                    });
                            }});
                        } else {
                            console.log('request is not 401, something else');
                            if (error.response.status.toString() === '400' || error.response.code.toString() === '400') {
                                console.log('400 triggered', error.response.data.error);
                                reject(error);
                            } else {
                                reject(error);
                            }
                        }
                    } else {
                        console.log('it is not a response based error');
                        reject(error);
                    }
                });
        });
    }

    handleAllFileResponses(responseObj): Promise<object> {
        return new Promise((resolve, reject) => {
            responseObj.forEach(JSONFileResponse => {});
        });
    }

    getGoogleCloudURIs(fileToRead) {
        try {
            const fileDataString = fs.readFileSync(path.resolve(fileToRead), {encoding: 'utf-8'});
            const fileDataObj = JSON.parse(fileDataString);
            return [...fileDataObj.google_cloud_uris];
        } catch (e) {
            console.log(e);
            throw new Error('An Error occured while reading the file for google_cloud_uris');
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
}
