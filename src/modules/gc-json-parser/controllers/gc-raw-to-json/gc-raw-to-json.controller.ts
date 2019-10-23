import { Controller, Get, Post, Req, Res, Body } from '@nestjs/common';
import {Request, Response} from 'express';
import { GcRawService } from '../../services/gc-raw/gc-raw.service';

@Controller('parser')
export class GcRawToJsonController {
    constructor(private gcRawSrvc: GcRawService) {}

    @Post('gc/getjson')
     parseGCtoJSON(@Req() request: Request, @Res() response: Response, @Body() body) {
        console.log('parser/gc/getjson hit');
        const rawString = body.toString();

        // const partiallyProcessedString = this.gcRawSrvc.processString(rawString);
        // response.status(200).send(partiallyProcessedString.toString());
        response.status(200).send('API is active but useless');
    }
}
