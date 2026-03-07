import { app } from './app.js';
import { connectDatabase } from './config/database.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`CropConnect API running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
