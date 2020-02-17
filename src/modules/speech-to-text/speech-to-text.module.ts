import { Module, HttpModule } from '@nestjs/common';
import { GoogleSpeechToTextController } from './controllers/google-speech-to-text/google-speech-to-text.controller';
import { GoogleSpeechToTextCoreService } from './services/google-speech-to-text-core/google-speech-to-text-core.service';
import { GoogleSpeakerDiarizationModule } from '../google-speaker-diarization/google-speaker-diarization.module';
import { GoogleSpeechToTextUtilityService } from './services/google-speech-to-text-utility/google-speech-to-text-utility.service';
import { SpeechToTextEventHandlerService } from './event-handler/speech-to-text-event-handler/speech-to-text-event-handler.service';
import { SpeechToTextEventUtilityService } from './event-handler/services/speech-to-text-event-utility/speech-to-text-event-utility.service';
import { GoogleTranslateModule } from '../google-translate/google-translate.module';
import { GoogleTranslateCoreService } from '../google-translate/services/google-translate-core/google-translate-core.service';
import { GoogleTranslateUtilityService } from '../google-translate/services/google-translate-utility/google-translate-utility.service';
import { GoogleSentimentAnalysisCoreService } from '../google-cloud/services/google-sentiment-analysis-core/google-sentiment-analysis-core.service';
import { GoogleSentimentAnalysisUtilityService } from '../google-cloud/services/google-sentiment-analysis-utility/google-sentiment-analysis-utility.service';
import { GoogleCloudModule } from '../google-cloud/google-cloud.module';

@Module({
    imports: [
        HttpModule,
        GoogleSpeakerDiarizationModule,
        GoogleTranslateModule,
        GoogleCloudModule,
    ],
    controllers: [GoogleSpeechToTextController],
    providers: [
        GoogleSpeechToTextCoreService,
        GoogleSpeechToTextUtilityService,
        SpeechToTextEventHandlerService,
        SpeechToTextEventUtilityService,
        GoogleTranslateUtilityService,
        GoogleSentimentAnalysisUtilityService,
        GoogleSentimentAnalysisCoreService,
        GoogleTranslateCoreService],
    exports: [GoogleSpeechToTextCoreService],
})
export class SpeechToTextModule {}
