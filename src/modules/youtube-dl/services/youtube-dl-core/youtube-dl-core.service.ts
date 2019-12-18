import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';
import { FfmpegUtilityService } from '../ffmpeg-utility/ffmpeg-utility.service';

// tslint:disable-next-line: variable-name
const YDL_db_path = './../../../../assets/youtubeDL_db';

@Injectable()
export class YoutubeDlCoreService {

    public destFolderName = path.resolve(__dirname, YDL_db_path);

    constructor(private ffmpegUSrvc: FfmpegUtilityService) {}
    /**
     * Initiates youtube dl core service
     * @description The function will pick the urls provided and start executing the youtube-dl commands
     * @param fileDataToConsume : This is the object containing details like file name, extension, dataArray and fullname
     */
    initiate(fileDataToConsume) {
        const urls = fileDataToConsume.data;
        console.log(this.destFolderName);

        if (!fs.existsSync(this.destFolderName)) {
            // create the file
            try {
                fs.mkdirSync(this.destFolderName);
            } catch (e) {
                console.error('An error occured while creating a new directory ', e);
            }
        }
        // a folder with the name of file will be created
        const wavFolderName = fileDataToConsume.name;
        const currentFolderAddr = path.resolve(this.destFolderName, wavFolderName);
        if (this.createOrUpdateCurrentFolder(currentFolderAddr)) {
            const tempFileAddr = this.createTempUrlFile(currentFolderAddr, wavFolderName, urls);

            this.runProcess(currentFolderAddr, tempFileAddr)
            .then(response => {
                console.log('wav files extracted successfully for ', wavFolderName);
                // delete the temporary url file created
                this.deleteTempUrlFile(currentFolderAddr, wavFolderName);
                // convert the wav files into mono channel
                this.ffmpegUSrvc.convertStereo2Mono(currentFolderAddr)
                .then(conversionRes => {
                    console.log(conversionRes);
                });
            })
            .catch(reject => {
                 console.log('Aborting the extraction process!');
            });
        } else {
            console.log(`Cannot proceed for this resource file ${wavFolderName}, ABORT`);
        }
    }

    deleteTempUrlFile(parentDir, fileName) {
        const tempFileName = path.resolve(parentDir, fileName + '.txt');
        if (fs.existsSync(tempFileName)) {
            fs.unlinkSync(tempFileName);
        }
        return true;
    }

    createTempUrlFile(parentDir, fileName, DataToWrite) {
        const dataString = DataToWrite.join('\n');
        const tempFileName = path.resolve(parentDir, fileName + '.txt');
        fs.writeFileSync(tempFileName, dataString, {encoding: 'utf-8'});
        return tempFileName;
    }

    createOrUpdateCurrentFolder(folderAddress) {
        console.log('current folder address is ', folderAddress);
        if (!fs.existsSync(folderAddress)) {
            // create the file
            try {
                fs.mkdirSync(folderAddress);
                return true;
            } catch (e) {
                console.error('An error occured while creating a new directory ', e);
                return false;
            }
        } else {
            // clean the folder
            try {
                const directoryFilesNames = fs.readdirSync(folderAddress);
                for (const file of directoryFilesNames) {
                    fs.unlinkSync(path.join(folderAddress, file));
                }
                return true;
            } catch (e) {
                console.error('An error occured while clearing the folder ', e);
                return false;
            }
        }
    }

    runProcess(destFolderToUse, FileAddr) {

        return new Promise((resolve, reject) => {
            const spawn = child_process.spawn;
            const commandToExecute = `youtube-dl`;
            const cmd = commandToExecute;

            if (!fs.existsSync(destFolderToUse)) {
                console.log('new folder ');
                fs.mkdirSync(destFolderToUse);
            }
            const args = [
                '-x',
                '-i',
                '-C',
                '--audio-format', 'wav',
                '-a', `${FileAddr}`,
            ];

            const proc = spawn(cmd, args, {cwd: destFolderToUse, env: {...process.env}});

            proc.stdout.on('data', (data) => {
                console.log('output data', data.toString());
            });

            proc.stderr.on('data', (data) => {
                console.log('stdErr data ', data.toString());
                reject('stdErr');
            });

            proc.on('close', () => {
                console.log('must have saved at ', destFolderToUse);
                resolve('finished');
            });

            proc.on('error', (data) => {
                console.log('error ', data);
                reject('Process Error');
            });
        });
    }
}
