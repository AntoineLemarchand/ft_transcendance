import { DataSource } from 'typeorm';
import { environment } from '../utils/environmentParser';
import entities, { Channel, User } from './index';
import { initDataBase1673427329295 } from './migrations/1673427329295-initDataBase';

export default new DataSource({
  type: 'postgres',
  host: environment.DB_HOST,
  port: environment.DB_PORT as number,
  username: environment.DB_USERNAME,
  password: environment.DB_PASSWORD,
  database: environment.DB_NAME,
  entities: [User, Channel],
  migrations: [initDataBase1673427329295],
});
