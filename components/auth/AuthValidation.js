export const validateEmail = (email) => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
};
export const validatePassword = (password) => {
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regexPassword.test(password);
};
export const getFieldValidationError = (email, password) => {
    if (!email || !password) {
        return 'Informe o e-mail e senha.';
    }

    if (!validateEmail(email)) {
        return 'E-mail inválido';
    }

    if (!validatePassword(password)) {
        return 'A senha deve conter no mínimo 8 caracteres, letra maiúscula, minúscula, número e símbolo';
    }

    return '';
};
export const translateFirebaseError = (errorCode) => {
    const errorMessages = {
        'auth/invalid-credential': 'E-mail ou senha inválidos',
        'auth/user-not-found': 'Usuário não encontrado',
        'auth/wrong-password': 'Senha incorreta',
        'auth/invalid-email': 'E-mail inválido',
        'auth/user-disabled': 'Usuário desativado',
        'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.'
    };
    
    return errorMessages[errorCode] || 'Erro no login. Tente novamente.';
};