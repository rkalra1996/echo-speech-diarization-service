"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const read_vis_db_controller_1 = require("./controllers/read-vis-db/read-vis-db.controller");
const databse_common_service_1 = require("./services/database-common-service/databse-common/databse-common.service");
let ReadDbModule = class ReadDbModule {
};
ReadDbModule = __decorate([
    common_1.Module({
        controllers: [read_vis_db_controller_1.ReadVisDbController],
        providers: [databse_common_service_1.DatabseCommonService],
    })
], ReadDbModule);
exports.ReadDbModule = ReadDbModule;
//# sourceMappingURL=read-db.module.js.map