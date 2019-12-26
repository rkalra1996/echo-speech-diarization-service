import { Module , HttpModule} from '@nestjs/common';
import { GoogleCloudBucketController } from './controllers/google-cloud-bucket/google-cloud-bucket.controller';
import { GoogleCloudBucketCoreService } from './services/google-cloud-bucket-core/google-cloud-bucket-core.service';
import { GoogleCloudBucketUtilityService } from './services/google-cloud-bucket-utility/google-cloud-bucket-utility.service';
import { AutomateAccessTokenModule } from '../automate-access-token/automate-access-token.module';
import { GoogleSentimentAnalysisController } from './controllers/google-sentiment-analysis/google-sentiment-analysis.controller';
import { GoogleSentimentAnalysisCoreService } from './services/google-sentiment-analysis-core/google-sentiment-analysis-core.service';
import { GoogleSentimentAnalysisUtilityService } from './services/google-sentiment-analysis-utility/google-sentiment-analysis-utility.service';

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
  ],
imports: [
  HttpModule,
  AutomateAccessTokenModule,
]
})
export class GoogleCloudModule {}
