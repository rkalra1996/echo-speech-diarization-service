import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { GcloudTokenProviderService } from '../../../automate-access-token/services/gcloud-token-provider/gcloud-token-provider.service';

const publicFileJsonFolder = './../../../../assets/bucketPublicAccess';
const publicFileName = 'publicAccess.json';

@Injectable()
export class GoogleCloudBucketUtilityService {

    constructor(
        private tokenProvider: GcloudTokenProviderService,
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

    getGoogleStorageRequestData(filePath, folderName, bucketName) {

        const bucket = bucketName ? bucketName : 'corpus-audio';
        const breakFilePath = filePath.split('/');
        const fileName = breakFilePath[breakFilePath.length - 1];
        folderName = folderName ? folderName : breakFilePath[breakFilePath.length - 2];
        const googleStorageBucketUploadFileEndpoint = 'https://storage.googleapis.com/upload/storage/v1/b/' +
        bucket +
        '/o?uploadType=media&name=' +
        folderName +
        '/' +
        fileName;
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
    writeGoogleUriToFile(response, filePaths) {
        const filePath: string = filePaths[0];
        const toGetFolderPath = filePath.lastIndexOf('/');
        const folderPath = filePath.substring(0, toGetFolderPath);
        const textFileName = 'google-cloud-uris.txt';
        const textFileAddress = path.resolve(folderPath, textFileName);
        if (fs.existsSync(textFileAddress)) {
            fs.unlinkSync(textFileAddress);
        }
        const textDataToWrite = [];
        for (const res of response)  {
            if (res) {
            const responseData = res.data;
            let googleBucketFileUri = 'gs://';
            googleBucketFileUri = googleBucketFileUri + responseData.bucket + '/';
            googleBucketFileUri = googleBucketFileUri + responseData.name;
            textDataToWrite.push(googleBucketFileUri);
            } else {
                console.log('Failed to upload some of the files. Please check manually.');
            }
        }

        fs.writeFileSync(textFileAddress, textDataToWrite, {encoding: 'utf-8'});
        console.log('Google Bucket File Uris sucessfully generated at location : ' + textFileAddress);
        }

}
