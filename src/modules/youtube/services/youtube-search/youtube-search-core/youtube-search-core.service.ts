import { Injectable, HttpService } from '@nestjs/common';
import { YoutubeSearchUtilityService } from '../youtube-search-utility/youtube-search-utility.service';
import { DatabseCommonService } from '../../../../read-db/services/database-common-service/databse-common/databse-common.service';

@Injectable()
export class YoutubeSearchCoreService {

    constructor(
        private ytsuSrvc: YoutubeSearchUtilityService,
        private httpSrvc: HttpService,
        private dbCSrvc: DatabseCommonService,
        // private atgSrvc: AccessTokenGeneratorService,
    ) { }

    /**
     * Validates body for youtube search
     * @param requestBody Contains json object for validation
     * @returns true if body for youtube search
     */
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
        const targetParentFolderName = this.ytsuSrvc.getTargetParentFolderName(requestBody);
        const targetFileName = targetParentFolderName;
        if (!!requestDetails) {
            console.log('request details created as ', requestDetails);
            return this.searchYoutubeForVideos(requestDetails, targetParentFolderName, targetFileName)
                .catch(async err => {
                    console.log('Error in initiateSearch : ' + err);
                });
        }
    }

    searchYoutubeForVideos(requestDetails, parentFolderName, targetFileName): Promise<any> {
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
                // write the url into the file also
                const createdFolder = this.dbCSrvc.writeYoutubeUrlsToFile(parentFolderName, targetFileName, videoUrls);
                // return the data too
                return { Youtube_video_urls: videoUrls.join(','), parentFolder: createdFolder.parentFolder, fileName: createdFolder.fileName};
            });
    }
}
