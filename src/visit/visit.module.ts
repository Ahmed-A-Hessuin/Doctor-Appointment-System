import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { VisitService } from './visit.service';
import { VisitController } from './visit.controller';
import { Visit } from './visit.entity';
import { Prescription } from '../visit/prescription/prescription.entity';
import { Patient } from '../patient/patient.entity';
import { Appointment } from '../appointment/appointment.entity';
import { Users } from '../users/users.entity';
import { AuthRolesGuard } from '../Auth/guards/auth.roles.guard';
import { UsersService } from '../users/users.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Visit, Prescription, Patient, Appointment, Users]),
    JwtModule.register({}),
    ConfigModule,
    CloudinaryModule,
  ],
  controllers: [VisitController],
  providers: [VisitService, AuthRolesGuard, UsersService],
  exports: [VisitService],
})
export class VisitModule { }