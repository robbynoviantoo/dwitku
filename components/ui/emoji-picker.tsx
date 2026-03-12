"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import data from "@emoji-mart/data";

// Lazy load emoji picker to avoid SSR issues
const EmojiPicker = dynamic(
    () => import("@emoji-mart/react").then((mod) => mod.default),
    { ssr: false, loading: () => <div className="p-4 text-sm text-zinc-400">Memuat...</div> }
);

type Props = {
    value: string;
    onChange: (emoji: string) => void;
};

export function EmojiPickerButton({ value, onChange }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-12 h-12 text-2xl rounded-xl border-2 border-zinc-200 hover:border-indigo-400 bg-zinc-50 hover:bg-indigo-50 flex items-center justify-center transition-colors"
                title="Pilih emoji"
            >
                {value}
            </button>
            {open && (
                <div className="absolute z-50 top-14 left-0 shadow-2xl rounded-xl overflow-hidden border border-zinc-200">
                    <EmojiPicker
                        data={data}
                        onEmojiSelect={(emoji: { native: string }) => {
                            onChange(emoji.native);
                            setOpen(false);
                        }}
                        theme="light"
                        locale="id"
                        previewPosition="none"
                        skinTonePosition="none"
                    />
                </div>
            )}
        </div>
    );
}
