import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StatusService {

    public STATUS_DB_PATH = path.resolve(__dirname, './../../../assets/status_db/db.json');

    updateStatus(filename, statusValue) {
        // this will update the status in to the statusDB
        console.log('status db path is ', this.STATUS_DB_PATH);
        const statusData = fs.readFileSync(this.STATUS_DB_PATH, 'utf-8');
        const statusJSON = JSON.parse(statusData);
        statusJSON[filename] = statusValue;
        fs.writeFileSync(this.STATUS_DB_PATH, JSON.stringify(statusJSON), 'utf-8');
        console.log('updated status as ', filename + ' ------> ' + statusValue);
    }

    dumpData(filename, dataToDump, statusVal= 4 ) {
        // smipley add a key to the file and save the data
        console.log('updating key phrase status for ', filename);
        fs.readFile(this.STATUS_DB_PATH, 'utf-8', (err, data) => {
            if (err) {
                console.log(err);
                console.log('Error reading the status DB, cannot update the status for ', filename);
            } else {
                const JSONData = JSON.parse(data);
                JSONData[filename] = {
                    status: statusVal,
                    data: dataToDump,
                };
                // write it back
                fs.writeFileSync(this.STATUS_DB_PATH, JSON.stringify(JSONData), 'utf-8');
                console.log('keyphrase status updated');
            }
        });
    }
}
