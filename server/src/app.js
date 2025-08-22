import express from 'express';
import cors from 'cors';
import apiRouter from './api/routes/index.js';
import globalErrorHandler from './middleware/errorHandler.js';

// Create the Express app
const app = express();

// --- Global Middleware ---
// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors());
// Parse incoming JSON payloads
app.use(express.json());
// Parse URL-encoded payloads
app.use(express.urlencoded({ extended: true }));


// --- API Routes ---
// A simple health-check route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the API! Server is healthy.'
  });
});

// All API routes will be prefixed with /api/v1
app.use('/api/v1', apiRouter);


// --- Not Found and Error Handling ---
// Handle 404 Not Found for any other route
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Use the global error handler
app.use(globalErrorHandler);

export default app;