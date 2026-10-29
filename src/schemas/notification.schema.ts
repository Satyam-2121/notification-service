import { z } from "zod";

export const NotificationSchema = z.object({
  type: z.enum(["email"]),
  to: z.string().email(),
  subject: z.string().refine((value) => value.trim().length > 0, {
    message: "Subject is required",
  }),
  message: z.string().refine((value) => value.trim().length > 0, {
    message: "Message is required",
  }),
});

export type NotificationInput =
  z.infer<typeof NotificationSchema>;
