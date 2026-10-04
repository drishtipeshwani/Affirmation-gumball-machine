export function createAudioEngine() {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return null;
  
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  let ambientSource: AudioBufferSourceNode | null = null;
  let isMuted = true; // initially muted as requested
  
  const ensureResumed = () => {
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }
  };

  const playClick = () => {
    if (isMuted) return;
    ensureResumed();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(master);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  };

  const playDispense = () => {
    if (isMuted) return;
    ensureResumed();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(master);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  };

  const playReveal = () => {
    if (isMuted) return;
    ensureResumed();
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    const now = ctx.currentTime;
    
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const startTime = now + i * 0.1;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.0);
      
      osc.connect(gain);
      gain.connect(master);
      
      osc.start(startTime);
      osc.stop(startTime + 1.1);
    });
  };

  const toggleMute = () => {
    isMuted = !isMuted;
    if (!isMuted) {
      ensureResumed();
      if (!ambientSource) {
        // Soft filtered brown noise evokes wind through dry leaves.
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
        const samples = buffer.getChannelData(0);
        let previous = 0;
        for (let i = 0; i < samples.length; i++) {
          previous = (previous + (Math.random() * 2 - 1) * 0.02) / 1.02;
          samples[i] = previous * 3.5;
        }
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 650;
        const volume = ctx.createGain();
        volume.gain.value = 0.14;
        ambientSource = ctx.createBufferSource();
        ambientSource.buffer = buffer;
        ambientSource.loop = true;
        ambientSource.connect(filter);
        filter.connect(volume);
        volume.connect(master);
        ambientSource.start();
      }
    }
    master.gain.setTargetAtTime(isMuted ? 0 : 1, ctx.currentTime, 0.08);
    return isMuted;
  };
  
  const getIsMuted = () => isMuted;

  return {
    playClick,
    playDispense,
    playReveal,
    toggleMute,
    getIsMuted,
    dispose: () => {
      ambientSource?.stop();
      void ctx.close();
    },
  };
}

export type AudioEngine = ReturnType<typeof createAudioEngine>;
