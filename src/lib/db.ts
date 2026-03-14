import { Pool, neonConfig } from "@neondatabase/serverless";

neonConfig.fetchConnectionCache = true;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default pool;
