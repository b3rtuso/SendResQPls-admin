export interface PasswordChecks {
  length: boolean;
  hasNumber: boolean;
  hasUpper: boolean;
  hasLower: boolean;
}

export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
  checks: PasswordChecks;
}

/**
 * Standard password complexity requirements:
 * - At least 8 characters
 * - At least 1 number (0-9)
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 */
export const checkPasswordCriteria = (password: string): PasswordChecks => {
  const p = password || '';
  return {
    length: p.length >= 8,
    hasNumber: /\d/.test(p),
    hasUpper: /[A-Z]/.test(p),
    hasLower: /[a-z]/.test(p),
  };
};

export const validatePassword = (password: string | undefined | null): PasswordValidationResult => {
  if (!password) {
    return {
      valid: false,
      error: 'Password is required.',
      checks: { length: false, hasNumber: false, hasUpper: false, hasLower: false },
    };
  }

  const checks = checkPasswordCriteria(password);
  const valid = checks.length && checks.hasNumber && checks.hasUpper && checks.hasLower;

  if (valid) {
    return { valid: true, checks };
  }

  const missing: string[] = [];
  if (!checks.length) missing.push('at least 8 characters');
  if (!checks.hasNumber) missing.push('at least one number (0-9)');
  if (!checks.hasUpper) missing.push('at least one uppercase letter (A-Z)');
  if (!checks.hasLower) missing.push('at least one lowercase letter (a-z)');

  const error = `Password must have ${missing.join(', ')}.`;

  return { valid: false, error, checks };
};
