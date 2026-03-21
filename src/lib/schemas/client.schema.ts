import { z } from 'zod';

export const createClientSchema = z.object({
  firstName: z.string().min(2, 'Min 2 characters').max(50, 'Max 50 characters'),
  lastName: z.string().min(2, 'Min 2 characters').max(50, 'Max 50 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(7, 'Invalid phone number'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
    country: z.string().optional(),
  }),
  occupation: z.string().max(100).optional(),
  monthlyIncome: z.number().min(0).optional(),
  creditScore: z.number().min(300, 'Min 300').max(850, 'Max 850').optional(),
  employmentYears: z.number().min(0).optional(),
  debtToIncomeRatio: z.number().min(0).max(1).optional(),
  notes: z.string().max(500).optional(),
});

export type CreateClientFormValues = z.infer<typeof createClientSchema>;

export const updateClientSchema = createClientSchema.partial();
export type UpdateClientFormValues = z.infer<typeof updateClientSchema>;
