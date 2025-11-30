import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { TaskModule } from './task/task.module';
import { HealthController } from './health.controller';

@Module({
  imports: [PrismaModule, TaskModule],
  controllers: [HealthController],
})
export class AppModule {}

