"use client";
import React, { useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";

export const Search = () => {
  const router = useRouter();

  const [query, setQuery] = useState("");

  // Utliser le hook useSearchParams pour récupérer les paramètres de l'url pour la recherche
  const searchParams = useSearchParams();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      let newUrl = "";
      if (query) {
        newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: query,
        });
      } else {
        newUrl = removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: ["query"],
        });
      }

      router.push(newUrl, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, searchParams, router]);

  return (
    <div className="">
      <input
        type="text"
        placeholder="Rechercher..."
        onChange={(e) => setQuery(e.target.value)}
        className="text-sm text-white placeholder:text-white/30 placeholder:text-xs py-1 px-4 min-w-[200px] max-w-[400px] font-one border-b-[1px] border-white"
      />
    </div>
  );
};
