import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class TerminationBenefit extends Document {
  @Prop({ required: true })
  name: string; // End-of-service benefit, etc.

  @Prop({ required: true })
  calculationMethod: string; 
  // Example: "1 month salary per year worked"
}

export const TerminationBenefitSchema = SchemaFactory.createForClass(TerminationBenefit);
