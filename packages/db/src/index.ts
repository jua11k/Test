import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Evaluado en lazy mode y provee fallback según Reglas
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dummy';
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
export * from './schema';
