import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { Patient } from './patient.entity';
import { Users } from '../users/users.entity';
import { AuthRolesGuard } from '../Auth/guards/auth.roles.guard';
import { UsersService } from '../users/users.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Appointment } from '../appointment/appointment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, Users, Appointment]),
    JwtModule.register({}),
    ConfigModule,
    CloudinaryModule,
  ],
  controllers: [PatientController],
  providers: [PatientService, AuthRolesGuard, UsersService],
  exports: [PatientService],
})
export class PatientModule { }