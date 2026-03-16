// // src/services/auth.ts
// import { mockUsers } from '../data/mockData';

// export type UserRole = 'user' | 'admin';

// export interface User {
//     id: string;
//     name: string;
//     email: string;
//     role: UserRole;
// }

// export const authService = {
//     // Simula o tempo de resposta da API FastAPI
//     async login(email: string, password: string): Promise<User> {
//         return new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 const user = mockUsers.find(u => u.email === email);
//                 // Em um app real não validaríamos a senha fixa "123456" aqui
//                 if (user && password === '123456') {
//                     resolve(user);
//                 } else {
//                     reject(new Error('Credenciais inválidas. Tente novamente.'));
//                 }
//             }, 1000); // 1 segundo de "loading" para dar sensação de requisição real
//         });
//     },

//     async register(name: string, email: string, password: string, role: UserRole): Promise<User> {
//         return new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 // Validação mockada
//                 if (!name || !email || !password) {
//                     reject(new Error('Preencha todos os campos obrigatórios.'));
//                     return;
//                 }

//                 const existingUser = mockUsers.find(u => u.email === email);
//                 if (existingUser) {
//                     reject(new Error('E-mail já cadastrado. Utilize outro e-mail.'));
//                 } else {
//                     const newUser: User = {
//                         id: String(mockUsers.length + 1),
//                         name,
//                         email,
//                         role,
//                     };
//                     mockUsers.push(newUser);
//                     resolve(newUser);
//                 }
//             }, 1000); // Sensação de requisição real
//         });
//     }
// };

// src/services/auth.ts
import { mockUsers } from '../data/mockData';

// 1. CORREÇÃO DAS LINHAS VERMELHAS: Atualizamos os papéis para o padrão do Banco de Dados
export type UserRole = 'CANDIDATO' | 'RECRUTADOR';

export interface User {
    id: string | number; // Agora o ID pode ser um número (vindo do MySQL)
    name: string;
    email: string;
    role: UserRole;
}

const API_URL = "http://127.0.0.1:8000";

export const authService = {
    // LOGIN: Conectado na nossa API Python
    async login(email: string, password: string): Promise<User> {
        try {
            const response = await fetch(`${API_URL}/usuarios/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    senha: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Erro ao fazer login");
            }

            // Mapeia o retorno do Python para o formato que o seu Frontend espera
            return {
                id: data.usuario.id,
                name: data.usuario.nome,
                email: data.usuario.email,
                role: data.usuario.tipo_usuario
            };
        } catch (error: any) {
            console.error("Erro no login:", error);
            throw error;
        }
    },

    // REGISTRO: Conectado na nossa API Python (FastAPI)
    async register(name: string, email: string, password: string, role: UserRole): Promise<{ mensagem: string, id: number }> {
        try {
            const response = await fetch(`${API_URL}/usuarios/cadastro`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: name,
                    email: email,
                    senha: password,
                    tipo_usuario: role
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // Pega a mensagem de erro exata que mandamos lá do Python
                throw new Error(data.detail || "Erro ao cadastrar usuário");
            }

            return data; // O Python retorna: { mensagem: "...", id: 1 }
        } catch (error: any) {
            console.error("Erro no registro:", error);
            throw error;
        }
    }
};