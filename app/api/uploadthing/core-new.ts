import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const fileRouter = {
  imageUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      // Pour l'instant, on autorise tout le monde
      return { userId: "salon-user" };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof fileRouter;
