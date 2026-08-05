import { z } from "zod";

// Shared zod schemas — used by both client (react-hook-form) and server actions.

/** Honeypot + min-time-on-form guard for all public forms (Part 9.5). */
export const antiSpam = {
  website: z.string().max(0).optional(), // honeypot: must stay empty
  _ts: z.coerce.number().optional(), // form render timestamp (ms)
};

export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  source: z.string().optional(),
  ...antiSpam,
});

export const contactSchema = z.object({
  name: z.string().min(2, "Please tell us your name"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  reason: z.enum([
    "order_issue",
    "product_question",
    "wholesale_enquiry",
    "academy",
    "community_access",
    "returns",
    "press",
    "other",
  ]),
  order_number: z.string().optional(),
  message: z.string().min(10, "Please add a little more detail"),
  ...antiSpam,
});

export const productRequestSchema = z.object({
  name: z.string().min(2, "Please tell us your name"),
  email: z.string().email("Enter a valid email address"),
  product_description: z.string().min(5, "Describe the product you'd like us to stock"),
  category_hint: z.string().optional(),
  quantity_interest: z.string().optional(),
  source_page: z.string().optional(),
  ...antiSpam,
});

export const storySchema = z.object({
  name: z.string().min(2, "Please tell us your name"),
  email: z.string().email("Enter a valid email address"),
  story: z.string().min(20, "Tell us a little more about your story"),
  consent: z.literal(true, { errorMap: () => ({ message: "Please confirm consent to share" }) }),
  ...antiSpam,
});

export const academySchema = z.object({
  name: z.string().min(2, "Please tell us your name"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  current_situation: z.string().min(5, "Tell us where you're starting from"),
  experience_level: z.enum(["none", "some", "experienced"]),
  goals: z.string().min(5, "What do you want to achieve?"),
  ...antiSpam,
});

export const trackOrderSchema = z.object({
  order_number: z.string().min(3, "Enter your order number"),
  email: z.string().email("Enter the email on the order"),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ProductRequestInput = z.infer<typeof productRequestSchema>;
export type StoryInput = z.infer<typeof storySchema>;
export type AcademyInput = z.infer<typeof academySchema>;
