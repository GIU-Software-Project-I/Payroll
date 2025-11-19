// clearance-checklist-template.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * ClearanceChecklistTemplate
 * - Stores configurable templates for offboarding checklists (e.g., IT assets, ID cards).
 * - US: OFF-006 (HR Manager uses an offboarding checklist)
 * - BR: BR 13(a) checklist required
 *
 * Notes:
 * - Templates are referenced when creating ClearanceInstance documents.
 * - When templates change we keep historical instances unchanged (templates are referenced by id and saved snapshot on instance).
 */

export type ClearanceChecklistTemplateDocument = ClearanceChecklistTemplate & Document & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class ClearanceChecklistTemplate {
    @Prop({ required: true })
        /* why: Human-friendly template name (e.g., "Default Offboarding - Full Time"). */
    name!: string;

    @Prop({ required: false })
        /* why: Optional description for template details and HR notes. */
    description?: string;

    @Prop({
        type: [
            {
                code: { type: String, required: true }, // e.g., "IT_LAPTOP", "ID_CARD"
                title: { type: String, required: true },
                instructions: { type: String, required: false },
                required: { type: Boolean, default: true }, // whether must be signed off
                department: { type: String, required: true }, // e.g., 'IT', 'Finance'
                // optional metadata for asset category or expected return type
            },
        ],
        default: [],
    })
        /* why: Defines the checklist items (OFF-006, BR 13a). */
    items!: {
        code: string;
        title: string;
        instructions?: string;
        required?: boolean;
        department: string;
    }[];

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    })
        /* why: Template author for accountability (auditability). */
    createdBy!: Types.ObjectId;

    @Prop({ type: Boolean, default: true })
        /* why: Templates may be deactivated but kept historically (Phase requirement). */
    isActive!: boolean;
}

export const ClearanceChecklistTemplateSchema = SchemaFactory.createForClass(ClearanceChecklistTemplate);