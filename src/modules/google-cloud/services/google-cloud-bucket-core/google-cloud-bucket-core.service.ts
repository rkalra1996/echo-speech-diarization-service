import { Injectable, HttpService } from '@nestjs/common';
import { GoogleCloudBucketUtilityService } from '../google-cloud-bucket-utility/google-cloud-bucket-utility.service';
import { AccessTokenGeneratorService } from '../../../automate-access-token/services/access-token-generator/access-token-generator.service';
import { DatabseCommonService } from '../../../read-db/services/database-common-service/databse-common/databse-common.service';

@Injectable()
export class GoogleCloudBucketCoreService {

    constructor(
        private gcbuSrvc: GoogleCloudBucketUtilityService,
        private httpSrvc: HttpService,
        private atgSrvc: AccessTokenGeneratorService,
        private dbcSrvc: DatabseCommonService,
    ) { }

    validateBodyForBuketFileUpload(requestBody): boolean {
        let isValid = false;
        if (requestBody && requestBody.constructor === Object) {
            if (Object.keys(requestBody).length > 0 && Object.keys(requestBody).indexOf('filePaths') > -1) {
                if (Array.isArray(requestBody.filePaths) && requestBody.filePaths.length > 0) {
                    console.log('body is validated');
                    isValid = true;
                } else {
                    console.error('Either filePaths key is not of aray type or it is empty');
                    isValid = false;
                }
            } else if (Object.keys(requestBody).length > 0 && Object.keys(requestBody).indexOf('parent_folder') > -1) {
                console.log('body is validated');
                isValid = true;
            } else if (Object.keys(requestBody).length > 0 && Object.keys(requestBody).indexOf('folderPath') > -1) {
                if (requestBody.folderPath) {
                    console.log('body is validated');
                    isValid = true;
                } else {
                    console.error('folderPath key is either nt present or is empty');
                    isValid = false;
                }
            } else {
                console.log('body is valid');
                isValid = true;
            }
        } else {
            console.error('request body is not of type object');
            isValid = false;
        }
        return isValid;
    }

    async initiateUpload(folderPath, filePaths, folderName, bucketName, dirType = 'path'): Promise<object> {
        // collect urls, check if they are of google-cloud bucket types
        // start making requests to google cloud apis, also keep refreshing token whenever needed
        // collect response of all the apis and then dump them into one json file with the parent name being the same name as the youtubeDL_db folder name
        const processCollectionArray = [];
        if (dirType === 'dir') {
            // folderPath cotaines name of the parent folder
            folderPath = this.dbcSrvc.getuploadSourcePath(folderPath);
        }
        if (folderPath) {
            filePaths = this.gcbuSrvc.getAllFilesPath(folderPath);
        }

        for (const filePath of filePaths) {
            if (!this.gcbuSrvc.checkIfFileExists(filePath)) {
                const message = 'Unable to locate the File the given path ' + filePath + '. Please verify the filePaths.';
                return Promise.resolve({ error: message, status: 400 });
            }
            const cloudUploadInitiatedPromise = this.handleMultiFileUpload(filePath, folderName, bucketName);
            processCollectionArray.push(cloudUploadInitiatedPromise);
            // console.log('recieved response as ', processIDResponse);
            // processCollectionArray.push({process_id: processIDResponse.response.data.process_id, source_url: filePaths});
        }
        // console.log('Process Collection Array : ' + processCollectionArray);
        Promise.all(processCollectionArray)
            .then((res: any) => {
                console.log('recieved response from initiate Upload File to Google Storage Bucket request at ', new Date().toTimeString());
                console.log(res);
                this.gcbuSrvc.writeGoogleUriToFile(res, folderPath);
                // return Promise.resolve({response: {message: `Process completed successfully`, data: {name: res.name, id: res.id}}});
            })
            .catch(err => {
                console.log('recieved error from initiate Upload File to Google Storage Bucket request at ', new Date().toTimeString());
                console.log(err);
                // return Promise.resolve({error: err.message, status: err.code});
            });

        // this.trackDiarizationStatus(processCollectionArray, parentFolderName);
        return Promise.resolve({ ok: true, message: 'Uploading files to the Google Storage Bucket. Process started successfully.' });
    }

