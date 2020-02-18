// tslint:disable: variable-name
import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { SpeechToTextEventUtilityService } from '../services/speech-to-text-event-utility/speech-to-text-event-utility.service';

@Injectable()
export class SpeechToTextEventHandlerService {
    private _mainEmitter = new EventEmitter();
    private _allowedEvents = ['START_POLL_ON_FILE', 'WRITE_SPEECH_TO_TEXT_RESPONSE_FOR_FILE'];

    constructor(private stteuSrvc: SpeechToTextEventUtilityService) {
        this.handleEvents();
    }

    handleEvents() {
        this._mainEmitter.on('START_POLL_ON_FILE', (fileData, inititatePipeline?: any) => {
            const processCollectionArray = fileData.map(processObj => {
                return {
                    process_id: processObj.processID,
                    source_url: processObj.google_cloud_uri,
                    fileData: processObj.fileData,
                    filename: processObj.originalfilename,
                };
            });
            console.log('mapped data looks like', processCollectionArray);
            this.stteuSrvc.trackDiarizationStatus(processCollectionArray, inititatePipeline);
        });

        this._mainEmitter.on('WRITE_SPEECH_TO_TEXT_RESPONSE_FOR_FILE', (dataToUse, initiatePipeline = false) => {
            console.log('data recieved to write is ', dataToUse);
            if (initiatePipeline) {
                console.log('got inititate pipeline request, will call language translator after saving to json');
            } else {
                console.log('no pipeline command recieved');
            }
            this.stteuSrvc.initiateWriteProcess(dataToUse, initiatePipeline);
        });
    }

    get allowedEvents() {
        return this._allowedEvents;
    }

    get emitter() {
        return this._mainEmitter;
    }

    triggerEvent(eventName, dataToSend?: object, pipelineTrigger?: boolean) {
        if (this.validateEvent(eventName)) {
            console.log('triggering a new event ', eventName);
            this._mainEmitter.emit(eventName, dataToSend, pipelineTrigger);
        } else {
            console.log(`Event name ${eventName} specified is not allowed`);
        }
    }

    validateEvent(eventNameToValidate): boolean {
        return this.allowedEvents.indexOf(eventNameToValidate) > -1 ? true : false;
    }
}
