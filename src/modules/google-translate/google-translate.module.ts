import { Module, HttpModule } from '@nestjs/common';
import { GoogleTranslateController } from './controllers/google-translate/google-translate.controller';
import { GoogleTranslateUtilityService } from './services/google-translate-utility/google-translate-utility.service';
import { GoogleTranslateCoreService } from './services/google-translate-core/google-translate-core.service';
import { DatabseCommonService } from '../read-db/services/database-common-service/databse-common/databse-common.service';
import { ReadDbModule } from './../read-db/read-db.module';
import { SpeakerMergerModule } from './../speaker-merger/speaker-merger.module';
import { AutomateAccessTokenModule } from '../automate-access-token/automate-access-token.module';

@Module({
    imports: [
    ReadDbModule,
    SpeakerMergerModule,
    AutomateAccessTokenModule,
    HttpModule,
    ],
    controllers: [GoogleTranslateController],
    providers: [GoogleTranslateCoreService, GoogleTranslateUtilityService, DatabseCommonService],
})
export class GoogleTranslateModule {}
