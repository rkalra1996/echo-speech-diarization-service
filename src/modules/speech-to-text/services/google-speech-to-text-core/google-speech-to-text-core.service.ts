import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleSpeechToTextCoreService {


    validateBodyForSpeech2Text(requestBody): boolean {
        let isValid = false;
        if (requestBody && requestBody.constructor === Object) {
            if (Object.keys(requestBody).length > 0 && Object.keys(requestBody).indexOf('urls') > -1) {
                if (Array.isArray(requestBody.urls) && requestBody.urls.length > 0) {
                    if (Object.keys(requestBody).indexOf('resource_file') > -1) {
                        console.log('body is validated');
                        isValid = true;
                    } else {
                        console.log('body does not contain a key named resource_file, cannot dump data without knowing the name');
                        isValid = false;
                    }
                } else {
                    console.error('Either url key is not of aray type or it is empty');
                    isValid = false;
                }
            } else {
                console.error('body object does not have a key named urls');
                isValid = false;
            }
        } else {
            console.error('request body is not of type object');
            isValid = false;
        }
        return isValid;
    }

    initiate(dataToConsume): Promise<object> {
        // collect urls, check if they are of google-cloud bucket types
        // start making requests to google cloud apis, also keep refreshing token whenever needed
        // collect response of all the apis and then dump them into one json file with the parent name being the same name as the youtubeDL_db folder name
        // const request = this.getSpeechToTextRequestData(dataToConsume);
    }
}
