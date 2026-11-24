import { Pool } from 'pg';

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	max: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
});

export const query = async (text: string, params: any[]) => {
	return await pool.query(text, params);
};