import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Patient } from '../patient/patient.entity';
import { Appointment } from '../appointment/appointment.entity';
import { Visit } from '../visit/visit.entity';
import { Users } from '../users/users.entity';
import { AuthRolesGuard } from '../Auth/guards/auth.roles.guard';
import { UsersService } from '../users/users.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, Appointment, Visit, Users]),
    JwtModule.register({}),
    ConfigModule,
    CloudinaryModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService, AuthRolesGuard, UsersService],
})
export class ReportsModule {}