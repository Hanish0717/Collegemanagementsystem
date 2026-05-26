export const validateAttendanceInput = (data) => {
  const errors = {};
  if (!data.student) errors.student = 'Student is required';
  if (!data.subject) errors.subject = 'Subject is required';
  if (!data.date) errors.date = 'Date is required';
  if (!data.status) errors.status = 'Status is required';
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};
