export const validateRegisterInput = (data) => {
  const errors = {};
  if (!data.fullName) errors.fullName = 'Full name is required';
  if (!data.email) errors.email = 'Email is required';
  if (!data.password) errors.password = 'Password is required';
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

export const validateLoginInput = (data) => {
  const errors = {};
  if (!data.email) errors.email = 'Email is required';
  if (!data.password) errors.password = 'Password is required';
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};
