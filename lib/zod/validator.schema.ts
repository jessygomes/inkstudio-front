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
  email: z.string().email(),
  salonName: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  salonHours: z.string().nullable().optional(),
  role: z.enum(["user", "admin"]),
});

//! SALON
export const updateSalonSchema = z.object({
  salonName: z.string().min(2, "Nom requis"),
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  phone: z.string().min(10, "Numéro invalide"),
  address: z.string(),
  city: z.string(),
  postalCode: z.string(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
});

//! TATOUEUR
export const createTatoueurSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  img: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  instagram: z.string().optional(),
  hours: z.string().optional(),
  userId: z.string(),
});

//! RDV
export const appointmentSchema = z.object({
  userId: z.string(),
  title: z.string().min(1, "Le titre est requis."),
  clientName: z.string().min(1, "Le nom et prénom est requis."),
  clientEmail: z.string().email({
    message: "Votre email n'est pas valide.",
  }),
  clientPhone: z.string().optional(),
  clientBirthday: z.date().optional(),
  prestation: z.enum(["TATTOO", "PIERCING", "RETOUCHE", "PROJET", ""]),
  allDay: z.boolean(),
  start: z.string(),
  end: z.string(),
  tatoueurId: z.string(),
  status: z.enum(["PENDING", "CONFIRMED", "DECLINED", "CANCELED"]),
  // champs optionnels pour projet :
  description: z.string().optional(),
  zone: z.string().optional(),
  size: z.string().optional(),
  colorStyle: z.string().optional(),
  reference: z.string().optional(),
  sketch: z.string().optional(),
  estimatedPrice: z.number().optional(),
});

export const updateAppointmentSchema = z.object({
  userId: z.string(),
  title: z.string().min(1, "Le titre est requis."),
  clientName: z.string().min(1, "Le nom et prénom est requis."),
  clientEmail: z.string().email({
    message: "Votre email n'est pas valide.",
  }),
  clientPhone: z.string().optional(),
  clientBirthday: z.date().optional(),
  prestation: z.enum(["TATTOO", "PIERCING", "RETOUCHE", "PROJET"]),
  allDay: z.boolean().default(false),
  start: z.string(),
  end: z.string(),
  tatoueurId: z.string(),
  status: z.enum(["PENDING", "CONFIRMED", "DECLINED", "CANCELED"]),

  // --- Tattoo Details intégrés proprement ---
  tattooDetail: z
    .object({
      description: z.string().optional(),
      zone: z.string().optional(),
      size: z.string().optional(),
      colorStyle: z.string().optional(),
      reference: z.string().optional(),
      sketch: z.string().optional(),
      estimatedPrice: z.number().optional(),
      price: z.number().optional(), // Ajouté ici aussi pour être propre
    })
    .optional(),
});
