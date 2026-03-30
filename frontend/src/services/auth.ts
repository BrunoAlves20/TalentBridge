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

// frontend/src/services/auth.ts

const API_URL = "http://127.0.0.1:8000";

// 1. Mudamos para o padrão que o Banco de Dados aceita
export type UserRole = 'CANDIDATO' | 'RECRUTADOR';

export interface User {
    id: string | number;
    name: string;
    email: string;
    role: UserRole;
    onboarding_completo?: boolean;
}

export const authService = {
    // LOGIN
    async login(email: string, password: string): Promise<User> {
        const response = await fetch(`${API_URL}/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha: password })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Erro ao fazer login");

        return {
            id: data.usuario.id,
            name: data.usuario.nome,
            email: data.usuario.email,
            role: data.usuario.role,
            onboarding_completo: data.usuario.onboarding_completo
        };
    },

    // CADASTRO
    async register(name: string, email: string, password: string, role: UserRole) {
        const response = await fetch(`${API_URL}/usuarios/cadastro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: name, email, senha: password, tipo_usuario: role })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Erro ao cadastrar usuário");

        return data; // O backend devolve: { mensagem: "...", id: 1 }
    }
};