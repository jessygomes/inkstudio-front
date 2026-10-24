"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { PortfolioProps } from "@/lib/type";
import { portfolioSchema, portfolioBatchSchema } from "@/lib/zod/validator.schema";
import { ImagePlus, FileText, Save, LoaderCircle } from "lucide-react";
import FormSectionHeader from "@/components/Shared/FormSectionHeader";
import SideFormDrawer from "@/components/Shared/SideFormDrawer";
import DashboardButton from "@/components/Shared/DashboardButton";
import SalonImageUploader from "@/components/Application/MonCompte/SalonImageUploader";
import BatchPhotoUploader from "./BatchPhotoUploader";
import { extractKeyFromUrl } from "@/lib/utils/uploadImg/extractKeyFromUrl";
import {
  createOrUpdatePortfolioAction,
  createPortfolioBatchAction,
  getPortfolioCategoriesAction,
  suggestPortfolioStylesAction,
  type PortfolioCategoryDto,
  type PortfolioStyleSuggestions,
} from "@/lib/queries/portfolio";
import { PortfolioTatoueurDto } from "@/lib/queries/portfolio";

const EMPTY_SUGGESTIONS: PortfolioStyleSuggestions = {
  suggestions: [],
  canCreate: false,
  exactMatch: false,
  didYouMean: null,
};

const PIECE_SIZE_OPTIONS = [
  { value: "SMALL", label: "Petite pièce" },
  { value: "MEDIUM", label: "Moyenne pièce" },
  { value: "LARGE", label: "Grosse pièce" },
] as const;

