import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {spawn} from 'child_process';
@Injectable()
export class FfmpegUtilityService {
    public globalFilesCount = 0;

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

    startS2MConversion(folderAddress): Promise<object> {
        // resolve with true if all the files are converted else resolve with false
        // pick files one by one and convert them
        fs.readdir(folderAddress, (err, files) => {
            // handling error
            if (err) {
                console.log('Unable to scan directory for wav stereo files', err);
                return Promise.resolve({ok: false, error: 'Unable to scan directory for wav stereo files'});
            }
            // listing all files using forEach
            const originalWAVFilesCount = files.length;
            this.globalFilesCount = 0;
            files.forEach((fileName) => {
                // execute the conversion command
                this.runProcess(folderAddress, fileName, originalWAVFilesCount);
            });
        });
        // const commandToExecute = `ffmpeg -i ${sourceFileName} -ac 1 ${destinationFileName}`;
        return Promise.resolve({ok: true});
    }

    runProcess(parentFolderName, fileName, originalFilesCount) {
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

        proc.on('close', () => {
            console.log('must have converted at ', parentFolderName);
            // check if the file is created successfully, if yes, delete the original else prompt error
            this.verifyConvertedFile(parentFolderName, fileName);
            // check if all the files are converted, this marks that conversion is successfull
            this.checkMonoFilesCount(parentFolderName, originalFilesCount, this.countVerifiedCallback);
        });

        proc.on('error', (data) => {
            console.log('conversion error ', data);
        });
    }

    countVerifiedCallback(err, res) {
        if (res) {
            console.log('Procedd to google speech to text now');
        }
    }

    checkMonoFilesCount(directoryAddr, originalFilesCount, cb) {
        console.log('recieved global file count as ', this.globalFilesCount);
        if (originalFilesCount === this.globalFilesCount) {
            // conversion process is finished, check for total mono files
            console.log('Conversion is completed, verifying converted files');
            const totalFilesPresent = fs.readdirSync(directoryAddr);
            if (totalFilesPresent.length === originalFilesCount) {
                console.log('All files are properly converted and deleted');
                cb(null, true);
            } else {
                console.log('An error occured while successfully processing one of the files, check manually');
                cb(true, null);
            }
        }
    }

    verifyConvertedFile(parentDir, originalFileName) {
        const monoFileName = `mono_${originalFileName}`;
        const monoFileAddr = path.resolve(parentDir, monoFileName);
        const originalFileAddr = path.resolve(parentDir, originalFileName);
        if (fs.existsSync(monoFileAddr)) {
            // delete the original
            fs.unlinkSync(originalFileAddr);
            // increment global filesCount for verification
            this.globalFilesCount += 1;
        } else {
            console.error(`COULD NOT CONVERT ${originalFileName} TO MONO FOR SOME REASON`);
        }
    }
}