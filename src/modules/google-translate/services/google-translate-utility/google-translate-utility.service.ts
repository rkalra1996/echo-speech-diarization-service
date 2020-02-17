import { Injectable, HttpService } from '@nestjs/common';
import { DatabseCommonService } from '../../../read-db/services/database-common-service/databse-common/databse-common.service';
import { GcloudTokenProviderService } from '../../../automate-access-token/services/gcloud-token-provider/gcloud-token-provider.service';
import { AccessTokenGeneratorService } from '../../../automate-access-token/services/access-token-generator/access-token-generator.service';

@Injectable()
export class GoogleTranslateUtilityService {

    constructor(
        private dbcSrvc: DatabseCommonService,
        private tokenProvider: GcloudTokenProviderService,
        private atgSrvc: AccessTokenGeneratorService,
        private httpSrvc: HttpService) { }

    validateRequestBody(requestBody) {
        let isValid = false;
        if (!requestBody || !Object.keys(requestBody).length) {
            console.log('auto execution initiated');
            isValid = true;
        } else if (requestBody && Object.keys(requestBody).length > 0) {
            if (requestBody.hasOwnProperty('parent_folder')) {
                // if user supplies parent_folder name to do translation
                if (requestBody.parent_folder && typeof requestBody.parent_folder === 'string') {
                    console.log('body valid for parent_folder key')
                    isValid = true;
                } else {
                    console.log('parent_folder key is either invalid or empty string');
                }
            } else if (requestBody.hasOwnProperty('data')) {
                // if user supplies data to translate in the api
                if (requestBody.data && Object.keys(requestBody.data).length > 0) {
                    if (requestBody.data.hasOwnProperty('text') && typeof requestBody.data.text === 'string' && requestBody.data.text.length > 0) {
                        console.log('body valid for data key');
                        isValid = true;
                    } else {
                        console.log('either text key is not present or it is not of type string or empty string');
                    }
                } else {
                    console.log('either data key is invalid or it is an empty object');
                }
            } else {
                console.log('neither of the keys are present, [data, parent_folder]')
            }
        }
        return isValid;
    }

    getTransctiptContents(fileDataString) {
        const fileData = JSON.parse(fileDataString);
        const transctiptArrayObj = {};
        if (fileData.hasOwnProperty('data') && fileData.data && Array.isArray(fileData.data) && fileData.data.length > 0) {
            fileData.data.forEach(dataObj => {
                if (dataObj.hasOwnProperty('process_id') && dataObj.hasOwnProperty('diarized_data')) {
                    if (dataObj.diarized_data.hasOwnProperty('response') && dataObj.diarized_data.response) {
                        if (dataObj.diarized_data.response.hasOwnProperty('results') && dataObj.diarized_data.response.results) {
                            if (Array.isArray(dataObj.diarized_data.response.results)) {
                                transctiptArrayObj[`${dataObj['process_id']}`] = [...dataObj.diarized_data.response.results];
                            }
                        }
                    }
                    // transctiptArray.push({ id: dataObj['process_id'], content: dataObj['transcript']['combined_transcript'] });
                }
            });
            return transctiptArrayObj;
        } else {
            return null;
        }
    }

    getTranslatedCombinedTranscript(translatedResults) {
        const translatedCombinedTranscript = translatedResults.map(translatedObject => translatedObject.alternatives[0].transcript).join(' ');
        return translatedCombinedTranscript;
    }

    mergeTranslatedDataToFileData(newTranslations, previousFileDataString) {

        const oldeFileData = JSON.parse(previousFileDataString);
        const newFileData = oldeFileData.data.map(dataObj => {
            const originalProcessID = dataObj.process_id;
            console.log('checking ', originalProcessID);
            Object.keys(newTranslations).forEach((translationProcessID, index) => {
                if (translationProcessID === originalProcessID) {
                    console.log(originalProcessID + ' matched');
                    dataObj['diarized_data']['response']['results'] = Object.entries(newTranslations)[index][1];
                    // also update the combined_transcript key with english version
                    dataObj['transcript']['combined_transcript'] = this.getTranslatedCombinedTranscript(Object.entries(newTranslations)[index][1]);
                }
            });
            return dataObj;
        });
        return newFileData;
    }

