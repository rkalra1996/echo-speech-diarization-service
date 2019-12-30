import { Injectable, HttpService } from '@nestjs/common';
import { AccessTokenGeneratorService } from '../../../../automate-access-token/services/access-token-generator/access-token-generator.service';
import { YoutubeSearchUtilityService } from '../youtube-search-utility/youtube-search-utility.service';

@Injectable()
export class YoutubeSearchCoreService {

    constructor(
        private ytsuSrvc: YoutubeSearchUtilityService,
        private httpSrvc: HttpService,
        // private atgSrvc: AccessTokenGeneratorService,
    ) { }

    validateBodyForYoutubeSearch(requestBody): boolean {
        let isValid = false;
        if (requestBody && requestBody.constructor === Object) {
            if (Object.keys(requestBody).length > 0 && Object.keys(requestBody).indexOf('search') > -1) {
                if (requestBody.search.length > 0) {
                    console.log('body is validated');
                    isValid = true;
                } else {
                    console.error('search key is empty');
                    isValid = false;
                }
            } else {
                console.error('body object does not have the key search');
                isValid = false;
            }
        } else {
            console.error('request body is not of type object');
            isValid = false;
        }
        return isValid;
    }

    async initiateSearch(requestBody): Promise<object> {
        const requestDetails = this.ytsuSrvc.getSearchRequestData(requestBody);
        if (!!requestDetails) {
            console.log('request details created as ', requestDetails);
            return this.searchYoutubeForVideos(requestDetails)
                .catch(async err => {
                    console.log('Error in initiateSearch : ' + err);
                });
        }
    }

    searchYoutubeForVideos(requestDetails): Promise<any> {
        console.log('request to search videos on youtube inititated at ', new Date().toTimeString());
        return this.httpSrvc.get(requestDetails.url, requestDetails.requestConfig).toPromise()
            .then((res: any) => {
                console.log('recieved response from youtube search api at ', new Date().toTimeString());
                console.log(JSON.stringify(res.data));
                const videoUrls = [];
                for (const item of res.data.items) {
                    const videoId = item.id.videoId;
                    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                    videoUrls.push(videoUrl);
                    // videoUrls.push('https://www.youtube.com/watch?v=' + videoId);
                }
                return { Youtube_video_urls: videoUrls.join(',')};
            });
    }
}
