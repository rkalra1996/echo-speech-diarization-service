import { Controller, Post, Res, Body, Get, Query, Param } from '@nestjs/common';
import { Response } from 'express';
import { DiarizationSpeakerService } from '../../services/diarization-speaker/diarization-speaker.service';
import { AccessTokenGeneratorService } from '../../../automate-access-token/services/access-token-generator/access-token-generator.service';

@Controller('diarization-beta')
export class DiarizationBetaController {
    constructor(private diazSrvc: DiarizationSpeakerService, private atgSrvc: AccessTokenGeneratorService) { }

    @Post('speaker/longrunningrecogize')
    async initialteLongRunningDiarization(@Res() response: Response, @Body() body): Promise<any> {
        console.log('POST : diarization-beta/speaker/longrunningrecogize');
        // get the request details based on data provided
        return this.handleRequest(response, body);
    }

    @Get('check-status/:diarizationID')
    async checkStatus(@Param() params , @Res() response: Response): Promise<any> {
        console.log('GET: diarization/check-status, for ', params.diarizationID);
        if (this.validateDiarizationID(params.diarizationID)) {
            console.log('diarization id supplied seems syntactically correct');
            return this.checkDiarizationStatusFromID(response, params);
        } else {
            console.log('diarizationID invalid');
            response.status(400).send({status: 400, message: 'diarization id supplied is invalid'});
        }
    }

    validateDiarizationID(idToValidate) {
        return (typeof idToValidate === 'string' && idToValidate.length >= 5 && !isNaN(parseInt(idToValidate, 10))) ? true : false;
    }

    async handleRequest(response, body) {
        console.log('recieved handleRequest request at ', new Date().toTimeString());
        const requestDetails = await this.diazSrvc.getDiarizationRequestData(body);
        if (!!requestDetails) {
            console.log('request details created as ', requestDetails);
            // hit the official url and wait for response
            const diarizationIDResponse = await this.diazSrvc.initiateDiarization(requestDetails, body);
            if (diarizationIDResponse.hasOwnProperty('error')) {
                // check for unauthorized access
                if (diarizationIDResponse.status.toString() === '401') {
                    console.log('token has expired, refreshing the token');
                    console.log('sending refresh code request at ', new Date().toTimeString());
                    const isRefreshed = await this.atgSrvc.refreshAuthKey();
                    if (isRefreshed) {
                        console.log('sending handleRequest request at ', new Date().toTimeString());
                        return this.handleRequest(response, body);
                    } else {
                        console.log('unable to refresh auth key for gcloud, check manually');
                        response.status(diarizationIDResponse.status).send({ error: diarizationIDResponse.error });
                    }
                }
                response.status(diarizationIDResponse.status).send({ error: diarizationIDResponse.error });
            } else if (diarizationIDResponse.hasOwnProperty('response')) {
                response.status(200).send(diarizationIDResponse);
            }
        } else {
            response.status(400).send({ error: 'file uri not provided, cannot initiate diarization' });
        }
    }

    async checkDiarizationStatusFromID(response, params): Promise<any> {
        const res = await this.diazSrvc.checkStatusFromDiarizationID(params.diarizationID);

        if (!!res) {
            if (res.hasOwnProperty('error')) {
                if (res.error.response.status.toString() === '401') {
                    console.log('token expired for polling, refreshing the token');
                    const isRefreshed = await this.atgSrvc.refreshAuthKey();
                    if (isRefreshed) {
                        console.log('sending checkDiarizationStatusFromID requestafter refresh at ', new Date().toTimeString());
                        return this.checkDiarizationStatusFromID(response, params);
                    } else {
                        console.log('unable to refresh auth key for gcloud, check manually');
                        response.status(res.error.response.status).send({ error: res.error.message });
                    }
                }
                return response.status(res.error.response.status).send({error: res.error.message});
            }
            return response.status(200).send({...res.resp.data});
        } else {
            return response.status(400).send({error: 'Malformed or invalid diarization id provided'});
        }
    }
}
