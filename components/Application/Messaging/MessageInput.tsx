import React, { useState, useRef } from "react";
import { MdSend, MdImage, MdClose } from "react-icons/md";
import { useUploadThing } from "@/lib/utils/uploadthing";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { AttachmentDto } from "@/lib/queries/conversation.action";

interface MessageInputProps {
  onSendMessage: (
    message: string,
    attachments?: AttachmentDto[]
  ) => Promise<void>;
  className?: string;
  onInputChange?: (value: string) => void;
  disabled?: boolean;
}

export default function MessageInput({
  onSendMessage,
  className = "",
  onInputChange,
}: // disabled = false,
MessageInputProps) {
  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressionError, setCompressionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onClientUploadComplete: (res: { url: string; key: string }[]) => {
      setUploadProgress(100);
    },
    onUploadProgress: (p: number) => setUploadProgress(p),
    onUploadError: (error: Error) => {
      console.error("Upload error:", error);
      setUploadProgress(0);
    },
  });

  const handleFileSelect = (file: File) => {
    // Vérifier que c'est une image
    if (!file.type.startsWith("image/")) {
      setCompressionError("Veuillez sélectionner une image valide");
      return;
    }

    // Vérifier la taille (max 15MB avant compression)
    if (file.size > 15 * 1024 * 1024) {
      setCompressionError("L'image ne doit pas dépasser 15MB");
      return;
    }

    setCompressionError(null);
    // Compresser et créer aperçu
    compressAndPreview(file);
  };

  const compressAndPreview = async (file: File) => {
    try {
      setCompressionError(null);

      // 1ère tentative : qualité 0.8, max 1920x1920, max 3MB
      let compressed = await imageCompression(file, {
        maxSizeMB: 3,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.8,
      });

      // Si > 3MB, 2e tentative : qualité 0.6, max 1280x1280
      if (compressed.size > 3 * 1024 * 1024) {
        compressed = await imageCompression(file, {
          maxSizeMB: 3,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
          fileType: "image/webp",
          initialQuality: 0.6,
        });
      }

      // Si toujours > 3MB, 3e tentative : qualité 0.4, max 1024x1024
      if (compressed.size > 3 * 1024 * 1024) {
        compressed = await imageCompression(file, {
          maxSizeMB: 3,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
          fileType: "image/webp",
          initialQuality: 0.4,
        });
      }

      // Si toujours > 3MB, erreur
      if (compressed.size > 3 * 1024 * 1024) {
        const sizeMB = (compressed.size / (1024 * 1024)).toFixed(2);
        setCompressionError(
          `Image trop grande (${sizeMB}MB). Veuillez sélectionner une image plus petite ou de meilleure qualité.`
        );
        return;
      }

      setSelectedFile(compressed);

      // Créer aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(compressed);
    } catch (error) {
      console.error("Erreur lors de la compression:", error);
      setCompressionError("Erreur lors du traitement de l'image");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreview(null);
    setCompressionError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() && !selectedFile) return;

    setSendingMessage(true);
    try {
      let attachments = undefined;

      // Upload l'image si présente
      if (selectedFile) {
        setUploadProgress(0);
        const uploadRes = await startUpload([selectedFile]);

        if (uploadRes && uploadRes[0]) {
          attachments = [
            {
              id: crypto.randomUUID(),
              fileName: selectedFile.name,
              fileUrl: uploadRes[0].url,
              fileType: selectedFile.type,
              fileSize: selectedFile.size,
              uploadThingKey: uploadRes[0].key,
            },
          ];
        }
      }

      // Envoyer le message avec les attachements
      await onSendMessage(messageInput.trim(), attachments);

      // Réinitialiser
      setMessageInput("");
      removeImage();
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    } finally {
      setSendingMessage(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
        {/* Aperçu de l'image ou message d'erreur */}
        {preview && !compressionError && (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-noir-700">
            <Image src={preview} alt="Aperçu" fill className="object-cover" />
            <button
              type="button"
              onClick={removeImage}
              disabled={sendingMessage || isUploading}
              className="cursor-pointer absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
            >
              <MdClose />
            </button>
          </div>
        )}

        {/* Message d'erreur de compression */}
        {compressionError && (
          <div className="bg-red-900/40 border border-red-500/50 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <svg
                className="w-4 h-4 text-red-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-200 text-xs font-one truncate">
                {compressionError}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCompressionError(null)}
              className="text-red-400 hover:text-red-300 flex-shrink-0"
            >
              <MdClose className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Barre de progression upload */}
        {(isUploading || uploadProgress > 0) && (
          <div className="w-full bg-white/20 rounded-full h-1">
            <div
              className="bg-tertiary-400 rounded-full transition-all duration-300 h-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Zone input */}
        <div
          className="flex gap-2"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Bouton image */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sendingMessage || isUploading}
            className="cursor-pointer bg-noir-700 border border-white/20 hover:border-tertiary-400 text-tertiary-500 hover:text-tertiary-300 px-2 py-1.5 rounded transition-colors flex items-center justify-center text-xs flex-shrink-0"
            title="Ajouter une image"
          >
            <MdImage className="w-4 h-4" />
          </button>

          {/* Input file caché */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            disabled={sendingMessage || isUploading}
            className="hidden"
          />

          {/* Input texte */}
          <input
            type="text"
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              onInputChange?.(e.target.value);
            }}
            placeholder={
              preview ? "Votre message avec l'image..." : "Message..."
            }
            className="flex-1 bg-noir-700 border border-white/20 rounded px-3 py-1.5 text-white placeholder-white/50 focus:outline-none focus:border-tertiary-400/50 transition-colors text-xs"
            disabled={sendingMessage || isUploading}
          />

          {/* Bouton envoi */}
          <button
            type="submit"
            disabled={
              sendingMessage ||
              isUploading ||
              (!messageInput.trim() && !selectedFile)
            }
            className="cursor-pointer bg-tertiary-500 hover:bg-tertiary-600 disabled:bg-tertiary-500/50 text-white px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1 text-xs flex-shrink-0"
          >
            {sendingMessage || isUploading ? (
              <div className="w-3 h-3 border-2 border-white/50 rounded-full animate-spin border-t-white"></div>
            ) : (
              <MdSend className="w-3 h-3" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
