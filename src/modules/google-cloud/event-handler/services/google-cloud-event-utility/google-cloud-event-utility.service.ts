import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GoogleCloudEventUtilityService {

    moveDirectory(sourceParentFolder, destParentFolder) {
        try {
            const dirDetails = fs.readdirSync(sourceParentFolder);
            dirDetails.forEach(dirItem => {
                if (fs.lstatSync(path.resolve(sourceParentFolder, dirItem)).isFile()) {
                    console.log('moving file ', dirItem);
                    fs.renameSync(path.resolve(sourceParentFolder, dirItem), path.resolve(destParentFolder, dirItem));
                    console.log('moved to ', destParentFolder);
                    if (fs.existsSync(path.resolve(sourceParentFolder, dirItem))) {
                        fs.unlinkSync(path.resolve(sourceParentFolder, dirItem));
                    }
                } else if (fs.lstatSync(path.resolve(sourceParentFolder, dirItem)).isDirectory()) {
                    console.log('found directory ', dirItem);
                    const nestedDirAddress = path.resolve(sourceParentFolder, dirItem);
                    // create the corresponding dir in destParentFolder too
                    const nestDestDirAddress = path.resolve(destParentFolder, dirItem);
                    fs.mkdirSync(nestDestDirAddress);
                    this.moveDirectory(nestedDirAddress, nestedDirAddress);
                    fs.rmdirSync(nestedDirAddress);
                }
            });
            return true;
        } catch (e) {
            console.log('Error while moving directories');
            console.log(e);
            return false;
         }
    }
}
