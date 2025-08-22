import app from './app.js';
import 'dotenv/config';
import connectDB from './config/database.js'; // 1. Import the function

// Connect to the database before starting the server
connectDB(); // 2. Call the function

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`   - Environment: ${process.env.NODE_ENV}`);
  console.log(`   - Local: http://localhost:${PORT}`);
});