// tslint:disable: class-name
import { Injectable, Inject, forwardRef } from '@nestjs/common';

import * as fs from 'fs';
import * as path from 'path';
import { DatabaseUtilityService } from '../../database-utility-service/database-utility.service';
import { SpeakerMergerCoreService } from '../../../../speaker-merger/services/speaker-merger-core-service/speaker-merger-core.service';

export interface WRITE_DIARIZED_FILES_INTERFACE {
    data: Array<{ diarized_data: any, bucket: string, name: string, uri: string }>;
}

@Injectable()
export class DatabseCommonService {

    constructor(
        private dbUtiiltySrvc: DatabaseUtilityService,
        @Inject(forwardRef(() => SpeakerMergerCoreService))
        private speakerMergerSrvc: SpeakerMergerCoreService) { }

    public DB_URL = path.resolve(__dirname, './../../../../../assets/vis_db');
    public DIARIZATION_DB_URL = path.resolve(__dirname, './../../../../../assets/diarization_db');
    public YOUTUBE_DL_DB_URL = path.resolve(__dirname, './../../../../../assets/youtubeDL_db');
    /**
     * Reads jsondb
     * @description Read the databse from the common json file recorded
     */
    readJSONdb() {
        console.log('reading from file', this.DB_URL);
        const fileUrl = path.join(this.DB_URL, 'vis_db.json');
        const fileData = fs.readFileSync(fileUrl, { encoding: 'utf-8' });
        return fileData;
    }

    readDiarizationDB(sessionFolderName) {
        // check if the directory is present
        const sourceDir = path.join(this.DIARIZATION_DB_URL, sessionFolderName);
        if (fs.existsSync(sourceDir)) {
            console.log('directory exisits');
            // read the files present in it
            const fileNames = this.dbUtiiltySrvc.listFilesInDirectory(sourceDir);
            if (fileNames && fileNames.length > 0) {
                return fileNames;
            } else {
                return [];
            }
        } else {
            console.log('location not found --> ', sourceDir);
            return undefined;
        }
    }

    readDiarizationFile(fileName, directoryName) {
        const url = path.join(this.DIARIZATION_DB_URL, directoryName, fileName);
        console.log('reading ' + url);
        try {
            const fileContents = fs.readFileSync(url, { encoding: 'utf-8' });
            return fileContents;
        } catch (e) {
            console.log('error occured while reading file ', fileName);
            console.log(e);
            return undefined;
        }
    }

