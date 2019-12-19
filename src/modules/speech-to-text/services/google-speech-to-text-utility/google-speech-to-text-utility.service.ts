import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleSpeechToTextUtilityService {

    parseDataForCorpusDB(responseData, parentFolderName?: string) {
        console.log('parent folder name is ', parentFolderName);
        const finalObject = {};
        if (typeof parentFolderName === 'string') {
            // the combined file will be saved in a particular folder
            finalObject['parent_folder_name'] = parentFolderName;
        }
        // collect all the text properly
        finalObject['data'] = responseData.map(this.reducer.bind(this));
        return finalObject;
    }

    reducer(urlResponse) {
        if (this.validateUrlResponse(urlResponse)) {
            const transcriptArray = urlResponse.diarized_data.response.results;
            const combinedText = transcriptArray.reduce((finalText, currentTranscript) => {
                // pick the transcript and add it in the final Text
                return finalText + (currentTranscript.alternatives[0].transcript ? currentTranscript.alternatives[0].transcript : '');
            }, '');
            // push it as the last entry in the results array
            transcriptArray.push({ combined_transcript: combinedText });
            urlResponse.diarized_data.response.results = transcriptArray;
            return urlResponse;
        } else {
            return undefined;
        }
    }

    validateUrlResponse(dataToValidate) {
        try {
            if (dataToValidate && dataToValidate.constructor === Object) {
                if (Object.keys(dataToValidate).length && dataToValidate.hasOwnProperty('diarized_data')) {
                    if (dataToValidate.diarized_data.hasOwnProperty('response') && dataToValidate.diarized_data.response) {
                        if (dataToValidate.diarized_data.response.hasOwnProperty('results') && Array.isArray(dataToValidate.diarized_data.response.results)) {
                            console.log('urlResponse is verified');
                            return true;
                        }
                    }
                }
            }
            return false;
        } catch(e) {
            console.log('Error while validating urlResponse body, sending false forward', e);
            return false;
        }
    }
}
