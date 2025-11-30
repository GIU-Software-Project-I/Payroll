import { Module } from '@nestjs/common';
import { MockIntegrationService } from './mock-integration.service';

@Module({
  providers: [MockIntegrationService],
  exports: [MockIntegrationService],
})
export class IntegrationsModule {}
