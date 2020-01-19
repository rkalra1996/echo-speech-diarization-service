import { Module, HttpModule } from '@nestjs/common';
import { GoogleSpeechToTextController } from './controllers/google-speech-to-text/google-speech-to-text.controller';
import { GoogleSpeechToTextCoreService } from './services/google-speech-to-text-core/google-speech-to-text-core.service';
import { GoogleSpeakerDiarizationModule } from '../google-speaker-diarization/google-speaker-diarization.module';
import { GoogleSpeechToTextUtilityService } from './services/google-speech-to-text-utility/google-speech-to-text-utility.service';
import { SpeechToTextEventHandlerService } from './event-handler/speech-to-text-event-handler/speech-to-text-event-handler.service';
import { SpeechToTextEventUtilityService } from './event-handler/services/speech-to-text-event-utility/speech-to-text-event-utility.service';

@Module({
    imports: [HttpModule, GoogleSpeakerDiarizationModule],
    controllers: [GoogleSpeechToTextController],
    providers: [GoogleSpeechToTextCoreService, GoogleSpeechToTextUtilityService, SpeechToTextEventHandlerService, SpeechToTextEventUtilityService],
    exports: [GoogleSpeechToTextCoreService],
})
export class SpeechToTextModule {}
