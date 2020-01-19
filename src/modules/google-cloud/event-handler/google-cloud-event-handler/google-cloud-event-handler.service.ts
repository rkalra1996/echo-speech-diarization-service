// tslint:disable: variable-name
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { EventEmitter } from 'events';
import { GoogleCloudEventUtilityService } from '../services/google-cloud-event-utility/google-cloud-event-utility.service';
import { GoogleSentimentAnalysisCoreService } from './../../services/google-sentiment-analysis-core/google-sentiment-analysis-core.service';
import { DatabseCommonService } from '../../../read-db/services/database-common-service/databse-common/databse-common.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class GoogleCloudEventHandlerService {
    private _mainEmitter = new EventEmitter();
    private _allowedEvents = ['START_SENTIMENT_ANALYSIS', 'INITIATE_PROCESS_UPDATION'];

    constructor(
        private gceuSrvc: GoogleCloudEventUtilityService,
        @Inject(forwardRef(() => GoogleSentimentAnalysisCoreService))
        private readonly gsacSrvc: GoogleSentimentAnalysisCoreService,
        private dbcSrvc: DatabseCommonService) {
        this.handleEvents();
    }

    handleEvents() {
        this._mainEmitter.on('START_SENTIMENT_ANALYSIS', (fileObj => {
            console.log('sentiment analysis recieved ', fileObj);
            fileObj['fileDetails']['destPath'] = path.resolve(this.dbcSrvc.YOUTUBE_DL_DB_URL, 'Sentiment_Analysis', `${fileObj['fileDetails']['fileName']}`, `${fileObj['fileDetails']['fileName']}.json`);
            console.log('will save the sentiment added file in ', fileObj['fileDetails']['destPath']);
            if (!this.dbcSrvc.isYTDirectoryPresent('Sentiment_Analysis')) {
                this.dbcSrvc.creteNewFolderInYTD_DB('Sentiment_Analysis');
            }
            if (this.dbcSrvc.creteNewFolderInYTD_DB(`Sentiment_Analysis/${fileObj['fileDetails']['fileName']}`)) {
                this.gsacSrvc.handleMultipleRequestsForTypeFile(fileObj['fileData'], fileObj['fileDetails']['destPath'], true, fileObj['fileDetails']);
            } else {
                console.log('Error while creating new folder in Sentiment_Analysis, ABORT');
            }
        }));

        this._mainEmitter.on('INITIATE_PROCESS_UPDATION', dataToUse => {
            console.log('\nrecieved file data to write as ', dataToUse);
            // check if processed folder is present in Google_Speech_To_Text, create one
            if (!this.dbcSrvc.isYTDirectoryPresent('Google_Speech_To_Text/processed')) {
                console.log('creating dir ', `Google_Speech_To_Text/processed`);
                this.dbcSrvc.creteNewFolderInYTD_DB(`Google_Speech_To_Text/processed`);
            }
            this.dbcSrvc.creteNewFolderInYTD_DB(`Google_Speech_To_Text/processed/${dataToUse.fileObjDetails.fileName}`);
            const sourceProcessedFileAddress = path.resolve(this.dbcSrvc.YOUTUBE_DL_DB_URL, 'Google_Speech_To_Text', `${dataToUse.fileObjDetails.fileName}.json`);
            const sourceSentimentFileAddress = path.resolve(this.dbcSrvc.YOUTUBE_DL_DB_URL, 'Sentiment_Analysis', dataToUse.fileObjDetails.fileName, `${dataToUse.fileObjDetails.fileName}.json`);
            const destFileAddress = path.resolve(this.dbcSrvc.YOUTUBE_DL_DB_URL, 'Sentiment_Analysis', `${dataToUse.fileObjDetails.fileName}.json`);
            // read the sourceSentimentData and add it into the corresponding process village file, move that process village file inside Sentiment_Analysis
            const fileDataWithSentimentString = fs.readFileSync(sourceSentimentFileAddress, {encoding: 'utf-8'});
            const fileDataJSON = JSON.parse(fileDataWithSentimentString);
            const sourceProcessedDataString = fs.readFileSync(sourceProcessedFileAddress, {encoding: 'utf-8'});
            const sourceProcessedDataJSON = JSON.parse(sourceProcessedDataString);
            sourceProcessedDataJSON['sentiment_analysis'] = fileDataJSON;
            fs.writeFileSync(sourceProcessedFileAddress, JSON.stringify(sourceProcessedDataJSON), {encoding: 'utf-8'});
            fs.renameSync(sourceProcessedFileAddress, destFileAddress);
            // last step is to move the corresponding village folders inside processed folder of Google_Speech_To_Text
            const sourceDirAddress = path.resolve(this.dbcSrvc.YOUTUBE_DL_DB_URL, 'Google_Speech_To_Text', dataToUse.fileObjDetails.fileName);
            const destDirAddress = path.resolve(this.dbcSrvc.YOUTUBE_DL_DB_URL, 'Google_Speech_To_Text', 'processed', dataToUse.fileObjDetails.fileName);
            if(this.gceuSrvc.moveDirectory(sourceDirAddress, destDirAddress)) {
                fs.rmdirSync(sourceDirAddress);
            }
        });
    }

    get allowedEvents() {
        return this._allowedEvents;
    }

    get emitter() {
        return this._mainEmitter;
    }

    triggerEvent(eventName, dataToSend?: object) {
        if(this.validateEvent(eventName)) {
            console.log('triggering a new event ', eventName);
            this._mainEmitter.emit(eventName, dataToSend);
        } else {
            console.log(`Event name ${eventName} specified is not allowed`);
        }
    }

    validateEvent(eventNameToValidate): boolean {
        return this.allowedEvents.indexOf(eventNameToValidate) > -1 ? true : false;
    }
}
