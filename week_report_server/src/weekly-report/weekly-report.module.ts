import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeeklyReport } from './entities/weekly-report.entity';
import { WeeklyReportService } from './weekly-report.service';
import { WeeklyReportController } from './weekly-report.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WeeklyReport])],
  controllers: [WeeklyReportController],
  providers: [WeeklyReportService],
  exports: [WeeklyReportService],
})
export class WeeklyReportModule {}
