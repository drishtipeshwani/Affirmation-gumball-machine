import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { GumballMachine } from '@/components/gumball-machine';
import { FortuneCapsule } from '@/components/fortune-capsule';
import { createAudioEngine, type AudioEngine } from '@/lib/audio';

export default function Home() {
  const [audioEngine, setAudioEngine] = useState<AudioEngine | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  
  const [machineState, setMachineState] = useState<'idle' | 'dispensing' | 'dispensed'>('idle');
  const [turnId, setTurnId] = useState(0);

  useEffect(() => {
    const engine = createAudioEngine();
    setAudioEngine(engine);
    return () => engine?.dispose();
  }, []);

  const toggleSound = () => {
    if (audioEngine) {
      const muted = audioEngine.toggleMute();
      setIsMuted(muted);
    }
  };

  const handleCrank = () => {
    audioEngine?.playClick();
  };

  const handleDispense = () => {
    audioEngine?.playDispense();
    setMachineState('dispensed');
  };

  const handleBallClick = () => {
    audioEngine?.playReveal();
    setTurnId((turn) => turn + 1);
  };

  const handleReset = () => {
    setMachineState('idle');
    requestAnimationFrame(() => document.getElementById('machine-handle')?.focus());
  };

  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden bg-[#f8f4eb]">

      {/* Main UI Container */}
      <div className="relative z-10 w-full h-[100dvh] max-w-7xl mx-auto px-6 pt-8 pb-0 flex flex-col justify-between items-end">
        
        {/* Top Header Controls */}
        <header className="w-full flex justify-end">
          <button
            onClick={toggleSound}
            className="p-3 rounded-full bg-card/80 backdrop-blur-md border border-border shadow-sm text-foreground hover:bg-card hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label={isMuted ? "Enable sound" : "Disable sound"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </header>

        {/* Scene Focus: Gumball Machine on the right */}
        <div className="flex-1 min-h-0 w-full flex items-end justify-center pb-3">
          <GumballMachine 
            onCrank={handleCrank} 
            onDispense={handleDispense} 
            ballContent={<FortuneCapsule turnId={turnId} onOpen={handleBallClick} onReset={handleReset} />}
            disabled={machineState !== 'idle'} 
          />
        </div>

        {/* Instruction overlay (fades out if interacted) */}
        {machineState === 'idle' && (
          <div className="absolute top-24 left-[50%] -translate-x-[50%] md:top-auto md:-translate-x-0 md:bottom-12 md:left-12 w-[280px] md:max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-1000 z-0">
            <p className="font-serif text-base md:text-lg text-[#3a2a22] bg-[#f9f6f0]/90 backdrop-blur px-6 py-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] border-2 border-[#d9b359]/50 text-center md:text-left leading-snug">
              Take a small pause. Give the crank a little clockwise nudge.
            </p>
          </div>
        )}
      </div>

    </main>
  );
}
