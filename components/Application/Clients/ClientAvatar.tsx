"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import type { ClientProps } from "@/lib/type";
import { getClientAccountPhotoAction } from "@/lib/queries/client";

export default function ClientAvatar({ client, className = "size-9 rounded-lg" }: {
  client: Pick<ClientProps, "firstName" | "lastName" | "email" | "linkedUserId" | "linkedUser" | "image">;
  className?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const linkedUserId = client.linkedUserId || client.linkedUser?.id;
  const suppliedImage = client.linkedUser?.image || client.image;
  const { data: accountImage } = useQuery({
    queryKey: ["client-account-photo", linkedUserId || client.email?.trim().toLowerCase()],
    queryFn: () => getClientAccountPhotoAction(linkedUserId, client.email),
    enabled: !!(linkedUserId || client.email?.trim()) && !suppliedImage,
    staleTime: 5 * 60 * 1000,
  });
  const image = suppliedImage || accountImage;
  const initials = [client.firstName, client.lastName].map((value) => value?.trim().charAt(0) || "").join("").toLocaleUpperCase("fr") || "C";
  return <div aria-hidden="true" className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-white/5 text-xs font-medium text-white/65 ${className}`}>
    {image && image !== failedUrl ? <Image src={image} alt="" fill sizes="48px" unoptimized className="object-cover" onError={() => setFailedUrl(image)} /> : initials}
  </div>;
}