    autoInitiateUpload() {
        // check if there is any json file in Audio_download folder
        // if yes, start execution
        if (!this.dbcSrvc.isYTDirectoryPresent('Google_Cloud_Bucket')) {
            // create google cloud bucket folder first
            if (this.dbcSrvc.creteNewFolderInYTD_DB('Google_Cloud_Bucket')) {
                console.log('dir Google_Cloud_Bucket created');
            } else {
                throw new Error('An error occured while creating directory Google_Cloud_Bucket folder');
            }
        }
        const jsonFilesToProcess = this.dbcSrvc.readYTDFolderDetails('json', 'Audio_download');
        if (jsonFilesToProcess.length > 0) {
            this.gcbuSrvc.processJSONFiles(jsonFilesToProcess).then(allProcessed => {
                if (allProcessed['ok']) {
                    console.log(`All JSON Files ${jsonFilesToProcess} have been processed and uploaded successfully`);
                } else {
                    console.log('An Error occured while processing all the json files', allProcessed['error']);
                }
            });
        } else {
            console.log('No files to process inside youtube_download folder');
        }
        return {ok: true};
    }

    async handleMultiFileUpload(filePath, folderName, bucketName) {
        console.log('recieved handleMultiFileUpload request at ', new Date().toTimeString());
        const requestDetails = this.gcbuSrvc.getGoogleStorageRequestData(filePath, folderName, bucketName);
        if (!!requestDetails) {
            console.log('request details created as ', requestDetails);
            return this.uploadFileToGoogleStorageBucket(requestDetails)
                .catch(async err => {
                    console.log('Got an error in final promise');
                    console.log(err);
                    if (err.response.status === '401' || err.response.code === '401') {
                        console.log('token has expired, refreshing the token');
                        console.log('sending refresh code request at ', new Date().toTimeString());
                        const isRefreshed = await this.atgSrvc.refreshAuthKey();
                        if (isRefreshed) {
                            console.log('sending handleRequest request at ', new Date().toTimeString());
                            return this.handleMultiFileUpload(filePath, folderName, bucketName);
                        } else {
                            console.log('unable to refresh auth key for gcloud, check manually');
                            return new Error('Unable to refresh the Google Auth Token. Try again later');
                        }
                    }
                });
        }

    }

    uploadFileToGoogleStorageBucket(requestDetails): Promise<any> {
        console.log('request to Upload File to Google Storage Bucket initiated at ', new Date().toTimeString());
        return this.httpSrvc.post(requestDetails.url, requestDetails.data, requestDetails.requestConfig).toPromise();
    }

    validateBodyForBuketPublic(requestBody): boolean {
        let isValid = false;
        if (requestBody && requestBody.constructor === Object) {
            if (Object.keys(requestBody).length > 0 && Object.keys(requestBody).indexOf('objectNames') > -1) {
                if (Array.isArray(requestBody.objectNames) && requestBody.objectNames.length > 0) {
                    console.log('Request Validated Successfully');
                } else {
                    console.error('Either objectNames key is not of aray type or it is empty');
                    isValid = false;
                }
            } else {
                console.error('body object does not have a key named objectNames');
                isValid = false;
            }
        } else {
            console.error('request body is not of type object');
            isValid = false;
        }
        return isValid;
    }

    async initiatePublicAccess(bucketName, objectNames): Promise<object> {

        this.gcbuSrvc.checkJsonFileForPublicAcess();

        // for(const objectName of objectNames) {

        // }
        const requestDetails = this.gcbuSrvc.getGoogleBucketPublicAccessRequestData(bucketName);
        if (!!requestDetails) {
            console.log('request details created as ', requestDetails);
            return this.makeBucketPublicallyAccess(requestDetails)
                .catch(async err => {
                    if (err.response.status === '401' || err.response.code === '401') {
                        console.log('token has expired, refreshing the token');
                        console.log('sending refresh code request at ', new Date().toTimeString());
                        const isRefreshed = await this.atgSrvc.refreshAuthKey();
                        if (isRefreshed) {
                            console.log('sending handleRequest request at ', new Date().toTimeString());
                            return this.initiatePublicAccess(bucketName, objectNames);
                        } else {
                            console.log('unable to refresh auth key for gcloud, check manually');
                            return new Error('Unable to refresh the Google Auth Token. Try again later');
                        }
                    }
                });
        }
    }

    makeBucketPublicallyAccess(requestDetails): Promise<any> {
        console.log('sending initiate Upload File to Google Storage Bucket request at ', new Date().toTimeString());
        return this.httpSrvc.post(requestDetails.url, requestDetails.data, requestDetails.requestConfig).toPromise();
    }
}
