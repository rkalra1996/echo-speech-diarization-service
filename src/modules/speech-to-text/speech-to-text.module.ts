import { Module, HttpModule } from '@nestjs/common';
import { GoogleSpeechToTextController } from './controllers/google-speech-to-text/google-speech-to-text.controller';
import { GoogleSpeechToTextCoreService } from './services/google-speech-to-text-core/google-speech-to-text-core.service';
import { GoogleSpeakerDiarizationModule } from '../google-speaker-diarization/google-speaker-diarization.module';
import { GoogleSpeechToTextUtilityService } from './services/google-speech-to-text-utility/google-speech-to-text-utility.service';

@Module({
    imports: [HttpModule, GoogleSpeakerDiarizationModule],
    controllers: [GoogleSpeechToTextController],
    providers: [GoogleSpeechToTextCoreService, GoogleSpeechToTextUtilityService],
})
export class SpeechToTextModule {}
