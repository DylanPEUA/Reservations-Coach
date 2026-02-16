// Valider le format email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Valider la force du mot de passe (minimum 6 caractères)
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Valider le rôle
const isValidRole = (role) => {
  return ['client', 'coach'].includes(role);
};

// Valider les données d'inscription
const validateRegisterData = (email, password, role, firstName, lastName) => {
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Email invalide');
  }

  if (!password || !isValidPassword(password)) {
    errors.push('Le mot de passe doit contenir au moins 6 caractères');
  }

  if (!role || !isValidRole(role)) {
    errors.push('Rôle invalide (client ou coach)');
  }

  if (!firstName || firstName.trim().length === 0) {
    errors.push('Le prénom est requis');
  }

  if (!lastName || lastName.trim().length === 0) {
    errors.push('Le nom est requis');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Valider les données de connexion
const validateLoginData = (email, password) => {
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Email invalide');
  }

  if (!password) {
    errors.push('Le mot de passe est requis');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidRole,
  validateRegisterData,
  validateLoginData,
};