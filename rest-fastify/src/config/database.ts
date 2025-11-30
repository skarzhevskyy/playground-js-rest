import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Task } from '../entities/Task.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve data directory path
const dataDir = path.resolve(__dirname, '../../data');

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: path.join(dataDir, 'tasks.db'),
  synchronize: true,
  logging: false,
  entities: [Task],
});

// For testing - in-memory database
export const createTestDataSource = (): DataSource => {
  return new DataSource({
    type: 'better-sqlite3',
    database: ':memory:',
    synchronize: true,
    logging: false,
    entities: [Task],
  });
};

export const initializeDatabase = async (dataSource: DataSource = AppDataSource): Promise<DataSource> => {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  return dataSource;
};

export const closeDatabase = async (dataSource: DataSource = AppDataSource): Promise<void> => {
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
};

