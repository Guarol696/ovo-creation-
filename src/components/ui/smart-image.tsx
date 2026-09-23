"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * next/image avec apparition en fondu et masquage automatique si l'image
 * ne charge pas : le fond (dégradé) du parent reste alors visible.
 */
export function SmartImage({ className, alt, onLoad, onError, ...props }: ImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  if (status === "error") return null;

  return (
    <Image
      alt={alt}
      className={cn(
        "transition-opacity duration-700 ease-out",
        status === "loaded" ? "opacity-100" : "opacity-0",
        className,
      )}
      onLoad={(event) => {
        setStatus("loaded");
        onLoad?.(event);
      }}
      onError={(event) => {
        setStatus("error");
        onError?.(event);
      }}
      {...props}
    />
  );
}
