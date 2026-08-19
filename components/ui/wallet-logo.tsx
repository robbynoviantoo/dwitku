"use client";

import React, { useState } from "react";
import { getWalletProvider } from "@/lib/wallet-providers";
import { Building2, Wallet as WalletIcon, Banknote, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WalletLogoProps {
  providerCode?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function WalletLogo({ providerCode, className, size = "md" }: WalletLogoProps) {
  const provider = getWalletProvider(providerCode);
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: "w-6 h-6 text-[9px] rounded-lg",
    md: "w-9 h-9 text-xs rounded-xl",
    lg: "w-12 h-12 text-sm rounded-2xl",
    xl: "w-14 h-14 text-base rounded-2xl",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
    xl: "w-7 h-7",
  };

  // Modern text / icon fallback if image is not in public/banks
  const renderFallbackVisual = () => {
    switch (provider.code) {
      case "bca":
        return <span className="font-black tracking-tighter text-white">BCA</span>;
      case "mandiri":
        return <span className="font-extrabold tracking-tight text-[#ffb700]">mandiri</span>;
      case "bri":
        return <span className="font-black tracking-tight text-white">BRI</span>;
      case "bni":
        return <span className="font-black tracking-wider text-white">BNI</span>;
      case "bsi":
        return <span className="font-black tracking-tight text-white">BSI</span>;
      case "jago":
        return <span className="font-black tracking-tight text-[#fbbb00]">jago</span>;
      case "seabank":
        return <span className="font-bold tracking-tight text-white">Sea</span>;
      case "gopay":
        return <span className="font-bold tracking-tight text-white">go<span className="text-white/80">pay</span></span>;
      case "ovo":
        return <span className="font-black tracking-widest text-white">OVO</span>;
      case "dana":
        return <span className="font-extrabold tracking-wider text-white">DANA</span>;
      case "shopeepay":
        return <span className="font-bold tracking-tight text-white">Shopee</span>;
      case "linkaja":
        return <span className="font-black tracking-tight text-white">Link!</span>;
      case "cash":
        return <Banknote className={iconSizes[size]} />;
      case "brankas":
        return <WalletIcon className={iconSizes[size]} />;
      default:
        if (provider.type === "BANK") return <Building2 className={iconSizes[size]} />;
        if (provider.type === "EWALLET") return <WalletIcon className={iconSizes[size]} />;
        if (provider.type === "CASH") return <Banknote className={iconSizes[size]} />;
        return <HelpCircle className={iconSizes[size]} />;
    }
  };

  const hasImage = provider.code && !imgError && provider.code !== "cash" && provider.code !== "brankas";

  return (
    <div
      style={{
        backgroundColor: hasImage ? "transparent" : provider.logoBg,
        color: provider.logoColor,
      }}
      className={cn(
        "flex items-center justify-center font-bold",
        sizeClasses[size],
        className
      )}
      title={provider.name}
    >
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/banks/${provider.code}.svg`}
          alt={provider.name}
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      ) : (
        renderFallbackVisual()
      )}
    </div>
  );
}
