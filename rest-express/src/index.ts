import { createApp } from './app.js';
import { initDatabase } from './config/database.js';

const PORT = process.env.PORT || 3000;

// Initialize database
initDatabase();

// Create and start server
const app = createApp();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
});

