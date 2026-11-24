import { QueryResult } from "pg";
import RefreshToken from "../../models/RefreshToken.js";

interface IRefreshTokensRepository {
    add(token: string, userId: number): Promise<QueryResult>;
    find(token: string): Promise<RefreshToken | null>;
    delete(token: string): Promise<QueryResult>;
}

export default IRefreshTokensRepository;