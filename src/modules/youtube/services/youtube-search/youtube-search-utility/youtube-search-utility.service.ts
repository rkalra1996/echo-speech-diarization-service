import { Injectable } from '@nestjs/common';
import { GcloudTokenProviderService } from '../../../../automate-access-token/services/gcloud-token-provider/gcloud-token-provider.service';
import { strict } from 'assert';

@Injectable()
export class YoutubeSearchUtilityService {

    // constructor(
    //      private tokenProvider: GcloudTokenProviderService,
    // ) { }
    getSearchRequestData(requestBody) {
        // search, videoCount, orderBy

        let searchUrl = 'https://www.googleapis.com/youtube/v3/search?';

        // Your request can also use the Boolean NOT (-)[%7E], AND (+)[%2B] and OR (|)[%7C] operators to exclude videos or to find videos that are associated with one of several search terms.
        // Note that the each character must be URL-escaped when it is sent in your API request.
        let searchKeys = requestBody.search.split(' ').join('%2B');
        searchUrl = searchUrl + 'key=AIzaSyCHzvvYdbNvsKcFBNo4ZqfI1ierbK658Dg';
        searchUrl = searchUrl + '&q=' + searchKeys;
        // Acceptable values are 0 to 50, inclusive. The default value is 5.
        searchUrl += this.getQueryParameter('maxResults', 'videoCount', +(requestBody.count), 20, [, 50]);

        /*
        Acceptable values are:
        1. date – Resources are sorted in reverse chronological order based on the date they were created.
        2. rating – Resources are sorted from highest to lowest rating.
        3. relevance – Resources are sorted based on their relevance to the search query. This is the default value for this parameter.
        4. title – Resources are sorted alphabetically by title.
        5. videoCount – Channels are sorted in descending order of their number of uploaded videos.
        6. viewCount – Resources are sorted from highest to lowest number of views. For live broadcasts, videos are sorted by number of concurrent viewers while the broadcasts are ongoing.
        */
        searchUrl += this.getQueryParameter('order', 'orderBy', requestBody.orderBy, 'relevance', ['date', 'rating', 'relevance', 'title', 'videoCount', 'viewCount']);

        // The part parameter specifies a comma-separated list of one or more search resource properties that the API response will include. Set the parameter value to snippet.
        searchUrl += this.getQueryParameter('part', 'part', requestBody.part, 'snippet', ['snippet']);

        // Acceptable values are: channel, playlist and video
        searchUrl += this.getQueryParameter('type', 'type', null, 'video', ['video', 'channel', 'playlist']);

        if (searchUrl.indexOf('type=video') > -1) {
            searchUrl += this.getQueryParameter('videoDuration', 'videoDuration', requestBody.videoDuration, 'any', ['any', 'long', 'medium', 'short']);
            searchUrl += this.getQueryParameter('videoLicense', 'videoLicense', requestBody.videoLicense, 'any', ['any', 'creativeCommon', 'youtube']);
            searchUrl += this.getQueryParameter('videoType', 'videoType', requestBody.videoType, 'any', ['any', 'episode', 'movie']);
            // if (requestBody.eventType && typeof requestBody.eventType === 'string') {
            //     searchUrl += this.getQueryParameter('eventType', 'eventType', requestBody.eventType, null, ['completed', 'live', 'upcoming']);
            // }
            // searchUrl += this.getQueryParameter('videoSyndicated', 'videoSyndicated', requestBody.videoSyndicated, 'any', ['any', 'true']);
        }

        if (requestBody.language && typeof requestBody.language === 'string') {
            searchUrl += this.getQueryParameter('relevanceLanguage', 'language', requestBody.language, 'en', null);
        }

        console.log('Url generated with the query parametes : ' + searchUrl);
        // let newToken = this.tokenProvider.process_token;
        // if (requestBody.token) {
        //     newToken = requestBody.token;
        // }
        // const DEFAULT_AUTHORIZATION = 'Bearer ' + newToken;
        // console.log('Auth Token : ' + DEFAULT_AUTHORIZATION);
        // const requestConfig = {
        //     headers: {
        //         get: {
        //             Authorization: DEFAULT_AUTHORIZATION,
        //         },
        //     },
        // };
        const requestConfig = {
            headers: {
                get: { },
            },
        };

        return {
            url: searchUrl, requestConfig,
        };
    }

    getQueryParameter(queryKey, key, value, defaultValue, acceptableValues): string {
        let queryParameter = '&' + queryKey + '=';
        if (value) {
            if (!acceptableValues || acceptableValues.length === 0) {
                queryParameter += value;
            } else if (acceptableValues.length === 2 && typeof acceptableValues[0] === 'number' && typeof acceptableValues[1] === 'number') {
                if (value >= acceptableValues[0] && value <= acceptableValues[1]) {
                    queryParameter += value;
                } else {
                    console.log('The key ' + key + ' should be in range of : [' + acceptableValues[0] + ',' + acceptableValues[1] + '].');
                    throw new Error('The key ' + key + ' should be in range of : [' + acceptableValues[0] + ',' + acceptableValues[1] + '].');
                }
            } else if (acceptableValues.indexOf(value) !== -1) {
                queryParameter += value;
            } else {
                console.log('Wrong Value. Possible Values of the key ' + key + ' are : ' + acceptableValues);
                throw new Error('Wrong Value. Possible Values of the key ' + key + ' are : ' + acceptableValues);
            }
        } else {
            queryParameter += defaultValue;
        }
        return queryParameter;
    }
}
