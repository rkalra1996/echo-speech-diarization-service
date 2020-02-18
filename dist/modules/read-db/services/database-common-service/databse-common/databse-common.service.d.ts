import { DatabaseUtilityService } from '../../database-utility-service/database-utility.service';
import { SpeakerMergerCoreService } from '../../../../speaker-merger/services/speaker-merger-core-service/speaker-merger-core.service';
export interface WRITE_DIARIZED_FILES_INTERFACE {
    data: Array<{
        diarized_data: any;
        bucket: string;
        name: string;
        uri: string;
    }>;
}
export declare class DatabseCommonService {
    private dbUtiiltySrvc;
    private speakerMergerSrvc;
    constructor(dbUtiiltySrvc: DatabaseUtilityService, speakerMergerSrvc: SpeakerMergerCoreService);
    DB_URL: string;
    DIARIZATION_DB_URL: string;
    YOUTUBE_DL_DB_URL: string;
    YOUTUBE_DOWNLOAD_FOLDER: string;
    readJSONdb(): string;
    readDiarizationDB(sessionFolderName: any): string[];
    readDiarizationFile(fileName: any, directoryName: any): string;
    appendToCombinedFile(currentFileName: any, currentFileContents: any, parentFolderName: any): boolean;
    writeFilesToDiarizationDB(multipleDiarizationFilesData: WRITE_DIARIZED_FILES_INTERFACE): {
        ok: boolean;
        error: string;
    };
    writeFileToyoutubeDLdb(dataObjectToWrite: any): Promise<object>;
    readonly getTodayDate: string;
    getYoutubeDownloadFileAddress(villageDetails: any, parentFolderAddr: any): {
        address: string;
        file: string;
    };
    writeYoutubeUrlsToFile(parentFolder: any, fileName: any, dataArray: any, villageDetailsObj?: object): {
        parentFolder: string;
        fileName: string;
    };
    writeTextFileToyoutubeDLdb(dataObjectToWrite: any): any[];
    isYTDirectoryPresent(directoryToVerify: any): boolean;
    createSpeechToTextFileBackup(dataToBackup: any, languageCode: any, parentFolderName: any): Promise<object>;
    backupAndWriteTranslatedFile(originalFileDataString: any, newFileData: any, parentFolder?: any): Promise<{
        ok: boolean;
        message: string;
    } | {
        ok: boolean;
        error: any;
    }>;
    readFromYT_DB(parentFolder: any, fileNameToRead: any): string;
    getuploadSourcePath(parentFolder: any): string;
    getbucketUrlsFile(parentFolder: any): string;
    getSpeechToTextSourcePath(parentFolder: any): string;
    readYTDFolderDetails(extensionToRead: any, folderPath?: string): string[];
    creteNewFolderInYTD_DB(folderPath: any): boolean;
    updateProcessJSON(fileName: any, parentFolderPath: any, destFolderPath: any): boolean;
    clearDirectory(dirPath: any): void;
}
