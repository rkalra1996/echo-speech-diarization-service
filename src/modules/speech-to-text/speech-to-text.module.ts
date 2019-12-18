import { Module } from '@nestjs/common';
import { GoogleSpeechToTextController } from './controllers/google-speech-to-text/google-speech-to-text.controller';
import { GoogleSpeechToTextCoreService } from './services/google-speech-to-text-core/google-speech-to-text-core.service';

@Module({
    controllers: [GoogleSpeechToTextController],
    providers: [GoogleSpeechToTextCoreService],
})
export class SpeechToTextModule {}
