import { Injectable } from '@nestjs/common';
import * as path from 'path';

@Injectable()
export class YoutubeDlUtilityService {

    getVideoUrlsArray(fileData) {
        const fileString = fileData.buffer.toString();
        if (fileString.length) {
            return fileData.buffer.toString().replace(/\r\n/g, 'EOF').split('EOF').map(url => url.trim());

        } else {
            return undefined;
        }
    }

    getFileObject(fileData) {
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
}
