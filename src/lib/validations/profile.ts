import { z } from "zod";

export const ProfileFormSchema = z.object({
  availabilityStatus: z.enum(["AVAILABLE", "NOT_AVAILABLE"]),
  hoursPerWeek: z.number().min(0).max(168).optional(),
  teamSize: z.enum([
    "Open_TO_ANY",
    "Less_Than_5",
    "Less_Than_10",
    "Less_Than_20",
    "More_Than_20",
  ]),
  techStack: z.array(
    z.object({
      label: z.string(),
      value: z.string().toLowerCase(), // Match Tech.name which is stored lowercase
    }),
  ),
  teamRoles: z.array(
    z.object({
      label: z.string(), 
      value: z.string().toLowerCase(), // Match TeamRole.name which is stored lowercase
    }),
  ),
  projectDomains: z.array(
    z.object({
      label: z.string(),
      value: z.string().toLowerCase(), // Match ProjectDomain.name which is stored lowercase
    }),
  ),
});