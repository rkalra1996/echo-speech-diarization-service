import { Module, HttpModule } from '@nestjs/common';
import { YoutubeSearchController } from './controllers/youtube-search/youtube-search.controller';
import { YoutubeSearchCoreService } from './services/youtube-search/youtube-search-core/youtube-search-core.service';
import { YoutubeSearchUtilityService } from './services/youtube-search/youtube-search-utility/youtube-search-utility.service';
import { AutomateAccessTokenModule } from '../automate-access-token/automate-access-token.module';
import { ReadDbModule } from '../read-db/read-db.module';
@Module({
  controllers: [YoutubeSearchController],
  providers: [YoutubeSearchCoreService, YoutubeSearchUtilityService],
imports: [
  HttpModule,
  AutomateAccessTokenModule,
  ReadDbModule,
],

})
export class YoutubeModule {}
