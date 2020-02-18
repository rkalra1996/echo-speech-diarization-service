import { Module , HttpModule, forwardRef} from '@nestjs/common';
import { GoogleCloudBucketController } from './controllers/google-cloud-bucket/google-cloud-bucket.controller';
import { GoogleCloudBucketCoreService } from './services/google-cloud-bucket-core/google-cloud-bucket-core.service';
import { GoogleCloudBucketUtilityService } from './services/google-cloud-bucket-utility/google-cloud-bucket-utility.service';
import { AutomateAccessTokenModule } from '../automate-access-token/automate-access-token.module';
import { GoogleSentimentAnalysisController } from './controllers/google-sentiment-analysis/google-sentiment-analysis.controller';
import { GoogleSentimentAnalysisCoreService } from './services/google-sentiment-analysis-core/google-sentiment-analysis-core.service';
import { GoogleSentimentAnalysisUtilityService } from './services/google-sentiment-analysis-utility/google-sentiment-analysis-utility.service';
import { ReadDbModule } from '../read-db/read-db.module';
import { GoogleCloudEventHandlerService } from './event-handler/google-cloud-event-handler/google-cloud-event-handler.service';
import { GoogleCloudEventUtilityService } from './event-handler/services/google-cloud-event-utility/google-cloud-event-utility.service';
import { CaminoModule } from '../camino/camino.module';
import { CaminoCoreService } from '../camino/services/camino-core/camino-core.service';
import { YoutubeDlModule } from '../youtube-dl/youtube-dl.module';
import { FfmpegUtilityService } from '../youtube-dl/services/ffmpeg-utility/ffmpeg-utility.service';
import { YoutubeDlUtilityService } from '../youtube-dl/services/youtube-dl-utility/youtube-dl-utility.service';
import { KeyphrasePythonService } from '../camino/services/keyphrase-python/keyphrase-python.service';

@Module({
  controllers: [
    GoogleCloudBucketController,
    GoogleSentimentAnalysisController,
  ],
  providers: [
    GoogleCloudBucketCoreService,
    GoogleCloudBucketUtilityService,
    GoogleSentimentAnalysisCoreService,
    GoogleSentimentAnalysisUtilityService,
    GoogleCloudEventHandlerService,
    FfmpegUtilityService,
    YoutubeDlUtilityService,
    GoogleCloudEventUtilityService,
    KeyphrasePythonService,
    CaminoCoreService,
  ],
imports: [
  HttpModule,
  AutomateAccessTokenModule,
  ReadDbModule,
  YoutubeDlModule,
  forwardRef(() => {
    return CaminoModule;
  }),
],
exports: [GoogleSentimentAnalysisCoreService, GoogleCloudEventHandlerService, GoogleCloudEventUtilityService],
})
export class GoogleCloudModule {}