    /**
     * This function will take the file contents and add it to the designated file present in the folder
     * @returns true if to combined file executed successfully, else false
     */
    appendToCombinedFile(currentFileName, currentFileContents, parentFolderName): boolean {
        console.log('current file name is ', currentFileName);
        try {
            const JSONData = JSON.parse(currentFileContents);
            // extract the correct section
            const filteredContent = this.dbUtiiltySrvc.getDiarizationSection(JSONData);
            // write to designated file properly

            const isFilePresent = this.dbUtiiltySrvc.checkOrCreateFile(parentFolderName);
            if (isFilePresent) {
                // directory structure is present, proceed
                console.log('directory structure is present for ', currentFileName);
                const currentSpeakerName = currentFileName.replace(path.extname(currentFileName), '').trim();
                console.log('current speaker name is ', currentSpeakerName);
                const response = this.dbUtiiltySrvc.writeDiarizationContentsToFile(parentFolderName, filteredContent, currentSpeakerName);
                if (response['ok']) {
                    return true;
                } else {
                    console.log(response['error']);
                    return false;
                }
            } else {
                console.log('Cannot proceed further as some error occured while creating the corresponding directory structure for ', parentFolderName);
                return false;
            }
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    /**
     * Writes files to diarization db will recieve the complete google diarized data for n number of files, along with the parent folder name
     */
    writeFilesToDiarizationDB(multipleDiarizationFilesData: WRITE_DIARIZED_FILES_INTERFACE) {
        // new files should be written to /diarization_db/folder_name/ with name file_name
        // corresponding folder_name should be created in the combined folder with one file combined_diarization.json

        // construct proper database url to write
        console.log('writing DIARIZATION DB FUNCTION CALLED');

        let totalFilesWritten = 0;
        let folderStructure;
        console.log('total files recieved to read ', multipleDiarizationFilesData.data.length);
        multipleDiarizationFilesData.data.forEach((fileData, index) => {
            console.log('inside ', index);
            // get the parent folder name,
            // get the file name
            // get the data
            // write the file in parent_folder/filename.json with data
            if (fileData.uri.endsWith('audio_only.wav')) {
                totalFilesWritten += 1;
            }
            folderStructure = this.dbUtiiltySrvc.getFolderStruture(fileData.name);

            if (!!folderStructure['parentFolderName']) {
                console.log('folder structure is ', JSON.stringify(folderStructure) + '\n');
                const stringFileData = JSON.stringify(fileData.diarized_data) || '';
                const writeUrl = path.join(this.DIARIZATION_DB_URL, folderStructure['parentFolderName']);
                console.log('write url for file ', folderStructure['fileName'] + ' is ' + writeUrl + '\n\n');
                try {

                    // check if the directory is already present, else create
                    if (!fs.existsSync(writeUrl)) {
                        fs.mkdirSync(writeUrl, { recursive: true });
                    } else {
                        console.log(writeUrl + ' already exists, proceeding');
                    }

                    const completeFileUrl = path.join(writeUrl, folderStructure['fileName']);
                    console.log('file path now is ', completeFileUrl);
                    fs.writeFileSync(completeFileUrl, stringFileData, { encoding: 'utf-8' });
                    console.log('file written');
                    totalFilesWritten += 1;
                } catch (e) {
                    console.log('error occured while creating directories, ABORT');
                    console.log(e);
                    return {
                        ok: false,
                        error: 'Unexpected error while creating directories',
                    };
                }
            }
        });
        // check if all the files have been written, only then trigger the readfile functionality
        if (totalFilesWritten === multipleDiarizationFilesData.data.length) {
            console.log('files written successfully');
            this.speakerMergerSrvc.mergeSpeakers(folderStructure.parentFolderName);
        } else {
            return {
                ok: true,
                error: '',
            };
        }
        return {
            ok: true,
            error: '',
        };
    }

    /**
     * Writes file to youtubeDL_db
     * @description The method will write the given set of data to the youtubeDL_db folder under the name of parent_folder_name
     * key provided. The folder of this name will be created if not already present and if it is already there
     * then just a json file named "<parent_folder_name>_speech_to_text.json" will be created
     * @param dataObjectToWrite Should contain two keys, parent_folder_name and data
     */
    writeFileToyoutubeDLdb(dataObjectToWrite): Promise<object> {
        const parentFolderName = dataObjectToWrite.parent_folder_name;
        const parentFolderAddr = path.resolve(this.YOUTUBE_DL_DB_URL, parentFolderName);
        const targetFileName = `${parentFolderName}_speech_to_text.json`;
        const targetFileAddr = path.resolve(parentFolderAddr, targetFileName);
        console.log('writing data at ', targetFileAddr);
        if (!fs.existsSync(parentFolderAddr)) {
            fs.mkdirSync(parentFolderAddr);
        }
        return new Promise((resolve, reject) => {
            fs.writeFile(targetFileAddr, JSON.stringify({data: dataObjectToWrite.data}), {encoding: 'utf-8'}, err => {
                if (err) {
                    console.log('An error occured while writing data to youtubeDL db', err);
                    resolve({ok: false, error: 'An error occured while writing data to youtubeDL db'});
                }
                resolve({ok: true});
            });
        });
    }

    writeYoutubeUrlsToFile(parentFolder, fileName, dataArray) {
        if (!fs.existsSync(path.resolve(this.YOUTUBE_DL_DB_URL))) {
            fs.mkdirSync(path.resolve(this.YOUTUBE_DL_DB_URL));
        }
        const parentFolderAddr = path.resolve(this.YOUTUBE_DL_DB_URL, parentFolder);
        if (!fs.existsSync(parentFolderAddr)) {
            fs.mkdirSync(parentFolderAddr);
        }
        const targetFileAddr = path.resolve(parentFolderAddr, `${fileName}.txt`);
        try {
            const commaSeperatedData = dataArray.join(',').toString();
            fs.writeFileSync(targetFileAddr, commaSeperatedData, {encoding: 'utf-8'});
            console.log('file written successfully');
            return {parentFolder, fileName: `${fileName}.txt`};
        } catch (e) {
            console.log(e);
            throw new Error(`An error occured while writing youtube urls to file ${fileName}.txt`);
        }
    }

    writeTextFileToyoutubeDLdb(dataObjectToWrite) {
        const parentFolderName = dataObjectToWrite.parent_folder_name;
        const parentFolderAddr = path.resolve(this.YOUTUBE_DL_DB_URL, parentFolderName);
        const textFolderName = 'speech-to-text';
        const textFolderAddr = path.resolve(parentFolderAddr, textFolderName);

        if (!fs.existsSync(textFolderAddr)) {
            fs.mkdirSync(textFolderAddr);
        }
        const writeTextDataPromise = [];
        for (const dataEach of dataObjectToWrite.data) {
            const sourceUrl = dataEach.source_url;
            const fileLocArray = sourceUrl.split('/');
            let fileName = fileLocArray[fileLocArray.length - 1];
            fileName = fileName.replace('.wav', '.txt');
            console.log('Writing the text data to ' + fileName);
            const fileLocation = path.resolve(textFolderAddr, fileName);
            if (fs.existsSync(fileLocation)) {
                fs.unlinkSync(fileLocation);
            }
            const resultData = dataEach.diarized_data.response.results;
            const dataTextOnly = resultData[resultData.length - 1].combined_transcript;
            console.log('Test Data is : ' + dataTextOnly);

            writeTextDataPromise.push(new Promise((resolve, reject) => {
                fs.writeFile(fileLocation, dataTextOnly, {encoding: 'utf-8'}, err => {
                    if (err) {
                        console.log('An error occured while writing speech Text to ', err);
                        resolve({ok: false, error: 'An error occured while text data to the speech-to-text folder'});
                    }
                    resolve({ok: true});
                });
            }));
        }
        return writeTextDataPromise;

    }

    isYTDirectoryPresent(directoryToVerify) {
        const parentDirAddr = path.resolve(this.YOUTUBE_DL_DB_URL, directoryToVerify);
        return fs.existsSync(parentDirAddr);
    }

    readFromYT_DB(parentFolder, fileNameToRead) {
        const FileAddress = path.resolve(this.YOUTUBE_DL_DB_URL, parentFolder, fileNameToRead);
        try {
            const fileData = fs.readFileSync(FileAddress, {encoding: 'utf-8'});
            return fileData;
        } catch (e) {
            console.log('An error occured while reading the file from YT_DB', e);
            return null;
        }
    }

    getuploadSourcePath(parentFolder) {
        // get directory address from youtube db
        const parentAddress = path.resolve(this.YOUTUBE_DL_DB_URL, parentFolder);
        if (fs.existsSync(parentAddress)) {
            return parentAddress;
        } else {
            return null;
        }
    }

    getbucketUrlsFile(parentFolder) {
        const bucketFileAddr = path.resolve(this.getuploadSourcePath(parentFolder), 'google-cloud-uris.txt');
        return bucketFileAddr;
    }

    getSpeechToTextSourcePath(parentFolder) {
        const googleSpeechToTextAddr = path.resolve(this.getuploadSourcePath(parentFolder), `${parentFolder}_speech_to_text.json`);
        return googleSpeechToTextAddr;
    }
}
