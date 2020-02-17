import { Module, HttpModule } from '@nestjs/common';
import { CaminoController } from './controllers/camino/camino.controller';
import { CaminoCoreService } from './services/camino-core/camino-core.service';
import { ReadDbModule } from '../read-db/read-db.module';
import { YoutubeDlModule } from '../youtube-dl/youtube-dl.module';
import { FfmpegUtilityService } from '../youtube-dl/services/ffmpeg-utility/ffmpeg-utility.service';
import { YoutubeDlUtilityService } from '../youtube-dl/services/youtube-dl-utility/youtube-dl-utility.service';
import { GoogleCloudModule } from '../google-cloud/google-cloud.module';
import { GoogleCloudBucketCoreService } from '../google-cloud/services/google-cloud-bucket-core/google-cloud-bucket-core.service';
import { GoogleCloudBucketUtilityService } from '../google-cloud/services/google-cloud-bucket-utility/google-cloud-bucket-utility.service';
import { AutomateAccessTokenModule } from '../automate-access-token/automate-access-token.module';
import { WebhooksHandlerService } from './services/webhooks-handler/webhooks-handler.service';
import { SpeechToTextModule } from '../speech-to-text/speech-to-text.module';

@Module({
    imports: [
        HttpModule,
        ReadDbModule,
        YoutubeDlModule,
        AutomateAccessTokenModule,
        GoogleCloudModule,
        SpeechToTextModule,
    ],
    controllers: [CaminoController],
    providers: [
        FfmpegUtilityService,
        YoutubeDlUtilityService,
        GoogleCloudBucketUtilityService,
        GoogleCloudBucketCoreService,
        CaminoCoreService,
        WebhooksHandlerService,
    ],
})
export class CaminoModule {}
