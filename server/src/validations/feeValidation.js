export const validateFeeInput = (data) => {
  const errors = {};
  if (!data.student) errors.student = 'Student is required';
  if (!data.feeType) errors.feeType = 'Fee type is required';
  if (data.totalAmount === undefined) errors.totalAmount = 'Total amount is required';
  if (!data.dueDate) errors.dueDate = 'Due date is required';
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};
