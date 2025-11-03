import express from 'express';
import cors from 'cors';

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Required API endpoints per AGENTS.md
  app.get('/api/ping', (req, res) => {
    res.json({ message: 'pong', timestamp: new Date().toISOString() });
  });

  app.get('/api/demo', (req, res) => {
    res.json({ 
      message: 'Demo endpoint working',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  });

  return app;
}
