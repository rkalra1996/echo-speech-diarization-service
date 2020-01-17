import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { DatabseCommonService } from '../../../read-db/services/database-common-service/databse-common/databse-common.service';

@Injectable()
export class YoutubeDlUtilityService {

    public YOUTUBE_DOWNLOAD_PATH = path.resolve(__dirname, './../../../../assets/youtubeDL_db/youtube-download');

    constructor(private dbCSrvc: DatabseCommonService) {}

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
}
