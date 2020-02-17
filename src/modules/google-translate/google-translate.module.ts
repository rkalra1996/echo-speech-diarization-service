import { Module, HttpModule } from '@nestjs/common';
import { GoogleTranslateController } from './controllers/google-translate/google-translate.controller';
import { GoogleTranslateUtilityService } from './services/google-translate-utility/google-translate-utility.service';
import { GoogleTranslateCoreService } from './services/google-translate-core/google-translate-core.service';
import { DatabseCommonService } from '../read-db/services/database-common-service/databse-common/databse-common.service';
import { ReadDbModule } from './../read-db/read-db.module';
import { SpeakerMergerModule } from './../speaker-merger/speaker-merger.module';
import { AutomateAccessTokenModule } from '../automate-access-token/automate-access-token.module';
import { GoogleCloudModule } from '../google-cloud/google-cloud.module';
import { GoogleCloudEventHandlerService } from '../google-cloud/event-handler/google-cloud-event-handler/google-cloud-event-handler.service';
import { GoogleCloudEventUtilityService } from '../google-cloud/event-handler/services/google-cloud-event-utility/google-cloud-event-utility.service';

@Module({
    imports: [
    ReadDbModule,
    SpeakerMergerModule,
    AutomateAccessTokenModule,
    GoogleCloudModule,
    HttpModule,
    ],
    controllers: [GoogleTranslateController],
    providers: [GoogleTranslateCoreService, GoogleTranslateUtilityService, DatabseCommonService, GoogleCloudEventUtilityService, GoogleCloudEventHandlerService],
})
export class GoogleTranslateModule {}
