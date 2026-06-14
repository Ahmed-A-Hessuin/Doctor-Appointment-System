import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { Patient } from '../src/patient/patient.entity';
import { Users } from '../src/users/users.entity';
import { Visit } from '../src/visit/visit.entity';
import { Appointment } from '../src/appointment/appointment.entity';
import { Report } from '../src/reports/entities/report.entity';
import { Prescription } from '../src/visit/prescription/prescription.entity';

// dot env config
config({ path: '.env' })

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    url: process.env.DATABASEURL,
    entities: [Patient, Users, Visit, Appointment, Report, Prescription],
    synchronize: true, // في dev فقط
    ssl: {
        rejectUnauthorized: false,
    },
    migrations: ["dist/db/migrations/*.js"]
}

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;