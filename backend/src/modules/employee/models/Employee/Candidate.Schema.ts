import {Prop, SchemaFactory} from "@nestjs/mongoose";
import { HydratedDocument, Schema, Types } from "mongoose";
import {User} from "./User.schema";
import {Roles} from "./User-Role";


export type CandidateDocument = HydratedDocument<Candidate>;


export class Candidate extends User {

    @Prop({ type: Types.ObjectId, ref: 'Application', required: true })
    ApplicationId!: Types.ObjectId;

@Prop({ required: true })
    resumeFileName!: string; // Original resume file name

    @Prop({ required: true })
    resumeFileUrl!: string; // Path to stored resume file

    @Prop()
   Offer?: boolean; // Original cover letter file name

    @Prop({type:Types.ObjectId, ref:'Offer'})
    OfferId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'JobRequisition', required: true })
    JobRequisitionId?: Types.ObjectId;

    @Prop({type:Types.ObjectId, ref:'Position'})
    roleAppliedFor?:Types.ObjectId;

    @Prop()
    role!: Roles.CANDIDATE;

}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);