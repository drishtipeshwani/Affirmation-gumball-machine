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

      </div>

    </main>
  );
}
