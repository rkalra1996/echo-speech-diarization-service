import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NetworkParserModule } from './modules/network-parser/network-parser.module';
import { CommonRequestValidatorService } from './services/shared/common-request-validator/common-request-validator.service';
import { GcJsonParserModule } from './modules/gc-json-parser/gc-json-parser.module';

@Module({
  imports: [NetworkParserModule, GcJsonParserModule],
  controllers: [AppController],
  providers: [AppService, CommonRequestValidatorService],
})
export class AppModule {}
