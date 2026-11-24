import { QueryResult } from "pg";
import IRefreshTokensRepository from "./IRefreshTokensRepository.js";
import { query } from "../../db/index.js";
import RefreshToken from "../../models/RefreshToken.js";

class RefreshTokensRepository implements IRefreshTokensRepository {
    async add(token: string, userId: number): Promise<QueryResult> {
        const result = await query('INSERT INTO refresh_tokens(token, user_id) values($1, $2) RETURNING *', [token, userId]);
        return result;
    }

    async find(token: string): Promise<RefreshToken | null> {
        const { rows } = await query('SELECT * FROM refresh_tokens WHERE token = $1', [token]);
        if (rows.length === 0) return null;
        const row = rows[0];
        return new RefreshToken(row.id, row.token, row.user_id);
    }

    async delete(token: string): Promise<QueryResult> {
        const result = await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
        return result;
    }
}

export default RefreshTokensRepository;