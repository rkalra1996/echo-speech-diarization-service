import { Injectable, HttpService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { GcloudTokenProviderService } from '../../../automate-access-token/services/gcloud-token-provider/gcloud-token-provider.service';
import { DatabseCommonService } from '../../../read-db/services/database-common-service/databse-common/databse-common.service';
import { AccessTokenGeneratorService } from './../../../automate-access-token/services/access-token-generator/access-token-generator.service';

const publicFileJsonFolder = './../../../../assets/bucketPublicAccess';
const publicFileName = 'publicAccess.json';

@Injectable()
export class GoogleCloudBucketUtilityService {

    constructor(
        private tokenProvider: GcloudTokenProviderService,
        private dbcSrvc: DatabseCommonService,
        private httpSrvc: HttpService,
        private atgSrvc: AccessTokenGeneratorService,
        private atpSrvc: GcloudTokenProviderService,
        ) {}

        checkIfFileExists(filePath) {
            return fs.existsSync(filePath);
        }

    readBinaryDataFromFile(filePath) {
        if (fs.existsSync(filePath)) {
            return fs.createReadStream(filePath);
        } else {
            return new Error('Unable to locate the file at the specified path : ' + filePath);
        }
    }

    breakFilePath(filePathToSplit: string) {
        // To propoerly spit the file path depending on os platform
        if (process.platform === 'win32') {
            return filePathToSplit.split('\\');
        }
        return filePathToSplit.split('/');
    }

    cleanFileName(fileName) {
        // This function removes commas in the file name and replaces them with _
        const newFileName = fileName.split(',').join('_');
        return newFileName;
    }

    getGoogleStorageRequestData(filePath, folderName, bucketName) {

        const bucket = bucketName ? bucketName : 'corpus-audio';
        const breakFilePath = this.breakFilePath(filePath);
        const fileName = encodeURI(breakFilePath[breakFilePath.length - 1]);
        const cleanedFileName = this.cleanFileName(fileName);
        folderName = folderName ? folderName : breakFilePath[breakFilePath.length - 2];
        const googleStorageBucketUploadFileEndpoint = 'https://storage.googleapis.com/upload/storage/v1/b/' +
        bucket +
        '/o?uploadType=media&name=' +
        folderName +
        '/' +
        cleanedFileName;
        const newToken = this.tokenProvider.process_token;
        const DEFAULT_AUTHORIZATION = 'Bearer ' + newToken;
        const data = this.readBinaryDataFromFile(filePath);

        const requestConfig = {
            headers: {
                post: {
                    'Authorization': DEFAULT_AUTHORIZATION,
                    'Content-Type': 'audio/wav',
                },
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        };

        return {
            url: googleStorageBucketUploadFileEndpoint, data, requestConfig,
        };
    }

    public destFolderName = path.resolve(__dirname, publicFileJsonFolder);

    async checkJsonFileForPublicAcess() {

        if (!fs.existsSync(this.destFolderName)) {
            // create the file
            try {
                fs.mkdirSync(this.destFolderName);
            } catch (e) {
                console.error('An error occured while creating a new directory ', e);
            }
        }

        const parentDir = path.resolve(this.destFolderName, publicFileName);
        const data = '{"entity": "allUsers","role": "READER"}';

        const publicFile = path.resolve(parentDir, publicFileName);
        if (!fs.existsSync(publicFile)) {
            fs.mkdirSync(publicFile);
        }
        await new Promise((resolve, reject) => {
            fs.writeFile(publicFile, JSON.stringify({data}), {encoding: 'utf-8'}, err => {
                if (err) {
                    console.log('An error occured while writing data to youtubeDL db', err);
                    resolve({ok: false, error: 'An error occured while writing data to youtubeDL db'});
                }
                resolve({ok: true});
            });
        });

    }

    getGoogleBucketPublicAccessRequestData(bucketName) {

        const bucket = bucketName ? bucketName : 'corpus-audio';
        const googleStorageBucketPublicAccessEndpoint = 'https://storage.googleapis.com/storage/v1/b/'
        + bucket
        + '/iam';
        const newToken = this.tokenProvider.process_token;
        const DEFAULT_AUTHORIZATION = 'Bearer ' + newToken;
        const data = this.readBinaryDataFromFile(publicFileJsonFolder + '/' + publicFileName);

        const requestConfig = {
            headers: {
                post: {
                    'Authorization': DEFAULT_AUTHORIZATION,
                    'Content-Type': 'application/json',
                },
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        };

        return {
            url: googleStorageBucketPublicAccessEndpoint, data, requestConfig,
        };
    }

    getAllFilesPath(folderPath) {
        try {
            let fileNames = fs.readdirSync(folderPath);
            for (let  i = 0; i < fileNames.length; i++) {
                fileNames[i] = path.resolve(folderPath, fileNames[i]);
            }
            fileNames = fileNames.filter(this.isWavFile);
            if (fileNames && fileNames.length > 0) {
                console.log('Files found in the folder : ' + fileNames);
                return fileNames;
            } else {
                console.log('No files found in the folder : ' + folderPath);
                return [];
            }
        } catch (e) {
            console.log('An error occured while reading the files in ' + folderPath);
            console.log(e);
            return [];
        }
    }

    isWavFile(filePath) {
        const filePathArray = filePath.split('/');
        const fileName: string = filePathArray[filePathArray.length - 1];
        if (fileName.endsWith('.wav')) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Writes google uri to file
     * @description The function is responsible to create a new file google-cloud-uris and save the cloud-bucket urls of uploaded audio files
     * @param response
     * @param filePaths Where to store the google-cloud-uris
     */
    writeGoogleUriToFile(response, folderPath) {
        const textFileName = 'google-cloud-uris.txt';
        const textFileAddress = path.resolve(folderPath, textFileName);
        if (fs.existsSync(textFileAddress)) {
            fs.unlinkSync(textFileAddress);
        }
        const textDataToWrite = [];
        for (const res of response) {
            if (res) {
                const responseData = res.data;
                let googleBucketFileUri = 'gs://';
                googleBucketFileUri = googleBucketFileUri + responseData.bucket + '/';
                googleBucketFileUri = googleBucketFileUri + responseData.name;
                textDataToWrite.push(googleBucketFileUri);
            } else {
                throw new Error('Failed to upload some of the files. Please check manually.');
            }
        }
        try {
            fs.writeFileSync(textFileAddress, textDataToWrite, { encoding: 'utf-8' });
            console.log('Google Bucket File Uris sucessfully generated at location : ' + textFileAddress);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

        async processJSONFiles(jsonFilesToProcess, bucketName = 'corpus-audio12345') {
            console.log('bucket selected is ', bucketName);
            const JSONFilePromises = [];
            jsonFilesToProcess.forEach(jsonFile => {
                const folderDetails = {};
                const JSONFolderName = jsonFile.split('.json')[0];
                // get the wav parent folder corresponding to json file
                const folderPath = this.dbcSrvc.getuploadSourcePath(`Audio_Download/${JSONFolderName}`);
                if (folderPath) {
                    const filePaths = this.getAllFilesPath(folderPath);
                    if (filePaths.length > 0) {
                        folderDetails['folderPath'] = folderPath;
                        folderDetails['filePaths'] = filePaths;
                        folderDetails['folderName'] = JSONFolderName;
                        folderDetails['bucketName'] = bucketName;

                        const JSONFilePromise = this.inititateJSONFileUpload(folderDetails);
                        JSONFilePromises.push(JSONFilePromise);
                    } else {
                        return new Error('Did not find any wav files inside ' + folderPath);
                    }
                } else {
                    throw new Error('An Error occured while reading parent folder ' +  JSONFolderName);
                }
            });
            if (JSONFilePromises.length > 0) {
                return Promise.all(JSONFilePromises)
                        .then(allFilesResponse => {
                            console.log('All FILES RESPONSE RECIEVED');
                            return this.handleAllFileResponses(allFilesResponse);
                        })
                        .catch(error => {
                            console.log('An error occured while uploading all the files to cloud');
                            console.log(error);
                            return Promise.resolve({ok: false});
                        });
            } else {
                console.log(false);
            }
            return {ok: true};
        }

        handleAllFileResponses(responseObj): Promise<object> {
            return new Promise((resolve, reject) => {
                responseObj.forEach(JSONFileResponse => {
                    const parentFolderName = JSONFileResponse.folderDetails.folderName;
                    const sourceJSONFolderPathArray = JSONFileResponse.folderDetails.folderPath.split(path.sep);
                    // come one directory up to look for source json files
                    sourceJSONFolderPathArray.pop();
                    // create corresponding folders inside Google_Cloud_Bucket
                    const sourceJSONFolderPath = sourceJSONFolderPathArray.join(path.sep);
                    this.dbcSrvc.creteNewFolderInYTD_DB(`Google_Cloud_Bucket/${parentFolderName}`);
                    const GCBFolderAddr = this.dbcSrvc.getuploadSourcePath(`Google_Cloud_Bucket`);
                    const GCBParentFolderAddr = path.resolve(GCBFolderAddr, parentFolderName);
                    if (this.writeGoogleUriToFile(JSONFileResponse['allwavResponse'], GCBParentFolderAddr)) {
                        // remove the json file from Audio_download folder and move it to processed folder
                        const sourceGCUTxtFileAddr = path.resolve(GCBParentFolderAddr, 'google-cloud-uris.txt');
                        const sourceProcessFileAddr = path.resolve(sourceJSONFolderPath, `${parentFolderName}.json`);
                        const processUpdated = this.updateGCUrlsInOriginalJSON(sourceGCUTxtFileAddr, sourceProcessFileAddr);
                        if (processUpdated) {
                            if (this.dbcSrvc.updateProcessJSON(`${parentFolderName}.json`, sourceJSONFolderPath, GCBFolderAddr)) {
                                console.log(`${parentFolderName}.json in Audio_download has been processed and moved successfully\n`);
                            } else {
                                reject({ok: false, error: 'An Error occured while moving file into processed folder for ' + parentFolderName});
                            }
                        } else {
                            console.log('unable to update the process file from Audio_download');
                            reject({ok: false, error: 'unable to update the process file from Audio_download'});
                        }
                    }
                });
                // all files have been moved, resolve
                resolve({ok: true});
            });
        }

        /**
         * Updates gcurls in original json
         * @description To read the google cloud urls from gcsourceAddress and add them in the object of sourceProcessAddr
         * @param sourceGCUTxtFileAddr text file path from where to read
         * @param sourceProcessFileAddr process file path where to append the data (json)
         * @param keyName (optional) keyName under which the entry will be saved
         */
        updateGCUrlsInOriginalJSON(gcsourceAddress, sourceProcessFileAddr, keyName?: string) {
            try {
                if (fs.existsSync(gcsourceAddress) && fs.existsSync(sourceProcessFileAddr)) {
                    let processData = fs.readFileSync(sourceProcessFileAddr, {encoding: 'utf-8'});
                    const gcUrlData = fs.readFileSync(gcsourceAddress, {encoding: 'utf-8'});
                    const gcUrlDataArr = gcUrlData.split(',');
                    processData = JSON.parse(processData);

                    keyName = keyName ? keyName : 'google_cloud_uris';
                    processData[keyName] = [...gcUrlDataArr];

                    fs.writeFileSync(sourceProcessFileAddr, JSON.stringify(processData), {encoding: 'utf-8'});
                    return true;
                }
            } catch(e) {
                console.log(e);
                return false;
            }
        }

        async inititateJSONFileUpload(folderDetails) {
            console.log('initiating file upload for JSON config ', folderDetails);
            return new Promise((resolve, reject) => {
                const wavPromises = [];
                // this will be reolved only if all the wav files of this json are uploaded
                folderDetails.filePaths.forEach((wavFilePath) => {
                    const requestDetails = this.getGoogleStorageRequestData(wavFilePath, folderDetails['folderName'], folderDetails['bucketName']);
                    if (requestDetails) {
                        console.log('request details created as ', requestDetails['url']);
                        wavPromises.push(this.uploadFileToGoogleStorageBucket(requestDetails));
                    }
                });

                Promise.all(wavPromises)
                .then(allwavResponse => {
                    console.log('recieved all file upload response for ', folderDetails);
                    const consoleObject = {
                        urls: allwavResponse.map(wavResponse => wavResponse['config']['url']),
                        urlStatuses: allwavResponse.map(wavResponse => wavResponse['status']),
                    };
                    console.log(consoleObject);
                    resolve({allwavResponse, folderDetails});
                })
                .catch(allwavError => {
                    console.log('An Error occured while uploading all wav files for ', folderDetails);
                    console.log(allwavError);
                    reject(allwavError);
                });
            });
        }

        uploadFileToGoogleStorageBucket(requestDetails): Promise<any> {
            return new Promise((resolve, reject) => {
                console.log('request to Upload File to Google Storage Bucket initiated at ', new Date().toTimeString());
                this.httpSrvc.post(requestDetails.url, requestDetails.data, requestDetails.requestConfig).toPromise()
                .then(res => {
                    resolve(res);
                })
                .catch(async error => {
                    console.log('An error detected while hitting http apis');
                    if (error.hasOwnProperty('response')) {
                        if (error.response.status.toString() === '401' || error.response.code.toString() === '401') {
                            console.log('unauthorized for api ', requestDetails.url);
                            console.log('sending refresh code request at ', new Date().toTimeString());
                            this.atgSrvc.refreshAuthKey()
                            .then(refreshed => {
                                if (refreshed) {
                                    // setting new auth key
                                    requestDetails = this.atpSrvc.updateAuthTokenInRequest(requestDetails);
                                    console.log(`sending handleRequest request again for ${requestDetails.url} at ${new Date().toTimeString()}\n with refresh key as ${requestDetails.requestConfig.headers.post.Authorization}`);
                                    this.httpSrvc.post(requestDetails.url, requestDetails.data, requestDetails.requestConfig).toPromise()
                                    .then(resp => {
                                        resolve(resp);
                                    })
                                    .catch(e => {
                                        console.log('recieved error while hitting api with refresh token');
                                        console.log(e);
                                        reject(e);
                                    });
                            }});
                        } else {
                            console.log('request is not 401, something else');
                            reject(error);
                        }
                    } else {
                        console.log('it is not a response based error');
                        reject(error);
                    }
                });
            });
        }

}
