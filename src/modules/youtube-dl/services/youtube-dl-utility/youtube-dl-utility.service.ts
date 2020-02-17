import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { DatabseCommonService } from '../../../read-db/services/database-common-service/databse-common/databse-common.service';

import {Storage} from '@google-cloud/storage';
import * as process from 'process';
import { FfmpegUtilityService } from '../ffmpeg-utility/ffmpeg-utility.service';

@Injectable()
export class YoutubeDlUtilityService {

    public YOUTUBE_DOWNLOAD_PATH = path.resolve(__dirname, './../../../../assets/youtubeDL_db/youtube-download');
    storage: any;
    constructor(
        private dbCSrvc: DatabseCommonService,
        private ffmpegUSrvc: FfmpegUtilityService) {
        this.storage = new Storage();
    }

    getVideoUrlsArray(fileData) {
        const fileString = fileData.buffer.toString();
        if (fileString.length) {
            // return fileData.buffer.toString().replace(/\r\n/g, 'EOF').split('EOF').map(url => url.trim());
            return fileData.buffer.toString().split(',').map(url => url.trim());

        } else {
            return undefined;
        }
    }

    getFileObject(fileData, fileDataType = 'file') {
        let response = null;
        switch (fileDataType) {
            case 'file':
                response = this.readFileObject(fileData);
                break;
            case 'path':
                response = this.readFilePath(fileData);
                break;
            default :
            {
                throw new Error('INVALID fileDataType provided -> ' +  fileDataType);
            }
        }
        return response;
    }

    readFileObject(fileData) {
        // read the file provided
        const fileDetails = {
            name: fileData.originalname,
            extension: path.extname(fileData.originalname),
        };
        const fileObject = {
            name: fileDetails.name.substr(0, fileDetails.name.lastIndexOf(fileDetails.extension)),
            data: this.getVideoUrlsArray(fileData),
            fullname: fileDetails.name,
            extension: fileDetails.extension,
        };
        return fileObject;
    }

    readFilePath(parentDirectorName) {
        // locate the file present in the specified path and read it
        if (this.dbCSrvc.isYTDirectoryPresent(parentDirectorName)) {
            // read the youtube file
            const fileData = this.dbCSrvc.readFromYT_DB(parentDirectorName, `${parentDirectorName}.txt`);
            console.log('read fileData is ', fileData);
            if (fileData.length) {
                // return fileData.buffer.toString().replace(/\r\n/g, 'EOF').split('EOF').map(url => url.trim());
                const fileArray = fileData.toString().split(',').map(url => url.trim());
                const fileObject = {
                    name: parentDirectorName,
                    data: fileArray,
                    fullname: parentDirectorName + '.txt',
                    extension: '.txt',
                };
                return fileObject;
            } else {
                console.log('Empty file');
                return null;
            }
        } else {
            console.log('No directory present inside YTDownload database ', parentDirectorName);
            return {ok: false, error: 'No directory present with this name'};
        }
    }

    getVillageUrls(fileName) {
        const fileAddr = path.resolve(this.YOUTUBE_DOWNLOAD_PATH, fileName);
        console.log('reading urls from ', fileAddr);
        if (fs.statSync(fileAddr).isFile()) {
            const fileData = fs.readFileSync(fileAddr, {encoding: 'utf-8'});
            const jsonData = JSON.parse(fileData);
            return jsonData['audio_urls'];
        } else {
            return null;
        }
    }

    validateSourceURLRequest(body): boolean {
        let isValid = false;
        if (body && body.constructor === Object && Object.keys(body).length > 0) {
            if (body.hasOwnProperty('foldername') && body.foldername.length) {
                isValid = true;
            }
        }
        return isValid;
    }

    downloadCloudFiles(processedData) {
        if (!this.dbCSrvc.isYTDirectoryPresent('Audio_Download')) {
            this.dbCSrvc.creteNewFolderInYTD_DB('Audio_Download');
        }
        this.dbCSrvc.creteNewFolderInYTD_DB(`Audio_Download/${processedData.parentFolderName}`);

        const fileUrlPromises = [];
        for (const file of processedData.fileNamesArray) {
            const fileUrl = `${processedData.parentFolderName}/${file}`;
            console.log('downloading ---> ', fileUrl);
            fileUrlPromises.push(
                this.storage
                    .bucket(processedData.bucketName).file(fileUrl).download({
                        destination: path.resolve(__dirname, './../../../../assets/youtubeDL_db/Audio_Download', processedData.parentFolderName, file),
                        }),
            );
        }
        Promise.all(fileUrlPromises)
        .then(response => {
            console.log('downloaded ', processedData.fileNamesArray);
            console.log('convert to mono ', processedData.convertToMono);
            if (processedData.convertToMono) {
                const stereoFolderAddress = path.resolve(this.dbCSrvc.YOUTUBE_DL_DB_URL, 'Audio_Download', processedData.parentFolderName);
                console.log('path source for conversion is ', stereoFolderAddress);
                this.ffmpegUSrvc.convertStereo2Mono(stereoFolderAddress);
            }
            // write a fresh json file for further process to work on
            // create a json file in the parent directory for tracking
            const jsonFileAddr = path.resolve(this.dbCSrvc.YOUTUBE_DL_DB_URL, 'Audio_Download', `${processedData.parentFolderName}.json`);
            fs.writeFileSync(path.resolve(jsonFileAddr), JSON.stringify(processedData.demography), {encoding: 'utf-8'});
        })
        .catch(error => {
            console.log('error', error);
        });
    }

    getProcessObject(data): object {
        const bucketName = data['bucketname'] ? data['bucketname'] : 'app-blob-storage';
        const parentFolderName = data['foldername'] || null;
        const fileNamesArray = data['filenames'] || [];
        const demography = data['demography'] || {village: parentFolderName};
        if (!parentFolderName || !fileNamesArray.length) {
            return {};
        }
        return {
            bucketName,
            parentFolderName,
            fileNamesArray,
            convertToMono: data['ismono'] !== undefined ? !data['ismono'] : true,
            demography,
        };
    }
}
