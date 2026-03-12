"use client";

import { createContext, useContext, useState } from "react";

type WorkspaceContextType = {
    activeWorkspaceId: string;
    setActiveWorkspaceId: (id: string) => void;
};

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({
    children,
    defaultWorkspaceId,
}: {
    children: React.ReactNode;
    defaultWorkspaceId: string;
}) {
    const [activeWorkspaceId, setActiveWorkspaceId] = useState(defaultWorkspaceId);

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
