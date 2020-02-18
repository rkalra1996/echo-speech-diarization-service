"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
const database_utility_service_1 = require("../../database-utility-service/database-utility.service");
const speaker_merger_core_service_1 = require("../../../../speaker-merger/services/speaker-merger-core-service/speaker-merger-core.service");
let DatabseCommonService = class DatabseCommonService {
    constructor(dbUtiiltySrvc, speakerMergerSrvc) {
        this.dbUtiiltySrvc = dbUtiiltySrvc;
        this.speakerMergerSrvc = speakerMergerSrvc;
        this.DB_URL = path.resolve(__dirname, './../../../../../assets/vis_db');
        this.DIARIZATION_DB_URL = path.resolve(__dirname, './../../../../../assets/diarization_db');
        this.YOUTUBE_DL_DB_URL = path.resolve(__dirname, './../../../../../assets/youtubeDL_db');
        this.YOUTUBE_DOWNLOAD_FOLDER = 'youtube-download';
    }
    readJSONdb() {
        console.log('reading from file', this.DB_URL);
        const fileUrl = path.join(this.DB_URL, 'vis_db.json');
        const fileData = fs.readFileSync(fileUrl, { encoding: 'utf-8' });
        return fileData;
    }
    readDiarizationDB(sessionFolderName) {
        const sourceDir = path.join(this.DIARIZATION_DB_URL, sessionFolderName);
        if (fs.existsSync(sourceDir)) {
            console.log('directory exisits');
            const fileNames = this.dbUtiiltySrvc.listFilesInDirectory(sourceDir);
            if (fileNames && fileNames.length > 0) {
                return fileNames;
            }
            else {
                return [];
            }
        }
        else {
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
        }
        catch (e) {
            console.log('error occured while reading file ', fileName);
            console.log(e);
            return undefined;
        }
    }
    appendToCombinedFile(currentFileName, currentFileContents, parentFolderName) {
        console.log('current file name is ', currentFileName);
        try {
            const JSONData = JSON.parse(currentFileContents);
            const filteredContent = this.dbUtiiltySrvc.getDiarizationSection(JSONData);
            const isFilePresent = this.dbUtiiltySrvc.checkOrCreateFile(parentFolderName);
            if (isFilePresent) {
                console.log('directory structure is present for ', currentFileName);
                const currentSpeakerName = currentFileName.replace(path.extname(currentFileName), '').trim();
                console.log('current speaker name is ', currentSpeakerName);
                const response = this.dbUtiiltySrvc.writeDiarizationContentsToFile(parentFolderName, filteredContent, currentSpeakerName);
                if (response['ok']) {
                    return true;
                }
                else {
                    console.log(response['error']);
                    return false;
                }
            }
            else {
                console.log('Cannot proceed further as some error occured while creating the corresponding directory structure for ', parentFolderName);
                return false;
            }
        }
        catch (e) {
            console.log(e);
            return false;
        }
    }
    writeFilesToDiarizationDB(multipleDiarizationFilesData) {
        console.log('writing DIARIZATION DB FUNCTION CALLED');
        let totalFilesWritten = 0;
        let folderStructure;
        console.log('total files recieved to read ', multipleDiarizationFilesData.data.length);
        multipleDiarizationFilesData.data.forEach((fileData, index) => {
            console.log('inside ', index);
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
                    if (!fs.existsSync(writeUrl)) {
                        fs.mkdirSync(writeUrl, { recursive: true });
                    }
                    else {
                        console.log(writeUrl + ' already exists, proceeding');
                    }
                    const completeFileUrl = path.join(writeUrl, folderStructure['fileName']);
                    console.log('file path now is ', completeFileUrl);
                    fs.writeFileSync(completeFileUrl, stringFileData, { encoding: 'utf-8' });
                    console.log('file written');
                    totalFilesWritten += 1;
                }
                catch (e) {
                    console.log('error occured while creating directories, ABORT');
                    console.log(e);
                    return {
                        ok: false,
                        error: 'Unexpected error while creating directories',
                    };
                }
            }
        });
        if (totalFilesWritten === multipleDiarizationFilesData.data.length) {
            console.log('files written successfully');
            this.speakerMergerSrvc.mergeSpeakers(folderStructure.parentFolderName);
        }
        else {
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
    writeFileToyoutubeDLdb(dataObjectToWrite) {
        const parentFolderName = dataObjectToWrite.parent_folder_name;
        const parentFolderAddr = path.resolve(this.YOUTUBE_DL_DB_URL, parentFolderName);
        const targetFileName = `${parentFolderName}_speech_to_text.json`;
        const targetFileAddr = path.resolve(parentFolderAddr, targetFileName);
        console.log('writing data at ', targetFileAddr);
        if (!fs.existsSync(parentFolderAddr)) {
            fs.mkdirSync(parentFolderAddr);
        }
        return new Promise((resolve, reject) => {
            fs.writeFile(targetFileAddr, JSON.stringify({ data: dataObjectToWrite.data }), { encoding: 'utf-8' }, err => {
                if (err) {
                    console.log('An error occured while writing data to youtubeDL db', err);
                    resolve({ ok: false, error: 'An error occured while writing data to youtubeDL db' });
                }
                resolve({ ok: true });
            });
        });
    }
    get getTodayDate() {
        const todayDate = new Date();
        const dd = String(todayDate.getDate()).padStart(2, '0');
        const mm = String(todayDate.getMonth() + 1).padStart(2, '0');
        const yyyy = todayDate.getFullYear();
        return (mm + '_' + dd + '_' + yyyy);
    }
    getYoutubeDownloadFileAddress(villageDetails, parentFolderAddr) {
        villageDetails['country'] = villageDetails['country'] ? villageDetails['country'] : 'india';
        const targetFileName = `${villageDetails.village}__${this.getTodayDate}.json`;
        const targetFileAddr = path.resolve(parentFolderAddr, targetFileName);
        console.log('file created at ', targetFileAddr);
        return { address: targetFileAddr, file: targetFileName };
    }
    writeYoutubeUrlsToFile(parentFolder, fileName, dataArray, villageDetailsObj) {
        if (!fs.existsSync(path.resolve(this.YOUTUBE_DL_DB_URL))) {
            fs.mkdirSync(path.resolve(this.YOUTUBE_DL_DB_URL));
        }
        const parentFolderAddr = path.resolve(this.YOUTUBE_DL_DB_URL, this.YOUTUBE_DOWNLOAD_FOLDER);
        console.log('parent folder to use is ', parentFolderAddr);
        if (!fs.existsSync(parentFolderAddr)) {
            fs.mkdirSync(parentFolderAddr);
        }
        const targetDetails = Object.assign({}, this.getYoutubeDownloadFileAddress(villageDetailsObj, parentFolderAddr));
        const targetFileAddr = targetDetails.address;
        try {
            const dataToWrite = Object.assign({}, villageDetailsObj);
            dataToWrite['audio_urls'] = [...dataArray];
            fs.writeFileSync(targetFileAddr, JSON.stringify(dataToWrite), { encoding: 'utf-8' });
            console.log('file written successfully');
            return { parentFolder: this.YOUTUBE_DOWNLOAD_FOLDER, fileName: `${targetDetails.file}` };
        }
        catch (e) {
            console.log(e);
            throw new Error(`An error occured while writing youtube urls to file ${targetDetails.file}`);
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
                fs.writeFile(fileLocation, dataTextOnly, { encoding: 'utf-8' }, err => {
                    if (err) {
                        console.log('An error occured while writing speech Text to ', err);
                        resolve({ ok: false, error: 'An error occured while text data to the speech-to-text folder' });
                    }
                    resolve({ ok: true });
                });
            }));
        }
        return writeTextDataPromise;
    }
    isYTDirectoryPresent(directoryToVerify) {
        const parentDirAddr = path.resolve(this.YOUTUBE_DL_DB_URL, directoryToVerify);
        return fs.existsSync(parentDirAddr);
    }
    createSpeechToTextFileBackup(dataToBackup, languageCode, parentFolderName) {
        if (languageCode && parentFolderName) {
            if (!this.isYTDirectoryPresent(parentFolderName)) {
                this.creteNewFolderInYTD_DB(parentFolderName);
            }
            const backupFolderName = 'language_backup';
            const backupFolderAddress = path.resolve(this.YOUTUBE_DL_DB_URL, parentFolderName, backupFolderName);
            const backupFileAddress = path.resolve(backupFolderAddress, `speech_to_text_${languageCode}.json`);
            if (!fs.existsSync(backupFolderAddress)) {
                fs.mkdirSync(backupFolderAddress);
            }
            try {
                if (dataToBackup.constructor === Object) {
                    dataToBackup = JSON.stringify(dataToBackup);
                }
                fs.writeFileSync(backupFileAddress, dataToBackup, { encoding: 'utf-8' });
                console.log('backup file created successfully');
                return Promise.resolve({ ok: true });
            }
            catch (e) {
                console.log('Error occured', e);
                return Promise.resolve({ ok: false, error: `An Error occured while creating / writing to backup file ${`speech_to_text_${languageCode}.json`}` });
            }
        }
        else {
            return Promise.resolve({ ok: false, error: 'Cannot create a backup file if language code / parent Folder is not provided' });
        }
    }
    async backupAndWriteTranslatedFile(originalFileDataString, newFileData, parentFolder = null) {
        const originalFileData = JSON.parse(originalFileDataString);
        const sourceLang = originalFileData.data[0].diarized_data.response.results[0].languageCode;
        console.log(`source language code detected in the file for creating backup is ${sourceLang}`);
        const isBackedUp = await this.createSpeechToTextFileBackup(originalFileData, sourceLang, parentFolder);
        if (!isBackedUp['ok']) {
            return { ok: false, error: isBackedUp['error'] };
        }
        const isWritten = await this.writeFileToyoutubeDLdb({ data: newFileData, parent_folder_name: parentFolder });
        if (isWritten['ok']) {
            console.log('successfully written new contents to original file');
            return Promise.resolve({ ok: true, message: 'Data has been translated to english successfully' });
        }
        return Promise.resolve({ ok: true, message: `An Error occured while writing new file data in original file ${parentFolder}_speech_to_text_${sourceLang}.json` });
    }
    readFromYT_DB(parentFolder, fileNameToRead) {
        const FileAddress = path.resolve(this.YOUTUBE_DL_DB_URL, parentFolder, fileNameToRead);
        try {
            const fileData = fs.readFileSync(FileAddress, { encoding: 'utf-8' });
            return fileData;
        }
        catch (e) {
            console.log('An error occured while reading the file from YT_DB', e);
            return null;
        }
    }
    getuploadSourcePath(parentFolder) {
        const parentAddress = path.resolve(this.YOUTUBE_DL_DB_URL, parentFolder);
        if (fs.existsSync(parentAddress)) {
            return parentAddress;
        }
        else {
            return null;
        }
    }
    getbucketUrlsFile(parentFolder) {
        const bucketFileAddr = path.resolve(this.getuploadSourcePath(parentFolder), 'google-cloud-uris.txt');
        return bucketFileAddr;
    }
    getSpeechToTextSourcePath(parentFolder) {
        const parentFolderAddress = this.getuploadSourcePath(parentFolder);
        if (parentFolderAddress) {
            const googleSpeechToTextAddr = path.resolve(parentFolderAddress, `${parentFolder}_speech_to_text.json`);
            return googleSpeechToTextAddr;
        }
        else {
            console.log('parent folder does not exist');
            return null;
        }
    }
    readYTDFolderDetails(extensionToRead, folderPath) {
        let parentFolderAddr = this.YOUTUBE_DL_DB_URL;
        if (folderPath && folderPath.length > 0) {
            parentFolderAddr = path.resolve(parentFolderAddr, folderPath);
        }
        else {
            parentFolderAddr = path.resolve(parentFolderAddr, this.YOUTUBE_DOWNLOAD_FOLDER);
        }
        console.log('checking details of ', parentFolderAddr);
        try {
            const directoryDetails = fs.readdirSync(parentFolderAddr);
            if (extensionToRead && extensionToRead.length > 0) {
                return directoryDetails.filter(fileNames => {
                    return path.extname(fileNames).toLocaleLowerCase() === `.${extensionToRead}`;
                });
            }
            else {
                throw new Error('extension keyword is mandatory to search files');
            }
        }
        catch (e) {
            console.log('Error catched while reading YoutubeFolder Details');
            console.log(e);
            throw new Error('Unexpected error while executing internal processes');
        }
    }
    creteNewFolderInYTD_DB(folderPath) {
        try {
            const newFolders = folderPath.split('/');
            let newFolderPath = this.YOUTUBE_DL_DB_URL;
            newFolders.forEach(folder => {
                const folderPartialPath = path.resolve(newFolderPath, folder);
                if (!fs.existsSync(folderPartialPath)) {
                    fs.mkdirSync(folderPartialPath);
                }
                newFolderPath = folderPartialPath;
            });
            return true;
        }
        catch (e) {
            console.log('error while creating new folders');
            console.log(e);
            return false;
        }
    }
    updateProcessJSON(fileName, parentFolderPath, destFolderPath) {
        try {
            const oldFilePath = path.resolve(parentFolderPath, fileName);
            const newFilePath = path.resolve(destFolderPath, fileName);
            console.log('moving file from ' + oldFilePath + ' to ' + newFilePath);
            fs.renameSync(oldFilePath, newFilePath);
            return true;
        }
        catch (e) {
            console.log(e);
            return false;
        }
    }
    clearDirectory(dirPath) {
        try {
            var files = fs.readdirSync(dirPath);
        }
        catch (e) {
            return;
        }
        if (files.length > 0)
            for (var i = 0; i < files.length; i++) {
                var filePath = dirPath + '/' + files[i];
                if (fs.statSync(filePath).isFile())
                    fs.unlinkSync(filePath);
                else
                    this.clearDirectory(filePath);
            }
    }
};
DatabseCommonService = __decorate([
    common_1.Injectable(),
    __param(1, common_1.Inject(common_1.forwardRef(() => speaker_merger_core_service_1.SpeakerMergerCoreService))),
    __metadata("design:paramtypes", [database_utility_service_1.DatabaseUtilityService,
        speaker_merger_core_service_1.SpeakerMergerCoreService])
], DatabseCommonService);
exports.DatabseCommonService = DatabseCommonService;
//# sourceMappingURL=databse-common.service.js.map