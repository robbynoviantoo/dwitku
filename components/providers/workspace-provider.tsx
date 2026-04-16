"use client";

import { createContext, useContext, useState } from "react";

type WorkspaceContextType = {
    activeWorkspaceId: string | null;
    setActiveWorkspaceId: (id: string | null) => void;
};

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({
    children,
    defaultWorkspaceId = null,
}: {
    children: React.ReactNode;
    defaultWorkspaceId?: string | null;
}) {
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(defaultWorkspaceId);

    return (
        <WorkspaceContext.Provider value={{ activeWorkspaceId, setActiveWorkspaceId }}>
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    const ctx = useContext(WorkspaceContext);
    if (!ctx) throw new Error("useWorkspace harus digunakan di dalam WorkspaceProvider");
    return ctx;
}
