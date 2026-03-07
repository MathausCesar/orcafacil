export function formatDocument(value: string, type: 'cpf' | 'cnpj'): string {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')

    if (type === 'cpf') {
        // 000.000.000-00
        return numbers
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1') // Limita a 14 caracteres (incluindo pontuação)
    } else {
        // 00.000.000/0000-00
        return numbers
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1') // Limita a 18 caracteres
    }
}

export function validateCPF(cpf: string): boolean {
    const numbers = cpf.replace(/\D/g, '');

    if (numbers.length !== 11) return false;

    // Check for known invalid CPFs (all same numbers)
    if (/^(\d)\1{10}$/.test(numbers)) return false;

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
        sum = sum + parseInt(numbers.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(numbers.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum = sum + parseInt(numbers.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(numbers.substring(10, 11))) return false;

    return true;
}

export function validateCNPJ(cnpj: string): boolean {
    const numbers = cnpj.replace(/\D/g, '');

    if (numbers.length !== 14) return false;

    // Check for known invalid CNPJs (all same numbers)
    if (/^(\d)\1{13}$/.test(numbers)) return false;

    let length = numbers.length - 2;
    let baseDigits = numbers.substring(0, length);
    const verifierDigits = numbers.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(baseDigits.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(verifierDigits.charAt(0))) return false;

    length = length + 1;
    baseDigits = numbers.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(baseDigits.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(verifierDigits.charAt(1))) return false;

    return true;
}

export function validateDocument(value: string, type: 'cpf' | 'cnpj'): boolean {
    if (!value) return true; // Optional fields return true when empty
    return type === 'cpf' ? validateCPF(value) : validateCNPJ(value);
}
