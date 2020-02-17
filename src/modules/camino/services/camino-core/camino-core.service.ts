import { Injectable } from '@nestjs/common';
import { FfmpegUtilityService } from './../../../youtube-dl/services/ffmpeg-utility/ffmpeg-utility.service';
import { DatabseCommonService } from './../../../read-db/services/database-common-service/databse-common/databse-common.service';
import { YoutubeDlUtilityService } from './../../../youtube-dl/services/youtube-dl-utility/youtube-dl-utility.service';
import { GoogleCloudBucketCoreService } from './../../../google-cloud/services/google-cloud-bucket-core/google-cloud-bucket-core.service';

import * as path from 'path';
import * as fs from 'fs';
@Injectable()
export class CaminoCoreService {

    constructor(
        private ffmpegUSrvc: FfmpegUtilityService,
        private dbCSrvc: DatabseCommonService,
        private ytdluSrvc: YoutubeDlUtilityService,
        private readonly gcbSrvc: GoogleCloudBucketCoreService) {}

    async uploadToCloud(fileData) {
        console.log('processing file info to upload to the cloud');
        // detect the type of file, and correct the name if needed
        const folderPath = path.resolve(this.dbCSrvc.YOUTUBE_DL_DB_URL, 'Audio_Download');
        const fileName = fileData.filename;
        const extension = fileData.extension;
        const fullFileName = `${fileName}${extension}`;
        const properFileObj = {
            parentFolderAddr: folderPath,
            fileName,
            extension,
            fullFileName ,
            filePath: `${folderPath}/${fullFileName}`,
        };
        const resp = await this.uploadFeedbackToCloud(properFileObj);
        return resp;
    }

    /**
     * Saves files to db2. This is specifically for camino implementation
     * @param audioFilesArray
     * @param [bodyObject]
     * @param [requestType]
     * @returns
     */
    saveFilesToDB2(audioFilesArray, bodyObject?: object, requestType = null) {
        return new Promise((resolve) => {
            if (requestType === 'body') {
                console.log('body type detected');
                const processedObject = this.ytdluSrvc.getProcessObject(bodyObject);
                if (Object.keys(processedObject).length > 0) {
                    resolve({ok: true});
                    this.ytdluSrvc.downloadCloudFiles(processedObject);
                } else {
                    resolve({ok: false, status: 400, error : 'either of bucketname, foldername / demography or fileurls array is missing'});
                }
            } else {
                if (!Array.isArray(audioFilesArray)) {
                    resolve({ok: false, status: 400, error: 'No Files provided'});
                } else {
                    const audioDownloadPath = path.resolve(this.dbCSrvc.YOUTUBE_DL_DB_URL, 'Audio_Download');
                    console.log('destination path is ', audioDownloadPath);
                    let  parentFolderName = new Date().toDateString().split(' ').join('_');
                    // adding date to the folder name
                    parentFolderName = parentFolderName + `_${new Date().getHours()}_${new Date().getMinutes()}_${new Date().getSeconds()}`;
                    console.log('will download audio in ', parentFolderName);
                    const parentFolderAddr = path.resolve(audioDownloadPath, parentFolderName);
                    try {
                        this.dbCSrvc.creteNewFolderInYTD_DB(`Audio_Download/${parentFolderName}`);
                        // flush the files if same parent folder name is used
                        const dirFiles = fs.readdirSync(parentFolderAddr);
                        if (dirFiles.length > 0) {
                            // directory appears to be empty
                            console.log(parentFolderName, 'is not empty, flushing files');
                            this.dbCSrvc.clearDirectory(parentFolderAddr);
                        }
                        audioFilesArray.forEach(audioFile => {
                            console.log(audioFile);
                            audioFile = this.correctFileName(audioFile);
                            console.log('correctedFile name looks like ', audioFile);
                            fs.writeFileSync(path.resolve(parentFolderAddr, audioFile.originalname), audioFile.buffer);
                        });
                        resolve({ok: true});
                        // convert to mono
                        // also check if there are any json files in youtube-download folder, this means we need the auto move process - 1
                        // if there are no json files present inside the youtube-download folder, means we don't need the auto move process - 0
                        let triggerAutoMove = 1;
                        if (this.dbCSrvc.isYTDirectoryPresent('youtube-download')) {
                            if (!this.dbCSrvc.readYTDFolderDetails('json')) {
                                triggerAutoMove = 0;
                            }
                        } else {
                            triggerAutoMove = 0;
                        }
                        console.log('sending auto trigger as ', triggerAutoMove);
                        this.ffmpegUSrvc.convertStereo2Mono(parentFolderAddr, '.wav', triggerAutoMove, async (savedFileData) => {
                            // if this is called means, files have been properly processed, trigger upload functionality
                            const uploaded = await this.uploadToCloud(savedFileData);
                            if (uploaded['ok']) {
                                console.log('feedback file has been uploaded properly');
                            } else {
                                console.log(uploaded['error']);
                            }
                        });
                        // create a json file in the parent directory for tracking
                        fs.writeFileSync(path.resolve(audioDownloadPath, `${parentFolderName}.json`), JSON.stringify({village: 'localVillage'}), {encoding: 'utf-8'});
                    } catch (e) {
                        console.log('Error while saving the audio files');
                        console.log(e);
                        resolve({ok: false, status: 500, error: 'Error while saving the files, try again later'});
                    }
                }
            }
        });
    }

    uploadFeedbackToCloud(fileToUpload) {
        console.log('processing file to upload');
        const uploadBucket = 'camino-store';
        if (this.gcbSrvc.autoInitiateUpload(uploadBucket)) {
            return Promise.resolve({ok: true});
        } else {
            console.log('Error while uploading to cloud ---> ', fileToUpload);
            return Promise.resolve({ok: false, error: 'Error occured while uploading file to the cloud'});
        }
    }

    correctFileName(audioData) {
        switch (audioData.mimetype) {
            case 'audio/webm': {
                    audioData.originalname = audioData.originalname.replace(path.extname(audioData.originalname), '.webm');
                    break;
                }
            default: {
                console.log('unsupported format type detected in name');
            }
        }
        return audioData;
    }
}
