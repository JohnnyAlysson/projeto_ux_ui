// auth.js
export let currentUser = null;

export function login(username, password) {
    return fetch('data/usuarios.json')
        .then(response => response.json())
        .then(users => {
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                currentUser = user;
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUser', JSON.stringify(user));
                console.log("sucessfull login")
                return user;
            }
            console.log("login inválido")
            throw new Error('Usuário ou senha inválidos');
        });
}

export function logout() {
    currentUser = null;
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
}

export function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

export function getCurrentUser() {
    if (isLoggedIn()) {
        if (!currentUser) {
            currentUser = JSON.parse(localStorage.getItem('currentUser'));
        }
        return currentUser;
    }
    return null;
}

export function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}