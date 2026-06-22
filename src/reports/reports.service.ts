import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from 'src/patient/patient.entity';
import { Appointment } from 'src/appointment/appointment.entity';
import { Visit } from 'src/visit/visit.entity';
import { Users } from 'src/users/users.entity';
import { ReportFilterDto } from './dto/report-filter.dto';
import { AppointmentStatus, UserType } from 'src/utils/enums';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Visit)
    private readonly visitRepo: Repository<Visit>,
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
  ) { }

  // ─── 1. Patients Report ────────────────────────────────

  public async getPatientsReport(filter: ReportFilterDto) {
    const { startDate, endDate } = filter;

    const [totalPatients, maleCount, femaleCount] = await Promise.all([
      this.patientRepo.count(),
      this.patientRepo.count({ where: { gender: 'male' as any } }),
      this.patientRepo.count({ where: { gender: 'female' as any } }),
    ]);

    // تسجيلات جديدة في الفترة
    let newRegistrations = totalPatients;
    if (startDate || endDate) {
      const qb = this.patientRepo.createQueryBuilder('p');
      if (startDate) qb.andWhere('p.createdAt >= :startDate', { startDate });
      if (endDate) qb.andWhere('p.createdAt <= :endDate', { endDate });
      newRegistrations = await qb.getCount();
    }

    return {
      totalPatients,
      newRegistrations,
      genderBreakdown: { male: maleCount, female: femaleCount, other: totalPatients - maleCount - femaleCount },
    };
  }

  // ─── 2. Appointments Report ────────────────────────────

  public async getAppointmentsReport(filter: ReportFilterDto) {
    const { startDate, endDate } = filter;

    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      this.countAppointments(startDate, endDate),
      this.countAppointments(startDate, endDate, AppointmentStatus.PENDING),
      this.countAppointments(startDate, endDate, AppointmentStatus.CONFIRMED),
      this.countAppointments(startDate, endDate, AppointmentStatus.COMPLETED),
      this.countAppointments(startDate, endDate, AppointmentStatus.CANCELLED),
    ]);

    return {
      total,
      byStatus: { pending, confirmed, completed, cancelled },
      cancellationRate: total > 0 ? +((cancelled / total) * 100).toFixed(2) : 0,
    };
  }

  // ─── 3. Doctors Report ─────────────────────────────────

  public async getDoctorsReport(filter: ReportFilterDto) {
    const { startDate, endDate } = filter;

    const doctors = await this.userRepo.find({
      where: { userType: UserType.DOCTOR },
      select: ['id', 'name', 'speciality'],
    });

    const report = await Promise.all(
      doctors.map(async (doctor) => {
        const [totalVisits, totalAppointments] = await Promise.all([
          this.visitRepo.count({ where: { doctor: { id: doctor.id } } }),
          this.appointmentRepo.count({ where: { doctor: { id: doctor.id } } }),
        ]);

        return {
          doctorId: doctor.id,
          doctorName: doctor.name,
          speciality: doctor.speciality,
          totalVisits,
          totalAppointments,
        };
      }),
    );

    return { doctors: report };
  }

  // ─── 4. Visits Report ──────────────────────────────────

  public async getVisitsReport(filter: ReportFilterDto) {
    const { startDate, endDate } = filter;

    const qb = this.visitRepo.createQueryBuilder('v');
    if (startDate) qb.andWhere('v.visitDate >= :startDate', { startDate });
    if (endDate) qb.andWhere('v.visitDate <= :endDate', { endDate });

    const totalVisits = await qb.getCount();

    // الزيارات لكل يوم
    const visitTrends = await qb
      .select('v.visitDate', 'date')
      .addSelect('COUNT(v.id)', 'count')
      .groupBy('v.visitDate')
      .orderBy('v.visitDate', 'ASC')
      .getRawMany();

    return { totalVisits, visitTrends };
  }

  // ─── Helper ────────────────────────────────────────────

  private async countAppointments(
    startDate?: string,
    endDate?: string,
    status?: AppointmentStatus,
  ) {
    const where: any = {};
    if (status) where.status = status;

    const qb = this.appointmentRepo.createQueryBuilder('a');
    if (status) qb.andWhere('a.status = :status', { status });
    if (startDate) qb.andWhere('a.slotDate >= :startDate', { startDate });
    if (endDate) qb.andWhere('a.slotDate <= :endDate', { endDate });

    return qb.getCount();
  }
}