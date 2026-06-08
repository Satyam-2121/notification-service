import { z } from "zod";

export const NotificationSchema = z.object({
  type: z.enum(["email"]),
  to: z.string().email(),
  subject: z.string(),
  message: z.string(),
});

export type NotificationInput =
  z.infer<typeof NotificationSchema>;