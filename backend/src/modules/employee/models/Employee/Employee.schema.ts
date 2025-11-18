import {User} from "./User.schema";
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Roles} from "./User-Role";

@Schema()
export class Employee extends User {
    // BR-5: Unique ID for entities
    @Prop({ required: true, unique: true })
    employeeId!: string; // human-friendly unique employee number

    @Prop({required: true})
    department?: string;

    @Prop()
    jobTitle!: string;

    @Prop()
    dateOfHire!: Date;

    @Prop()
    managerId!: string;

    // ROLES & ACCESS (US-E7-05, BR-20a)
    @Prop({type: String, enum: Object.values(Roles), index: true})
    roles!: Roles.EMPLOYEE; // used for RBAC, e.g., EMPLOYEE, MANAGER, HR, SYS_ADMIN

}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);