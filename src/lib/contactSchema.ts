import { z } from 'zod';

/** Sentinel `service` value that reveals the free-text "what do you need?" field. */
export const OTHER_SERVICE = 'Something else';

export const contactSchema = z
  .object({
    name: z.string().trim().min(2, 'Please enter your full name.'),
    phone: z
      .string()
      .trim()
      .regex(/^[\d\s()+-]{7,20}$/, 'Enter a valid phone number.'),
    // z.string().email() is soft-deprecated in favor of the top-level z.email(),
    // but that form validates before trimming and rejects padded input (e.g. a
    // stray trailing space from autofill). Keep trim-then-validate order.
    email: z.string().trim().email('Enter a valid email address.'),
    city: z.string().trim().min(2, 'Please enter your city.'),
    service: z.string().min(1, 'Please select a service.'),
    // Only meaningful (and only required) when service === OTHER_SERVICE;
    // enforced in superRefine below since Zod objects can't make one field's
    // requiredness conditional on a sibling field declaratively.
    otherService: z.string().trim().max(80, 'Keep it under 80 characters.').optional(),
    message: z.string().trim().min(10, 'Tell us a bit more about the issue (10+ characters).')
  })
  .superRefine((data, ctx) => {
    if (data.service === OTHER_SERVICE && !data.otherService?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['otherService'], message: 'Tell us what you need help with.' });
    }
  });

export type ContactFormValues = z.infer<typeof contactSchema>;
