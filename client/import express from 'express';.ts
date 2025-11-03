import express from 'express';
import cors from 'cors';
import { generateContent, analyzeContent } from './routes/ai';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/ping', (req, res) => {
  res.json({ 
    message: 'Aligned AI server is running', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// AI Routes
app.post('/api/ai/generate', generateContent);
app.post('/api/ai/analyze', analyzeContent);

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Aligned AI server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;
