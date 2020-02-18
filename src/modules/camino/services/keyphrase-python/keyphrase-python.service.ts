import { Injectable } from '@nestjs/common';
import {HttpService} from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class KeyphrasePythonService {
    constructor(private readonly http: HttpService) {}

    prepareRequestBodyForKPExtraction(filePath) {
        const SAFile = fs.readFileSync(filePath, 'utf-8');
        const combinedTranscript = this.collectCombinedTranscript(SAFile);
        const body = {};
        body['documents'] = [];
        body['documents'].push({id: '1', type: 'inline', language: 'en', text: combinedTranscript});
        return {data: body};
    }

    hitKPhraseAPI(requestBody, filename?: string) {
        const endpoint = 'http://localhost:5000/devcon/submit';
        console.log('request created is ', requestBody);
        return this.http.post(endpoint, requestBody.data).toPromise()
        .then(phraseRes => {
            console.log('keyPhrase response recieved ', phraseRes.data);
            return Promise.resolve(phraseRes.data);
        })
        .catch(phraseErr => {
            console.log('An error occured while hitting keyPhrase apis ', phraseErr);
            return Promise.reject();
        });

    }

    collectCombinedTranscript(JSONString) {
        const JSONData = JSON.parse(JSONString);
        console.log('JSON data looks like ');
        console.log(JSONData);
        // this will strictly work for single audio inside the file
        const dataObj = JSONData.data[0];
        const combinedTranscript = dataObj['transcript']['combined_transcript'];
        /* for (const transcript of dataObj.transcript) {
            console.log()
        } */
        return combinedTranscript;
    }
}
