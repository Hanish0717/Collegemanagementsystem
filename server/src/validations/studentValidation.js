export const validateStudentInput = (data) => {
  const errors = {};
  if (!data.fullName) errors.fullName = 'Full name is required';
  if (!data.rollNumber) errors.rollNumber = 'Roll number is required';
  if (!data.email) errors.email = 'Email is required';
  if (!data.department) errors.department = 'Department is required';
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};
