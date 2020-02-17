import { Injectable } from '@nestjs/common';
import { GoogleTranslateUtilityService } from './../google-translate-utility/google-translate-utility.service';
import { DatabseCommonService } from '../../../read-db/services/database-common-service/databse-common/databse-common.service';
import * as path from 'path';
import * as fs from 'fs';
import { GoogleSentimentAnalysisCoreService } from '../../../google-cloud/services/google-sentiment-analysis-core/google-sentiment-analysis-core.service';
@Injectable()
export class GoogleTranslateCoreService {

    constructor(
        private gtuSrvc: GoogleTranslateUtilityService,
        private databaseCommSrvc: DatabseCommonService,
        private gsacSrvc: GoogleSentimentAnalysisCoreService,
        ) {}

    async initiate(data) {
        // check if we need to send it to data type translator or file type translater
        if (data.hasOwnProperty('parent_folder')) {
            // get the path of the file to translate
            this.gtuSrvc.handleParentFolderRequest(data.parent_folder);
            return {ok: true, message: 'translation process has started successfully'};

        } else if (data.hasOwnProperty('data')) {
            return await this.gtuSrvc.handleDataRequest(data);
        }
    }

    async autoInitiate(triggerPipeline = false) {
        if (!this.databaseCommSrvc.isYTDirectoryPresent('Google_Speech_To_Text')) {
            throw new Error('Google_Speech_To_Text folder does not exist to read files for translation');
        }
        const sourceParentFolderAddr = this.databaseCommSrvc.getuploadSourcePath('Google_Speech_To_Text');
        const jsonFiles = this.databaseCommSrvc.readYTDFolderDetails('json', 'Google_Speech_To_Text');
        if (jsonFiles.length) {
            jsonFiles.forEach(async jsonFile => {
                const fileName = jsonFile.split('.json')[0]
                console.log('checking for file ', fileName);
                const jsonFileAddr = path.resolve(sourceParentFolderAddr, fileName, jsonFile);
                const jsonFileDataString = fs.readFileSync(jsonFileAddr, {encoding: 'utf-8'});
                if (jsonFileDataString) {
                    const transcriptContens = this.gtuSrvc.getTransctiptContents(jsonFileDataString);
                    const translatedContents = await this.gtuSrvc.handleMultipleTextTranslations(transcriptContens);
                    const newDataObject = await this.gtuSrvc.mergeTranslatedDataToFileData(translatedContents, jsonFileDataString);
                    const isWritten = await this.autoBackupAndWriteTranslatedFiles(jsonFileDataString, newDataObject, fileName, jsonFileAddr);
                    if (isWritten['ok']) {
                        console.log('successfully written', fileName);
                        // trigger sentiment analysis after translation has been done, if triggerPipeline is set to true
                        if (triggerPipeline) {
                            console.log('trigger pipeline for language translation detected, proceeding to sentiment analysis');
                            this.gsacSrvc.autoInitiate(true);
                        } else {
                            console.log('no need to auto trigger sentiment analysis, trigger manually');
                        }
                    } else {
                        console.log('An error occured while translating file ', fileName);
                        console.log(isWritten['error']);
                    }
                }
            });
        } else {
            console.log('No speech to text files present to translate');
        }
        return Promise.resolve({ok: true});
    }

    async autoBackupAndWriteTranslatedFiles(oldDataString, newDataObj, parentFolderName, sourceFilePath) {
        const originalFileData = JSON.parse(oldDataString);
        const sourceLang = originalFileData.data[0].diarized_data.response.results[0].languageCode;
        console.log(`source language code detected in the file for creating backup is ${sourceLang}`);
        const sourceFileName = parentFolderName;
        const backupFolderAddress = `Google_Speech_To_Text/${sourceFileName}`;
        const isBackedUp = await this.databaseCommSrvc.createSpeechToTextFileBackup(originalFileData, sourceLang, backupFolderAddress);
        if (!isBackedUp['ok']) {
            return {ok: false, error: isBackedUp['error']};
        }
        const isWritten = await this.autoWriteFileToyoutubeDLdb({data: newDataObj, parent_folder_address: backupFolderAddress, fileName: sourceFileName, sourceFilePath});
        if (isWritten['ok']) {
            console.log('successfully written new contents to original file');
            return Promise.resolve({ok: true, message: 'Data has been translated to english successfully'});
        }
        return Promise.resolve({ok: true, message: `An Error occured while writing new file data in language backup for ${sourceFileName}`});
    }

    autoWriteFileToyoutubeDLdb(dataObjectToWrite) {
        return new Promise((resolve, reject) => {
            const parentFolderAddress = path.resolve(this.databaseCommSrvc.YOUTUBE_DL_DB_URL, dataObjectToWrite.parent_folder_address);
            const targetFileName = `${dataObjectToWrite.fileName}.json`;
            const targetFileAddr = path.resolve(parentFolderAddress, targetFileName);
            console.log('writing translated file in ', targetFileAddr);
            try {
                fs.writeFileSync(targetFileAddr, JSON.stringify({data: dataObjectToWrite.data}), {encoding: 'utf-8'});
                resolve({ok: true});
            } catch (e) {
                console.log('An Error occured while writing translated data in ', targetFileAddr);
                console.log(e);
                reject({ok: false, error: 'An Error occured while writing translated data'});
            }
        });
    }
}
