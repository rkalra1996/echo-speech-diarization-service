import { Module } from '@nestjs/common';
import { YoutubeDlController } from './controllers/youtube-dl-controller/youtube-dl.controller';
import { YoutubeDlCoreService } from './services/youtube-dl-core/youtube-dl-core.service';
import { YoutubeDlUtilityService } from './services/youtube-dl-utility/youtube-dl-utility.service';
import { FfmpegUtilityService } from './services/ffmpeg-utility/ffmpeg-utility.service';
import { ReadDbModule } from '../read-db/read-db.module';

@Module({
    controllers: [YoutubeDlController],
    imports: [ReadDbModule],
    providers: [YoutubeDlCoreService, YoutubeDlUtilityService, FfmpegUtilityService],
})
export class YoutubeDlModule {}