    async handleParentFolderRequest(parentFolderName) {
        // check if the parent folder exists, if yes check if the file {} exists
        if (this.dbcSrvc.isYTDirectoryPresent(parentFolderName)) {
            // read the file
            const fileDataString = this.dbcSrvc.readFromYT_DB(parentFolderName, `${parentFolderName}_speech_to_text.json`);
            if (fileDataString) {
                const transcriptContents = this.getTransctiptContents(fileDataString);
                const translatedContents = await this.handleMultipleTextTranslations(transcriptContents);
                const newDataObject = await this.mergeTranslatedDataToFileData(translatedContents, fileDataString);
                // write back to the original file
                const isWritten = await this.dbcSrvc.backupAndWriteTranslatedFile(fileDataString, newDataObject, parentFolderName);
                 // = await this.writeTranslatedDataToFile({data: newDataObject, parent_folder_name: parentFolderName});
                if (isWritten['ok']) {
                    console.log('successfully written');
                    return Promise.resolve({ok: true, message: 'Data has been translated to english successfully'});
                }
                return Promise.resolve({ok: false, error: isWritten['error']});
            } else {
                // did not recieve file contents
                return Promise.resolve({ok: false, error: 'empty contents in speech to text file cannot be translated'});
            }
        } else {
            console.log('the parent folder does not exists, or maybe the path is malformed');
            return Promise.resolve({ ok: false, error: 'parent folder does not exist / path malformed' });
        }
    }

    writeTranslatedDataToFile(data) {
        // write into the same file
        return this.dbcSrvc.writeFileToyoutubeDLdb(data);
    }

    handleDataRequest(dataToTranslate) {
        // create google-translate request
        // wait till all the translations are completed
        // append a new key in the file named transctibe_en
    }

    async handleMultipleTextTranslations(originalTranscriptObject) {
        const promiseArrayObject = {
            promises: [],
            originalProcessIndex : [],
        };

        Object.entries(originalTranscriptObject).forEach(async (processEntryArray: any[], index) => {
            const sourceLanguageArray = [];
            processEntryArray[1].forEach((originalTranscript, originalIndex) => {
                sourceLanguageArray[originalIndex] = originalTranscript['alternatives'][0]['transcript'];
            });
            const googleTranslateRequest = this.getGoogleTranslateRequestData(sourceLanguageArray);
            promiseArrayObject.promises.push(this.hitTranslateAPI(googleTranslateRequest));
            promiseArrayObject.originalProcessIndex.push(processEntryArray[0]);
        });

        return await Promise.all(promiseArrayObject.promises)
            .then(completeRes => {
                const finalTranslatedObject = {};
                console.log('promises resolved');
                console.log(promiseArrayObject);
                completeRes.forEach((res, resIndex) => {
                    if (res.status === 200 && res.statusText === 'OK') {
                        const translatedArray = [...res.data.data.translations];
                        const compiledTranslatedArray = translatedArray.map(this.extractDestTranscript);
                        console.log('compiled translated array is');
                        console.log(compiledTranslatedArray);
                        finalTranslatedObject[promiseArrayObject.originalProcessIndex[resIndex]] = compiledTranslatedArray;
                    }
                });
                return finalTranslatedObject;
            })
            .catch(e => {
                console.log('An Error occured while reading responses from google translate', e);
            });
    }

    extractDestTranscript(transcriptObj, transcriptObjIndex) {
        const translatedTrancript = transcriptObj['translatedText'].split('&#39;').join(`'`);
        return {alternatives: [{transcript: translatedTrancript}]};
    }

    getGoogleTranslateRequestData(contentArray) {

        const translateAPI = 'https://translation.googleapis.com/language/translate/v2';
        const newToken = this.tokenProvider.process_token;
        const DEFAULT_AUTHORIZATION = `Bearer ${newToken}`;
        const data = {
            q: [...contentArray],
            target: 'en',
            model: 'base',
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
            url: translateAPI, data, requestConfig,
        };
    }

    async hitTranslateAPI(requestData) {
        return this.httpSrvc.post(requestData.url, requestData.data, requestData.requestConfig).toPromise()
                .catch(async error => {
                    if (
                        (error.hasOwnProperty('response') && error.response) &&
                        (error.response.hasOwnProperty('status') && error.response.status !== undefined)
                        ) {
                        if (error.response.status.toString() === '401' || error.response.code.toString() === '401') {
                            console.log('token has expired, refreshing the token');
                            console.log('sending refresh code request at ', new Date().toTimeString());
                            const isRefreshed = await this.atgSrvc.refreshAuthKey();
                            if (isRefreshed) {
                                // update the token
                                requestData = this.tokenProvider.updateAuthTokenInRequest(requestData);
                                console.log('sending handleRequest request at ', new Date().toTimeString());
                                return await this.hitTranslateAPI(requestData);
                            } else {
                                console.log('unable to refresh auth key for gcloud, check manually');
                                return new Error('Unable to refresh the Google Auth Token. Try again later');
                            }
                        }
                    } else {
                        console.log('weird error occured');
                        console.log(error);
                        return new Error('weird error code recieved from the google translate api, check manually');
                    }
                });
}

}
