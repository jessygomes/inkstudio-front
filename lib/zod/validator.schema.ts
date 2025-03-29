import * as z from "zod";

//! USER
export const userLoginSchema = z.object({
  email: z.string().email({
    message: "Un email valide est requis.",
  }),
  password: z.string().min(1, "Le mot de passe est requis."),
  code: z.optional(z.string()), // Pour Auhtentification à deux facteurs
});

export const userRegisterSchema = z
  .object({
    name: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    // lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email({
      message: "Votre email n'est pas valide.",
    }),
    password: z
      .string()
      .min(6, "Votre mot de passe doit contenir au moins 6 caractères."),
    passwordConfirmation: z.string(),
  })
  .superRefine(({ passwordConfirmation, password }, ctx) => {
    if (passwordConfirmation !== password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vos mots de passe ne correspondent pas.",
        path: ["passwordConfirmation"],
      });
    }
  });

export const tokenSchema = z.object({
  token: z.string(),
});

export const getAuthenticatedUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.enum(["admin", "user"]),
});
