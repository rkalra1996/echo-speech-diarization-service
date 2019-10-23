import { Module } from '@nestjs/common';
import { GcRawToJsonController } from './controllers/gc-raw-to-json/gc-raw-to-json.controller';
import { GcRawService } from './services/gc-raw/gc-raw.service';

@Module({
    controllers: [GcRawToJsonController],
    providers: [GcRawService],
})
export class GcJsonParserModule {}
