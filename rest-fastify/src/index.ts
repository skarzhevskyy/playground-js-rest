import { buildApp } from './app.js';
import { initializeDatabase, AppDataSource } from './config/database.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

const start = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    console.log('Database initialized successfully');

    // Build and start the app
    const app = await buildApp({ dataSource: AppDataSource });

    await app.listen({ port: PORT, host: HOST });
    console.log(`Server is running on http://${HOST}:${PORT}`);
    console.log(`API Documentation: http://${HOST}:${PORT}/api-docs`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();

