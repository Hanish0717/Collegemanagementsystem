export interface FeeRecord {
  _id?: string;
  student?: string;
  feeType: string;
  academicYear?: string;
  semester?: number;
  totalAmount: number | string;
  paidAmount?: number;
  remainingAmount?: number;
  dueDate: string | Date;
  status?: string;
  paymentStatus?: 'pending' | 'paid' | 'partial' | 'overdue';
  paymentMethod?: string;
  transactionId?: string;
}
