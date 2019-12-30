import { Controller, Post, Body, Res } from '@nestjs/common';
import { YoutubeSearchCoreService } from '../../services/youtube-search/youtube-search-core/youtube-search-core.service';

@Controller('youtube')
export class YoutubeSearchController {

    constructor(private YTSCsrvc: YoutubeSearchCoreService) {}

    @Post('v1/search')
    async processGoogleSpeechToText(@Body() requestbody, @Res() res): Promise<any> {
        console.log('/youtube/v1/search POST hit');
        if (this.YTSCsrvc.validateBodyForYoutubeSearch(requestbody)) {
            try {
            const responseData = await this.YTSCsrvc.initiateSearch(requestbody);
            if (responseData) {
                console.log('Response of youtube/v1/search is : ' + JSON.stringify(responseData));
                res.status(200).send({api: 'youtube/v1/search', status: 200, response: responseData});
            } else {
                res.status(500).send({status: 500, message: 'Something went wrong. Please try again later.'});
            }
        } catch (err) {
            console.log('Error : ' + err);
            res.status(400).send({status: 400, message: err.message});
        }
     } else {
            res.status(400).send({status: 400, message: 'request body is not valid'});
        }
    }
}
