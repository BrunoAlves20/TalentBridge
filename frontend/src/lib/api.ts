/**
 * URL base da API FastAPI.
 * Em produção defina NEXT_PUBLIC_API_URL no .env.
 * Em desenvolvimento cai automaticamente para http://127.0.0.1:8000.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
