"use client";

import React, { createContext, useContext, useState, useRef } from "react";

interface ModalContextProps {
  alert: (message: string) => Promise<void>;
  confirm: (message: string) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"alert" | "confirm">("alert");
  const [message, setMessage] = useState("");
  const resolveRef = useRef<((value: any) => void) | null>(null);

  const alert = (msg: string): Promise<void> => {
    setMessage(msg);
    setType("alert");
    setIsOpen(true);
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  };

  const confirm = (msg: string): Promise<boolean> => {
    setMessage(msg);
    setType("confirm");
    setIsOpen(true);
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  };

  const handleResolve = (value: boolean) => {
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(value);
      resolveRef.current = null;
    }
  };

  return (
    <ModalContext.Provider value={{ alert, confirm }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-[fadeIn_0.2s_ease-out]" 
            onClick={() => type === "alert" && handleResolve(true)}
          />
          
          {/* Modal Content */}
          <div className="bg-card border border-border/40 text-foreground max-w-sm w-full p-8 relative z-10 rounded-none shadow-2xl flex flex-col space-y-6 animate-[scaleIn_0.2s_ease-out]">
            <div className="space-y-2">
              <span className="font-sans text-[9px] uppercase tracking-widest text-secondary font-bold block">
                {type === "confirm" ? "Tindakan Diperlukan" : "Pesan Studio"}
              </span>
              <h3 className="font-serif text-lg font-medium text-primary leading-tight">
                SENIMAN_KAMERA
              </h3>
              <p className="font-sans text-xs text-secondary font-light leading-relaxed">
                {message}
              </p>
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              {type === "confirm" && (
                <button
                  type="button"
                  onClick={() => handleResolve(false)}
                  className="px-4 py-2.5 bg-transparent border border-border hover:bg-neutral-100 dark:hover:bg-neutral-900 text-primary font-sans text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-none"
                >
                  Batal
                </button>
              )}
              <button
                type="button"
                onClick={() => handleResolve(true)}
                className="px-5 py-2.5 bg-primary text-primary-foreground hover:opacity-90 font-sans text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
