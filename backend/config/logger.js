import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// JSON Log Format with Timestamps
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

// 1. General Application Logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: jsonFormat,
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, 'combined.log') }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// 2. Auth Audit Logger (auth.log - JSON format with IP, timestamp, and event details)
export const authLogger = winston.createLogger({
  level: 'info',
  format: jsonFormat,
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, 'auth.log') }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ip, email, event }) => {
          return `[AUTH AUDIT] ${timestamp} [${level}] Event: ${event || message} | User: ${email || 'N/A'} | IP: ${ip || 'N/A'}`;
        })
      ),
    }),
  ],
});

// 3. System Error Logger (error.log - JSON format with stack traces)
export const errorLogger = winston.createLogger({
  level: 'error',
  format: jsonFormat,
  transports: [
    new winston.transports.File({ filename: path.join(logsDir, 'error.log') }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export default logger;
