## no need to create a subdirectory here , every subsystem just create their schema  , for example 
 - payroll-run.schema.ts
 - payroll-config.schema.ts

 ```ts 
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'your-collection-name' }) 
``` 
