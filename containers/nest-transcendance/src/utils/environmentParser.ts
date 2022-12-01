import { parse } from 'dotenv';
import { readFileSync } from 'fs';

export interface Environment {
  JWT_SECRET_PASSWORD: string;
}

export const environment: Environment = parse(readFileSync('local.env')) as any;
