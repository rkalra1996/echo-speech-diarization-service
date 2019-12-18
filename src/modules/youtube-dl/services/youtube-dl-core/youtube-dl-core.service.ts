import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';

const YDL_db_path = './../../../../assets/youtubeDL_db';

@Injectable()
export class YoutubeDlCoreService {

    public destFolderName = path.resolve(__dirname, YDL_db_path);

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
        this.createOrUpdateCurrentFolder(currentFolderAddr);
        const tempFileAddr = this.createTempUrlFile(currentFolderAddr, wavFolderName, urls);

        this.runProcess(currentFolderAddr, tempFileAddr)
        .then(response => {
            console.log('wav files extracted successfully for ', wavFolderName);
            // delete the temporary url file created
            this.deleteTempUrlFile(currentFolderAddr, wavFolderName);
        })
        .catch(reject => {
             console.log('Aborting the extraction process!');
            });
        // youtubeDL.getInfo(urls, options, this.callback);
    }

    deleteTempUrlFile(parentDir, fileName) {
        const tempFileName = path.resolve(parentDir, fileName + '.txt');
        fs.access(tempFileName, fs.constants.F_OK, (err) => {
            if (err) {
                // file does not exist
                return true;
            } else {
                // it does
                fs.unlinkSync(tempFileName);
                return true;
            }
        });

    }

    createTempUrlFile(parentDir, fileName, DataToWrite) {
        const dataString = DataToWrite.join('\n');
        const tempFileName = path.resolve(parentDir, fileName+'.txt');
        fs.writeFileSync(tempFileName, dataString, {encoding: 'utf-8'});
        return tempFileName;
    }

    createOrUpdateCurrentFolder(folderAddress) {
        console.log('current folder address is ', folderAddress);
        if (!fs.existsSync(folderAddress)) {
            // create the file
            try {
                fs.mkdirSync(folderAddress);
            } catch (e) {
                console.error('An error occured while creating a new directory ', e);
            }
        }
    }

    runProcess(destFolderToUse, FileAddr) {
        /* return new Promise((resolve, reject) => {
            const commandToExecute = `youtube-dl -x -i --audio-format wav -a ${FileAddr}`;
            child_process.exec(commandToExecute, {
                cwd: destFolderToUse}, (err, stdout, stderr) => {
                    if (err == null) {
                        if (!!stdout) {
                            console.log('resolved');
                            resolve(stdout);
                        } else {
                            const errMsg = 'did not recieve any auth key after execution, check manually';
                            reject(errMsg);
                        }
                    } else {
                        const errMsg = 'An error occured while executing the command to generate new auth key';
                        console.log(err);
                        reject(errMsg);
                    }
                    if (stderr) {
                        const errMsg = 'An error occured after execuing the command for generating a new auth key';
                        console.log(stderr);
                        reject(errMsg);
                    }
                });
        }); */

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
