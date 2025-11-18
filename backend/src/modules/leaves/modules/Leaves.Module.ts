import {Module} from "@nestjs/common";
import {LeaveController} from "../controllers/leave.controller";
import {LeavesService} from "../services/Leaves-Service";

@Module({

    controllers: [LeaveController],
    providers: [LeavesService],
    exports: [],
})
export class LeavesModule {}
