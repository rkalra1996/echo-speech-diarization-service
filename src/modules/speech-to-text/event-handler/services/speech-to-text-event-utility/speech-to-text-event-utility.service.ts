import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { GoogleSpeechToTextCoreService } from '../../../services/google-speech-to-text-core/google-speech-to-text-core.service';
import { GoogleSpeechToTextUtilityService } from '../../../services/google-speech-to-text-utility/google-speech-to-text-utility.service';
import { DatabseCommonService } from '../../../../read-db/services/database-common-service/databse-common/databse-common.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class SpeechToTextEventUtilityService {
    constructor(
        @Inject(forwardRef(() => GoogleSpeechToTextCoreService))
        private readonly gsttcSrvc: GoogleSpeechToTextCoreService,
        @Inject(forwardRef(() => GoogleSpeechToTextUtilityService))
        private gsttuSrvc: GoogleSpeechToTextUtilityService,
        private dcSrvc: DatabseCommonService,
        ) {}

    trackDiarizationStatus(dataToTrack) {
        this.gsttcSrvc.trackDiarizationStatus(dataToTrack);
    }

    initiateWriteProcess(dataToWrite) {
        const parsedData = this.gsttuSrvc.parseDataForCorpusDB(dataToWrite);
        console.log('parsed Data looks like ' + typeof parsedData, parsedData);
        const GSTTAddr =  path.resolve(this.dcSrvc.YOUTUBE_DL_DB_URL, 'Google_Speech_To_Text');
        if (!this.dcSrvc.isYTDirectoryPresent('Google_Speech_To_Text')) {
            this.dcSrvc.creteNewFolderInYTD_DB('Google_Speech_To_Text/processed');
            console.log('Google_Speech_To_Text dir created');
        }
        const parentFolderName = parsedData['file_data']['fileName'];
        // create a folder inside the speech to text directory
        if (!this.dcSrvc.isYTDirectoryPresent(path.resolve(GSTTAddr, parentFolderName))) {
            this.dcSrvc.creteNewFolderInYTD_DB(path.resolve(GSTTAddr, parentFolderName));
        }
        const parentFolderAddr = path.resolve(GSTTAddr, parentFolderName);
        const finalDataToWrite = {data: [...parsedData['data']]};
        // remove the fileData nested bject from the finalDataToWrite arrays
        finalDataToWrite.data.forEach(dataObj => {
            delete dataObj.fileData;
        });
        // write to file
        try {
            fs.writeFileSync(path.resolve(parentFolderAddr, `${parentFolderName}.json`), JSON.stringify(finalDataToWrite), {encoding: 'utf-8'});
            // once written, move the corresponding village folder from Google_Cloud_Bucket to processed
            // mvove the corresponding json file from Google_Cloud_Buclet to Google_Speech_To_Text
            const oldParentFolderAddr = parsedData['file_data'].filePath.split(parentFolderName)[0];
            if (this.dcSrvc.updateProcessJSON(`${parentFolderName}.json`, oldParentFolderAddr, GSTTAddr)) {
                // update the contents of this process file
                const processDataString = fs.readFileSync(path.resolve(GSTTAddr, `${parentFolderName}.json`), {encoding: 'utf-8'});
                const processedDataObj = JSON.parse(processDataString);
                processedDataObj['speech_to_text'] = {...finalDataToWrite};
                fs.writeFileSync(path.resolve(GSTTAddr, `${parentFolderName}.json`), JSON.stringify(processedDataObj), {encoding: 'utf-8'});
                // move the corresponging folder from Google_Speech_To_text into processed folder
                const sourceGCUriParentAddr = path.resolve(this.dcSrvc.YOUTUBE_DL_DB_URL, 'Google_Cloud_Bucket', parentFolderName);
                const sourceProcessedParentAddress = path.resolve(this.dcSrvc.YOUTUBE_DL_DB_URL, 'Google_Cloud_Bucket/processed', parentFolderName)
                if (!this.dcSrvc.isYTDirectoryPresent(`Google_Cloud_Bucket/processed`)) {
                    fs.mkdirSync(path.resolve(this.dcSrvc.YOUTUBE_DL_DB_URL, 'Google_Cloud_Bucket', 'processed'));
                }
                if (!this.dcSrvc.isYTDirectoryPresent(`Google_Cloud_Bucket/processed/${parentFolderName}`)) {
                    fs.mkdirSync(path.resolve(this.dcSrvc.YOUTUBE_DL_DB_URL, 'Google_Cloud_Bucket', 'processed', parentFolderName));
                }
                // fs.renameSync(path.resolve(sourceGCUriParentAddr, 'google-cloud-uris.txt'), path.resolve(sourceProcessedParentAddress, 'google-cloud-uris.txt'));
                if (this.dcSrvc.updateProcessJSON('google-cloud-uris.txt', sourceGCUriParentAddr, sourceProcessedParentAddress)) {
                    console.log('file has been moved and updated properly');
                    fs.rmdirSync(path.resolve(sourceGCUriParentAddr));
                }
            }
        } catch (e) {
            console.log('An error occured while updating the file paths', e);
        }
    }
}
