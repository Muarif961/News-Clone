import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as schema from './schema';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pkg;


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.join(__dirname, '..', 'certs', 'rds-ca-bundle.pem')).toString()
  }
});

export const db = drizzle(pool, { schema });

export async function removeSubscribers(subscriberIds: number[]) {
  try {
    for (const id of subscriberIds) {
      await db.delete(schema.subscribers).where(eq(schema.subscribers.id, id));
    }
    return { success: true };
  } catch (error) {
    console.error("Error removing subscribers:", error);
    throw new Error("Failed to remove subscribers");
  }
}
