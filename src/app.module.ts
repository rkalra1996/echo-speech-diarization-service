import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NetworkParserModule } from './modules/network-parser/network-parser.module';
import { CommonRequestValidatorService } from './services/shared/common-request-validator/common-request-validator.service';
import { GoogleSpeakerDiarizationModule } from './modules/google-speaker-diarization/google-speaker-diarization.module';
import { ReadDbModule } from './modules/read-db/read-db.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AutomateAccessTokenModule } from './modules/automate-access-token/automate-access-token.module';
import { AsyncReaderModule } from './modules/async-reader/async-reader.module';
import { SpeakerMergerModule } from './modules/speaker-merger/speaker-merger.module';
import { ZoomParserModule } from './modules/zoom-parser/zoom-parser.module';
import { YoutubeDlModule } from './modules/youtube-dl/youtube-dl.module';
import { SpeechToTextModule } from './modules/speech-to-text/speech-to-text.module';
import { GoogleCloudModule } from './modules/google-cloud/google-cloud.module';
import { YoutubeModule } from './modules/youtube/youtube.module';
import { GoogleTranslateModule } from './modules/google-translate/google-translate.module';

@Module({
  // serve static files in the server
  imports: [
ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src', 'static'),
    }),
    NetworkParserModule,
    GoogleSpeakerDiarizationModule,
    AutomateAccessTokenModule,
    ReadDbModule,
    SpeakerMergerModule,
    AsyncReaderModule,
    ZoomParserModule,
    YoutubeDlModule,
    SpeechToTextModule,
    GoogleCloudModule,
    YoutubeModule,
    GoogleTranslateModule,
  ],
  controllers: [AppController],
  providers: [AppService, CommonRequestValidatorService],
  exports: [CommonRequestValidatorService],
})
export class AppModule {

}
