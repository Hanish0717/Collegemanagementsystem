import { z } from 'zod';

export const menuSchema = z.object({
  meal_date: z.string().min(1, 'Date is required'),
  meal_type: z.enum(['Breakfast','Lunch','Snacks','Dinner']),
  food_items: z.array(z.string()).optional(),
});

export const residentSchema = z.object({
  resident_id: z.string().min(1, 'Student ID is required'),
  resident_name: z.string().min(1, 'Name is required'),
  hostel_block: z.string().optional(),
  room_number: z.string().optional(),
});

export const feePaymentSchema = z.object({
  id: z.string().uuid().or(z.string()),
  amount: z.preprocess((val) => Number(val), z.number().positive('Amount must be > 0')),
});

export type MenuInput = z.infer<typeof menuSchema>;
export type ResidentInput = z.infer<typeof residentSchema>;
export type FeePaymentInput = z.infer<typeof feePaymentSchema>;

export default {
  menuSchema,
  residentSchema,
  feePaymentSchema,
};
