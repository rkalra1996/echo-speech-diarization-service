import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class KeyphrasePythonService {
    constructor() {}

    prepareRequestBodyForKPExtraction(filePath) {
        const combinedSAFile = fs.readFileSync(filePath);
        
    }

    getKeyPhraseRequestData(data) {}

    hitKPhraseAPI(requestBody) {}

    preapreaWordCloudObject(dataToParse) {}
}
