import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

/* ==========================================================================
   DATABASE NETWORK ISOLATION & ARCHITECTURE REQUIREMENT:
   - In production environments, PostgreSQL must bind strictly to internal VPC IPs
     (never 0.0.0.0 public internet).
   - Port 5432 must be firewalled off, accepting traffic exclusively from internal Node.js hosts.
   ========================================================================== */

const isSsl = process.env.DATABASE_SSL === 'true' || 
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('sslmode=require') || process.env.DATABASE_URL.includes('neon.tech')));

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/kingsol_db',
  ssl: isSsl ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL pool error:', err.message);
});

export default pool;
