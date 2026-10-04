import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, RefreshCcw } from 'lucide-react';

interface AffirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shouldFetch: boolean;
  turnId: number;
}

export function AffirmationModal({ open, onOpenChange }: AffirmationModalProps) {
  // Query is enabled only when the modal opens and shouldFetch is true
  const data = { text: "You are enough, exactly as you are today." };
  const isLoading = false;
  const isError = false;
  const refetch = () => undefined;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
        <Dialog.Content 
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] -translate-y-[50%] gap-4 p-6 sm:p-10 duration-500 animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
          aria-describedby={data ? "affirmation-description" : undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            document.getElementById('machine-handle')?.focus();
          }}
        >
          <div className="relative bg-[#f9f6f0] text-[#3a2a22] p-10 sm:p-14 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-[6px] border-[#d9b359] flex flex-col items-center justify-center min-h-[300px] text-center max-w-md mx-auto overflow-hidden">
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\\"0 0 200 200\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cfilter id=\\"noiseFilter\\"%3E%3CfeTurbulence type=\\"fractalNoise\\" baseFrequency=\\"0.85\\" numOctaves=\\"3\\" stitchTiles=\\"stitch\\"/%3E%3C/filter%3E%3Crect width=\\"100%25\\" height=\\"100%25\\" filter=\\"url(%23noiseFilter)\\"/%3E%3C/svg%3E")' }} />
            
            <Dialog.Title className="sr-only">Your Affirmation</Dialog.Title>
            
            <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-[150px]">
              {isLoading && (
                <div className="flex flex-col items-center gap-6 text-[#8a7a6b] animate-pulse">
                  <div className="w-12 h-12 rounded-full border-4 border-[#e8dfd5] border-t-[#df5d38] animate-spin" />
                  <p className="font-serif italic text-xl tracking-wide">Unfolding...</p>
                </div>
              )}

              {isError && (
                <div className="flex flex-col items-center gap-6 text-[#df5d38]">
                  <p className="font-serif text-xl tracking-wide">The paper got stuck.</p>
                  <button 
                    onClick={() => refetch()}
                    className="flex items-center gap-2 bg-[#d9b359] text-[#3a2a22] px-5 py-2.5 rounded-full hover:brightness-105 transition-all font-medium"
                  >
                    <RefreshCcw size={18} /> Try again
                  </button>
                </div>
              )}

              {!isLoading && !isError && data && (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out flex flex-col items-center">
                  <div className="w-8 h-px bg-[#d9b359] mb-8" />
                  <p id="affirmation-description" className="font-serif text-2xl sm:text-3xl leading-relaxed text-[#3a2a22]" style={{ fontVariationSettings: '"opsz" 32' }}>
                    "{data.text}"
                  </p>
                  <div className="w-8 h-px bg-[#d9b359] mt-8" />
                </div>
              )}
            </div>

            <Dialog.Close asChild>
              <button 
                className="absolute top-4 right-4 p-2 text-[#8a7a6b] hover:text-[#3a2a22] rounded-full hover:bg-[#e8dfd5]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#df5d38] z-20"
                aria-label="Close"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