const normalizeHashtags = (tags: string[]): string[] =>
  Array.from(
    new Set(
      tags
        .map((tag) => tag.trim().replace(/^#+/, "").toLowerCase())
        .filter((tag) => tag.length > 0)
    )
  );


export default function CreateOrUpdatePhoto({
  onCreate,
  tatoueurs,
  existingPhoto,
  sourcePhoto,
  setIsOpen = () => {},
}: {
  onCreate: () => void;
  tatoueurs: PortfolioTatoueurDto[];
  existingPhoto?: PortfolioProps | null;
  sourcePhoto?: { id: string; url: string };
  setIsOpen?: (isOpen: boolean) => void;
}) {
  const { data: session } = useSession();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false); // Nouvel état pour le loader d'annulation
  const [initialImageUrl] = useState(existingPhoto?.imageUrl || sourcePhoto?.url || ""); // Stocker l'URL initiale
  const [styleInput, setStyleInput] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestions, setSuggestions] =
    useState<PortfolioStyleSuggestions>(EMPTY_SUGGESTIONS);
  const [hashtagInput, setHashtagInput] = useState("");
  const [batchUrls, setBatchUrls] = useState<string[]>([]);
  const [categories, setCategories] = useState<PortfolioCategoryDto[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const sharedSourceUrl = sourcePhoto?.url || (existingPhoto?.appointmentPhotoId ? existingPhoto.imageUrl : undefined);
  const isBatch = !existingPhoto && !sourcePhoto;
  const isUserTatoueur =
    session?.user?.role?.toLowerCase() === "user_tatoueur";
  const uniqueTatoueur = useMemo(
    () => (tatoueurs.length === 1 ? tatoueurs[0] : undefined),
    [tatoueurs]
  );

  const getTatoueurDisplayName = (tatoueur?: {
    name?: string | null;
    salonName?: string | null;
    role?: string | null;
  } | null) => {
    if (!tatoueur) return "";

    const isUserSalon = tatoueur.role?.toLowerCase() === "user_salon";
    if (isUserSalon && tatoueur.salonName?.trim()) {
      return tatoueur.salonName;
    }

    return tatoueur.name || tatoueur.salonName || "";
  };

  const normalizeStyles = (styles: string[]): string[] => {
    return Array.from(
      new Set(
        styles
          .map((style) => style.trim())
          .filter((style) => style.length > 0)
      )
    );
  };

  const addStyle = (name: string) => {
    const merged = normalizeStyles([...(form.getValues("style") || []), name]);
    form.setValue("style", merged, { shouldValidate: true });
    setStyleInput("");
    setSuggestOpen(false);
  };

  useEffect(() => {
    const q = styleInput.trim();
    if (!q) {
      setSuggestions(EMPTY_SUGGESTIONS);
      return;
    }
    let active = true;
    const timer = setTimeout(() => {
      suggestPortfolioStylesAction(q).then((result) => {
        if (active) setSuggestions(result);
      });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [styleInput]);

  const addStylesFromInput = () => {
    const parsedStyles = styleInput
      .split(",")
      .map((style) => style.trim())
      .filter((style) => style.length > 0);

    if (parsedStyles.length === 0) {
      return;
    }

    const mergedStyles = normalizeStyles([
      ...(form.getValues("style") || []),
      ...parsedStyles,
    ]);

    form.setValue("style", mergedStyles, { shouldValidate: true });
    setStyleInput("");
  };

  const removeStyle = (styleToRemove: string) => {
    const nextStyles = (form.getValues("style") || []).filter(
      (style) => style !== styleToRemove
    );
    form.setValue("style", nextStyles, { shouldValidate: true });
  };

  const form = useForm<z.infer<typeof portfolioSchema>>({
    resolver: (!isBatch
      ? zodResolver(portfolioSchema)
      : zodResolver(portfolioBatchSchema)) as unknown as Resolver<
      z.infer<typeof portfolioSchema>
    >,
    defaultValues: {
      title: existingPhoto?.title || (sourcePhoto ? "Réalisation" : ""),
      description: existingPhoto?.description || "",
      imageUrl: existingPhoto?.imageUrl || sourcePhoto?.url || "",
      tatoueurId: existingPhoto?.tatoueurId || "",
      style: existingPhoto?.style || [],
      pieceSize: existingPhoto?.pieceSize || undefined,
      categoryIds: existingPhoto?.categories?.map((c) => c.id) || [],
      hashtags: existingPhoto?.hashtags || [],
    },
  });

  const toggleCategory = (id: string) => {
    const current = form.getValues("categoryIds") || [];
    form.setValue(
      "categoryIds",
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
      { shouldDirty: true }
    );
  };

  useEffect(() => {
    let active = true;
    getPortfolioCategoriesAction().then((list) => {
      if (active) {
        setCategories(list);
        setCategoriesLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const addHashtagsFromInput = () => {
    const parsed = hashtagInput.split(/[,\s]+/);
    if (normalizeHashtags(parsed).length === 0) {
      setHashtagInput("");
      return;
    }
    form.setValue(
      "hashtags",
      normalizeHashtags([...(form.getValues("hashtags") || []), ...parsed]),
      { shouldValidate: true }
    );
    setHashtagInput("");
  };

  const removeHashtag = (tag: string) => {
    form.setValue(
      "hashtags",
      (form.getValues("hashtags") || []).filter((t) => t !== tag),
      { shouldValidate: true }
    );
  };

  useEffect(() => {
    if (!existingPhoto && isUserTatoueur && uniqueTatoueur?.id) {
      form.setValue("tatoueurId", uniqueTatoueur.id, {
        shouldValidate: true,
        shouldDirty: false,
      });
    }
  }, [existingPhoto, form, isUserTatoueur, uniqueTatoueur?.id]);

  // Fonction pour supprimer une image d'UploadThing
  const deleteFromUploadThing = async (imageUrl: string): Promise<boolean> => {
    try {
      const key = extractKeyFromUrl(imageUrl);
      if (!key) {
        console.warn("⚠️ Impossible d'extraire la clé de l'URL:", imageUrl);
        return false;
      }

      const response = await fetch("/api/uploadthing/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log("✅ Image supprimée avec succès d'UploadThing");
        return true;
      } else {
        console.error("❌ Erreur lors de la suppression:", result);
        return false;
      }
    } catch (error) {
      console.error("❌ Erreur lors de la suppression d'UploadThing:", error);
      return false;
    }
  };

  // Fonction de fermeture avec nettoyage
  const handleClose = async () => {
    const currentImageUrl = form.watch("imageUrl");

    if (isBatch && batchUrls.length > 0) {
      setIsClosing(true);
      try {
        const keys = batchUrls
          .map((url) => extractKeyFromUrl(url))
          .filter((key): key is string => Boolean(key));
        await Promise.all(keys.map((key) =>
          fetch("/api/uploadthing/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key }),
          }).catch(() => null)
        ));
      } finally {
        setIsClosing(false);
      }
      setIsOpen(false);
      return;
    }

    // Si une nouvelle image a été uploadée (différente de l'image initiale), la supprimer
    if (currentImageUrl && currentImageUrl !== initialImageUrl) {
      setIsClosing(true); // Activer le loader

      try {
        const deleted = await deleteFromUploadThing(currentImageUrl);

        if (deleted) {
          toast.success("Image temporaire supprimée");
        } else {
          console.warn("⚠️ Impossible de supprimer l'image temporaire");
        }
      } catch (error) {
        console.error(
          "❌ Erreur lors de la suppression de l'image temporaire:",
          error
        );
      } finally {
        setIsClosing(false); // Désactiver le loader
      }
    }

    setIsOpen(false);
  };

  const onSubmit = async (data: z.infer<typeof portfolioSchema>) => {
    setLoading(true);
    setError("");
    setSuccess("");

    const url = existingPhoto
      ? `${process.env.NEXT_PUBLIC_BACK_URL}/portfolio/${existingPhoto.id}`
      : `${process.env.NEXT_PUBLIC_BACK_URL}/portfolio`;

    try {
      const resolvedTatoueurId = isUserTatoueur
        ? data.tatoueurId || uniqueTatoueur?.id
        : data.tatoueurId;

      if (isBatch) {
        if (batchUrls.length === 0) {
          setError("Ajoutez au moins une photo.");
          return;
        }
        if (!data.pieceSize) {
          setError("Choisissez une taille de pièce.");
          return;
        }
      }

      const result = isBatch
        ? await createPortfolioBatchAction({
            pieceSize: data.pieceSize!,
            categoryIds: data.categoryIds || [],
            style: normalizeStyles(data.style || []),
            hashtags: normalizeHashtags(data.hashtags || []),
            tatoueurId: resolvedTatoueurId || undefined,
            photos: batchUrls.map((imageUrl) => ({ imageUrl })),
          })
        : await createOrUpdatePortfolioAction(
            {
              ...data,
              ...(sourcePhoto ? { appointmentPhotoId: sourcePhoto.id, imageUrl: sourcePhoto.url } : {}),
              tatoueurId: resolvedTatoueurId ? resolvedTatoueurId : undefined,
              style: normalizeStyles(data.style || []),
              hashtags: normalizeHashtags(data.hashtags || []),
            },
            existingPhoto ? "PUT" : "POST",
            url
          );

      // Vérifier si c'est une erreur de limite SaaS
      if (result.error) {
        if (
          result.message &&
          result.message.includes("Limite d'images portfolio atteinte")
        ) {
          setError("SAAS_LIMIT");
        } else {
          setError(result.message || "Une erreur est survenue.");
        }
        return;
      }

      if (!result.ok) {
        setError("Une erreur est survenue côté serveur.");
        return;
      }

      setSuccess(result.message || "Photo enregistrée avec succès !");
      toast.success(
        isBatch
          ? `${batchUrls.length} photo(s) ajoutée(s) avec succès !`
          : "Photo enregistrée avec succès !"
      );
      form.reset();
      setBatchUrls([]);
      onCreate();
      setIsOpen(false);
    } catch (error) {
      console.error("Erreur:", error);
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SideFormDrawer category="Portfolio" title={existingPhoto ? "Modifier une photo" : isBatch ? "Ajouter des photos" : "Ajouter une photo"} description="Ajoutez un visuel et les informations qui permettront de découvrir votre travail." onClose={handleClose} busy={loading || isClosing} footer={<>

            <DashboardButton className="!min-w-0 !rounded-xl !shadow-none"
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading || isClosing}
            >
              {isClosing ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  <span>Annulation...</span>
                </>
              ) : (
                "Annuler"
              )}
            </DashboardButton>
            <DashboardButton className="!min-w-0 !rounded-xl !shadow-none"
              type="submit"
              form="portfolio-create-update-form"
              disabled={loading || isClosing}
            >
              {loading ? <LoaderCircle size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
              {loading
                ? "Enregistrement..."
                : existingPhoto
                ? "Modifier la photo"
                : isBatch && batchUrls.length > 1
                ? `Ajouter ${batchUrls.length} photos`
                : "Ajouter la photo"}
            </DashboardButton>
          
    </>}>
<form
              id="portfolio-create-update-form"
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate className="space-y-4"
            >
              {!isBatch && (
              <div className="min-w-0 rounded-2xl border border-white/10 bg-noir-600 p-3.5">
                <FormSectionHeader compact eyebrow="01 · Visuel" title="Votre réalisation" description="Montrez les détails de votre travail avec une photo nette." icon={<ImagePlus size={18} />} />

                {sharedSourceUrl ? <div className="relative mx-auto h-48 w-full max-w-sm overflow-hidden rounded-xl bg-black/20 sm:h-56"><Image src={sharedSourceUrl} alt="Photo du rendez-vous à ajouter au portfolio" fill sizes="(max-width: 640px) 90vw, 384px" unoptimized className="object-contain" /></div> : (
                <SalonImageUploader compact
                  appearance="media"
                  currentImage={
                    form.watch("imageUrl") || undefined
                  }
                  onImageUpload={(imageUrl) => {
                    form.setValue("imageUrl", imageUrl);
                  }}
                  onImageRemove={async () => {
                    const currentImageUrl = form.watch("imageUrl");

                    // Si ce n'est pas l'image initiale, essayer de la supprimer d'UploadThing
                    if (
                      currentImageUrl &&
                      currentImageUrl !== initialImageUrl
                    ) {
                      try {
                        await deleteFromUploadThing(currentImageUrl);
                        // console.log(
                        //   "✅ Image supprimée lors du retrait manuel"
                        // );
                      } catch (error) {
                        console.error(
                          "❌ Erreur lors de la suppression manuelle:",
                          error
                        );
                      }
                    }

                    form.setValue("imageUrl", "");
                  }}
                />
                )}

                {form.formState.errors.imageUrl && (
                  <p className="mt-2 text-xs text-red-300 font-one">
                    {form.formState.errors.imageUrl.message}
                  </p>
                )}
              </div>
              )}

              {isBatch && (
                <div className="min-w-0 rounded-2xl border border-white/10 bg-noir-600 p-3.5">
                  <FormSectionHeader compact eyebrow="01 · Visuels" title="Vos réalisations" description="Ajoutez autant de photos que vous le souhaitez (50 max). Elles recevront toutes les informations ci-dessus." icon={<ImagePlus size={18} />} />
                  <BatchPhotoUploader
                    urls={batchUrls}
                    onChange={setBatchUrls}
                    disabled={loading}
                  />
                </div>
              )}

              <div className="min-w-0 rounded-2xl border border-white/10 bg-noir-600 p-3.5">
                <FormSectionHeader compact eyebrow={isBatch ? "02 · Informations communes" : "02 · Présentation"} title={isBatch ? "Définissez votre lot" : "Présentez ce tatouage"} description={isBatch ? "Ces informations seront appliquées à toutes les photos du lot." : "Ajoutez un titre, son artiste et les styles qui le caractérisent."} icon={<FileText size={18} />} />

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="portfolio-piece-size" className="mb-1.5 block text-xs font-medium text-white/65 font-one">
                      Taille de la pièce {isBatch ? "" : "(optionnelle)"}
                    </label>
                    <select
                      id="portfolio-piece-size"
                      {...form.register("pieceSize", {
                        setValueAs: (v) => (v === "" ? undefined : v),
                      })}
                      className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3 py-2.5 text-sm text-white outline-none transition focus:border-tertiary-400/45 focus:ring-2 focus:ring-tertiary-400/10 font-two"
                    >
                      <option value="" className="bg-noir-500">
                        Choisir une taille
                      </option>
                      {PIECE_SIZE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="bg-noir-500">
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.pieceSize && (
                      <p className="mt-1 text-xs text-red-300 font-one">
                        {form.formState.errors.pieceSize.message}
                      </p>
                    )}
                  </div>

                  {categoriesLoading && (
                    <div className="space-y-1" aria-live="polite">
                      <span className="mb-1.5 block text-xs font-medium text-white/65 font-one">
                        Catégories (optionnel)
                      </span>
                      <div className="flex items-center gap-2 text-xs text-white/50 font-one">
                        <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
                        Chargement des catégories...
                      </div>
                    </div>
                  )}

                  {!categoriesLoading && categories.length > 0 && (
                    <div className="space-y-1">
                      <span className="mb-1.5 block text-xs font-medium text-white/65 font-one">
                        Catégories (optionnel)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {categories.map((cat) => {
                          const selected = (form.watch("categoryIds") || []).includes(cat.id);
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => toggleCategory(cat.id)}
                              className={`cursor-pointer rounded-lg border px-2.5 py-1 text-[11px] transition-colors font-one ${
                                selected
                                  ? "border-tertiary-400/60 bg-tertiary-500/20 text-white"
                                  : "border-white/12 bg-white/5 text-white/65 hover:bg-white/10"
                              }`}
                            >
                              {cat.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!isBatch && (
                  <div className="space-y-1">
                    <label htmlFor="portfolio-title" className="mb-1.5 block text-xs font-medium text-white/65 font-one">
                      Titre du tatouage
                    </label>
                    <input id="portfolio-title" aria-invalid={Boolean(form.formState.errors.title)}
                      placeholder="Donnez un titre à votre tatouage"
                      {...form.register("title")}
                      className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/45 focus:ring-2 focus:ring-tertiary-400/10 font-two"
                    />
                    {form.formState.errors.title && (
                      <p className="mt-1 text-xs text-red-300 font-one">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>
                  )}

                  <div className="space-y-1">
                    <label className="mb-1.5 block text-xs font-medium text-white/65 font-one">
                      Tatoueur {isUserTatoueur ? "(automatique)" : "(optionnel)"}
                    </label>
                    {isUserTatoueur ? (
                      <>
                        <input
                          value={
                            session?.user?.salonName ||
                            getTatoueurDisplayName(uniqueTatoueur) ||
                            "Tatoueur du compte"
                          }
                          readOnly
                          className="w-full rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white/85 focus:outline-none font-one"
                        />
                        <p className="text-[10px] text-white/55 font-one">
                          Cette oeuvre sera rattachée automatiquement à votre
                          compte tatoueur.
                        </p>
                      </>
                    ) : (
                      <select
                        {...form.register("tatoueurId")}
                        className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3 py-2.5 text-sm text-white outline-none transition focus:border-tertiary-400/45 focus:ring-2 focus:ring-tertiary-400/10 font-two"
                      >
                        <option value="" className="bg-noir-500">
                          Aucun tatoueur assigné
                        </option>
                        {tatoueurs.map((tatoueur) => (
                          <option
                            key={tatoueur.id}
                            value={tatoueur.id}
                            className="bg-noir-500"
                          >
                            {getTatoueurDisplayName(tatoueur)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="mb-1.5 block text-xs font-medium text-white/65 font-one">
                      Styles (optionnel)
                    </label>

                    <div className="relative flex items-center gap-2">
                      <input
                        aria-label="Ajouter un style" value={styleInput}
                        onChange={(event) => {
                          setStyleInput(event.target.value);
                          setSuggestOpen(true);
                        }}
                        onFocus={() => setSuggestOpen(true)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === ",") {
                            event.preventDefault();
                            addStylesFromInput();
                            setSuggestOpen(false);
                          } else if (event.key === "Escape") {
                            setSuggestOpen(false);
                          }
                        }}
                        onBlur={() => setSuggestOpen(false)}
                        autoComplete="off"
                        placeholder="Ex: Blackwork, Fine Line, Réaliste"
                        className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/45 focus:ring-2 focus:ring-tertiary-400/10 font-two"
                      />
                      <button
                        type="button"
                        onClick={addStylesFromInput}
                        className="cursor-pointer inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-white/12 bg-white/8 px-3 text-[11px] font-medium text-white/85 transition-colors hover:bg-white/12 font-one"
                      >
                        Ajouter
                      </button>

                      {suggestOpen && styleInput.trim().length > 0 && (
                        <ul
                          role="listbox"
                          className="absolute left-0 right-16 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-white/12 bg-noir-700 py-1 shadow-xl"
                        >
                          {suggestions.didYouMean && !suggestions.exactMatch && (
                            <li>
                              <button
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => addStyle(suggestions.didYouMean!)}
                                className="w-full cursor-pointer px-3 py-2 text-left text-xs text-tertiary-300 hover:bg-white/10 font-one"
                              >
                                Vouliez-vous dire « {suggestions.didYouMean} » ?
                              </button>
                            </li>
                          )}
                          {suggestions.suggestions
                            .filter((s) => s.name !== suggestions.didYouMean)
                            .map((s) => (
                              <li key={s.id ?? s.name}>
                                <button
                                  type="button"
                                  role="option"
                                  aria-selected={false}
                                  onMouseDown={(event) => event.preventDefault()}
                                  onClick={() => addStyle(s.name)}
                                  className="w-full cursor-pointer px-3 py-2 text-left text-xs text-white hover:bg-white/10 font-one"
                                >
                                  {s.name}
                                </button>
                              </li>
                            ))}
                          {suggestions.canCreate && (
                            <li>
                              <button
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => addStyle(styleInput.trim())}
                                className="w-full cursor-pointer px-3 py-2 text-left text-xs text-tertiary-400 hover:bg-white/10 font-one"
                              >
                                Ajouter « {styleInput.trim()} »
                              </button>
                            </li>
                          )}
                        </ul>
                      )}
                    </div>

                    {(form.watch("style") || []).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {(form.watch("style") || []).map((style) => (
                          <span
                            key={style}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white font-one"
                          >
                            {style}
                            <button
                              type="button"
                              onClick={() => removeStyle(style)}
                              className="cursor-pointer text-tertiary-200/75 hover:text-tertiary-100"
                              aria-label={`Retirer le style ${style}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {form.formState.errors.style && (
                      <p className="mt-1 text-xs text-red-300 font-one">
                        {form.formState.errors.style.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="portfolio-hashtags" className="mb-1.5 block text-xs font-medium text-white/65 font-one">
                      Hashtags (optionnel)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="portfolio-hashtags"
                        value={hashtagInput}
                        onChange={(event) => setHashtagInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === ",") {
                            event.preventDefault();
                            addHashtagsFromInput();
                          }
                        }}
                        onBlur={addHashtagsFromInput}
                        placeholder="Ex: #blackwork, #fineline"
                        className="w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/45 focus:ring-2 focus:ring-tertiary-400/10 font-two"
                      />
                      <button
                        type="button"
                        onClick={addHashtagsFromInput}
                        className="cursor-pointer inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-white/12 bg-white/8 px-3 text-[11px] font-medium text-white/85 transition-colors hover:bg-white/12 font-one"
                      >
                        Ajouter
                      </button>
                    </div>
                    {(form.watch("hashtags") || []).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {(form.watch("hashtags") || []).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/8 px-2 py-1 text-[11px] text-white font-one"
                          >
                            #{tag}
                            <button
                              type="button"
                              onClick={() => removeHashtag(tag)}
                              className="cursor-pointer text-white/60 hover:text-white"
                              aria-label={`Retirer le hashtag ${tag}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {!isBatch && (
                  <div className="space-y-1">
                    <label htmlFor="portfolio-description" className="mb-1.5 block text-xs font-medium text-white/65 font-one">
                      Description (optionnelle)
                    </label>
                    <textarea id="portfolio-description" aria-invalid={Boolean(form.formState.errors.description)}
                      placeholder="Décrivez votre œuvre, le style, la technique utilisée..."
                      {...form.register("description")}
                      rows={3}
                      className="h-24 w-full resize-y rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-white placeholder:text-white/35 focus:border-tertiary-400/40 focus:outline-none font-one"
                    />
                    {form.formState.errors.description && (
                      <p className="mt-1 text-xs text-red-300 font-one">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>
                  )}
                </div>
              </div>

              {error && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-400/5 p-3"><p className="text-xs leading-5 text-red-200">{error === "SAAS_LIMIT" ? "La limite de votre abonnement est atteinte." : error}</p>{error === "SAAS_LIMIT" && <DashboardButton href="/parametres" variant="secondary" className="mt-3 !min-w-0 !rounded-lg !text-[11px]">Voir mon abonnement</DashboardButton>}</div>}

              {success && (
                <div role="status" className="rounded-xl border border-emerald-500/40 bg-emerald-500/14 p-3">
                  <p className="text-xs text-emerald-300 font-one">{success}</p>
                </div>
              )}
            </form>
    </SideFormDrawer>
  );
}
