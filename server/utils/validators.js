const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidMobile = (mobile) => /^[6-9]\d{9}$/.test(String(mobile).trim());

const isNonEmpty = (value) => value !== undefined && value !== null && String(value).trim().length > 0;

module.exports = { isValidEmail, isValidMobile, isNonEmpty };
