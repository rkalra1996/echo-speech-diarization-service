import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {spawn} from 'child_process';
import { DatabseCommonService } from '../../../read-db/services/database-common-service/databse-common/databse-common.service';
@Injectable()
export class FfmpegUtilityService {
    public globalFilesCount = 0;
    constructor(private dbcSrvc: DatabseCommonService) {}

    /**
     * Converts stereo2 mono
     * @description The method will take input of folder where one or more audio files are present
     * and convert each of them into mono channel audios
     */
    async convertStereo2Mono(parentFolderAddr) {
        if (parentFolderAddr && fs.existsSync(parentFolderAddr)) {
            // address is ok, proceed further
            const response = await this.startS2MConversion(parentFolderAddr);
            return response;
        } else {
            return {ok: false, error: 'parentFolderAddress does not seem to be valid one'};
        }
    }

    startS2MConversion(folderAddress) {
        console.log('folder to scan stereo files is ', folderAddress);
        // resolve with true if all the files are converted else resolve with false
        // pick files one by one and convert them
        fs.readdir(folderAddress, (err, files) => {
            // handling error
            if (err) {
                console.log('Unable to scan directory for wav stereo files', err);
                return {ok: false, error: 'Unable to scan directory for wav stereo files'};
            }
            // listing all files using forEach

            const originalWAVFilesCount = files.length;
            this.globalFilesCount = 0;
            files.forEach((fileName) => {
                // execute the conversion command
                this.runProcess(folderAddress, fileName, originalWAVFilesCount);
            });
        });
    }

    async runProcess(parentFolderName, fileName, originalFilesCount) {
        const commadToExecute = 'ffmpeg';

        const args = [
            '-i',
            fileName,
            '-ac', '1',
            `mono_${fileName}`,
        ];

        const proc = spawn(commadToExecute, args, {cwd: parentFolderName, env: {...process.env}});

        proc.stdout.on('data', (data) => {
            console.log('conversion output data', data.toString());
        });

        proc.stderr.on('data', (data) => {
            console.log('conversion stdErr data ', data.toString());
        });

        proc.on('close', async () => {
            // check if the file is created successfully, if yes, delete the original else prompt error
            const verifiedFileRes = await this.verifyConvertedFile(parentFolderName, fileName);
            if (verifiedFileRes) {
                console.log('triggering check mono files');
                // check if all the files are converted, this marks that conversion is successfull
                this.checkMonoFilesCount(parentFolderName, originalFilesCount, async (err, res) => {
                    if (res && !err) {
                        // once verfied that original files have been moved,
                        // copy the village file name from youtube-download to audio=download
                        this.moveProcessedFile(parentFolderName).then(moved => {
                            if (moved['ok']) {
                                console.log('All files are properly converted and moved');
                                console.log('proceed to google speech to text');
                            }
                        });
                    }
                });
            }
        });

        proc.on('error', (data) => {
            console.log('conversion error ', data);
        });
    }

    checkMonoFilesCount(directoryAddr, originalFilesCount, cb) {
        console.log('recieved global file count as ', this.globalFilesCount);
        if (originalFilesCount === this.globalFilesCount) {
            // conversion process is finished, check for total mono files
            console.log('Conversion is completed, verifying converted files');
            const totalFilesPresent = fs.readdirSync(directoryAddr);
            if (totalFilesPresent.length === originalFilesCount) {
                cb(null, true);
                // cb(null, true, directoryAddr, totalFilesPresent);
            } else {
                console.log('An error occured while successfully processing one of the files, check manually');
                cb(true, null);
            }
        } else {
            console.log('original files count does not match with converted files count');
        }
    }

    verifyConvertedFile(parentDir, originalFileName) {
        const monoFileName = `mono_${originalFileName}`;
        const monoFileAddr = path.resolve(parentDir, monoFileName);
        const originalFileAddr = path.resolve(parentDir, originalFileName);
        if (fs.existsSync(monoFileAddr)) {
            // move the original file to the same folder inside processed folder
            // delete the original
            const parentDirName = path.basename(parentDir);
            const processedFolderAddress = path.resolve(parentDir, '../', 'processed');
            if (!fs.existsSync(processedFolderAddress)) {
                fs.mkdirSync(processedFolderAddress);
            }
            // fs.unlinkSync(originalFileAddr);
            const processedParentFolder = path.resolve(processedFolderAddress, parentDirName);

            if ( !fs.existsSync(processedParentFolder)) {
                fs.mkdirSync(processedParentFolder);
            }
            const processedFilePath = path.resolve(processedParentFolder, originalFileName);
            console.log(`moving file from \n${originalFileAddr} ----> ${processedFilePath}`);
            fs.renameSync(originalFileAddr, processedFilePath);
            // increment global filesCount for verification
            this.globalFilesCount += 1;
            return Promise.resolve(true);
        } else {
            console.error(`COULD NOT CONVERT ${originalFileName} TO MONO FOR SOME REASON`);
            return Promise.resolve(false);
        }
    }

    moveProcessedFile(fileNamePath): Promise<any> {
    // extract the file name by splitting the folder path, since folder and file name will be same
    return new Promise((resolve, reject) => {
        const sourceFileName = `${path.basename(fileNamePath)}.json`;
        this.dbcSrvc.readYTDFolderDetails('json').forEach(fileName => {
            if (fileName === sourceFileName) {
                console.log('file is present in the source directory');
                const sourceFilePath = path.resolve(__dirname, `./../../../../assets/youtubeDL_db/youtube-download/${sourceFileName}`);
                const destFilePath = path.resolve(__dirname, `./../../../../assets/youtubeDL_db/Audio_download/${sourceFileName}`);
                try {
                    fs.renameSync(sourceFilePath, destFilePath);
                    resolve({ok: true});
                } catch (e) {
                    console.log(`Error occured while moving the processed json file ${sourceFileName} from youtube-download folder to Audio_download folder`);
                    console.log(e);
                    resolve({ok: false});
                }
            }
        });
        });
    }
}
