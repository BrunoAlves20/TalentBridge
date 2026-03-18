// src/services/auth.ts
import { mockUsers } from '../data/mockData';

export type UserRole = 'user' | 'admin';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

export const authService = {
    // Simula o tempo de resposta da API FastAPI
    async login(email: string, password: string): Promise<User> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = mockUsers.find(u => u.email === email);
                // Em um app real não validaríamos a senha fixa "123456" aqui
                if (user && password === '123456') {
                    resolve(user);
                } else {
                    reject(new Error('Credenciais inválidas. Tente novamente.'));
                }
            }, 1000); // 1 segundo de "loading" para dar sensação de requisição real
        });
    },

    async register(name: string, email: string, password: string, role: UserRole): Promise<User> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Validação mockada
                if (!name || !email || !password) {
                    reject(new Error('Preencha todos os campos obrigatórios.'));
                    return;
                }

                const existingUser = mockUsers.find(u => u.email === email);
                if (existingUser) {
                    reject(new Error('E-mail já cadastrado. Utilize outro e-mail.'));
                } else {
                    const newUser: User = {
                        id: String(mockUsers.length + 1),
                        name,
                        email,
                        role,
                    };
                    mockUsers.push(newUser);
                    resolve(newUser);
                }
            }, 1000); // Sensação de requisição real
        });
    }
};
