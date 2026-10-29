import { createUploadthing, type FileRouter } from "uploadthing/next";
import {
  finishUpload,
  prepareUpload,
  uploadContextSchema,
} from "@/lib/upload-permits";
const f = createUploadthing();
export const fileRouter = {
  imageUploader: f(
    { image: { maxFileSize: "8MB", maxFileCount: 5 } },
    { presignedURLTTL: "10 minutes", awaitServerData: true },
  )
    .input(uploadContextSchema)
    .middleware(({ files, input }) =>
      prepareUpload("imageUploader", files, input),
    )
    .onUploadComplete(async ({ file, metadata }) => {
      await finishUpload(file, metadata);
      return { uploadedBy: metadata.userId };
    }),
  salonDocuments: f(
    {
      pdf: { maxFileSize: "32MB", maxFileCount: 1 },
      image: { maxFileSize: "32MB", maxFileCount: 1 },
    },
    { presignedURLTTL: "10 minutes", awaitServerData: true },
  )
    .input(uploadContextSchema)
    .middleware(({ files, input }) =>
      prepareUpload("salonDocuments", files, input),
    )
    .onUploadComplete(async ({ file, metadata }) => {
      await finishUpload(file, metadata);
      return { uploadedBy: metadata.userId };
    }),
  consentPdf: f(
    { pdf: { maxFileSize: "8MB", maxFileCount: 1 } },
    { presignedURLTTL: "10 minutes", awaitServerData: true },
  )
    .input(uploadContextSchema)
    .middleware(({ files, input }) => prepareUpload("consentPdf", files, input))
    .onUploadComplete(async ({ file, metadata }) => {
      await finishUpload(file, metadata);
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;
export type OurFileRouter = typeof fileRouter;
