import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { RotateCcw } from 'lucide-react';
import { useGetRandomAffirmation, getGetRandomAffirmationQueryKey } from '@workspace/api-client-react';
import './fortune-capsule.css';

function CapsuleHalf({ side }: { side: 'left' | 'right' }) {
  const gradient = useId();
  const left = side === 'left';
  const outline = left
    ? 'M50 0 C22 0 0 22 0 50 C0 78 22 100 50 100 Z'
    : 'M50 0 C78 0 100 22 100 50 C100 78 78 100 50 100 Z';
  const colors = left ? ['#d5f0fc', '#8bc8eb', '#68addd'] : ['#ffd078', '#f39a1b', '#cc6d10'];
  return (
    <div className={`split-ball split-ball-${side}`} aria-hidden="true">
      <svg viewBox="-2 -2 104 104">
        <defs>
          <radialGradient id={gradient} cx="30%" cy="25%" r="88%">
            <stop offset="0" stopColor={colors[0]} stopOpacity={left ? '.76' : '.9'} />
            <stop offset=".6" stopColor={colors[1]} stopOpacity={left ? '.66' : '.82'} />
            <stop offset="1" stopColor={colors[2]} stopOpacity={left ? '.62' : '.76'} />
          </radialGradient>
          <clipPath id={`${gradient}-clip`}><path d={outline} /></clipPath>
        </defs>
        <path d={outline} fill={`url(#${gradient})`} stroke="#744a2d" strokeWidth="2.2" strokeLinejoin="round" />
        <g clipPath={`url(#${gradient}-clip)`}>
          {[0, 120, 240].map(offset => (
            <ellipse key={offset} className="capsule-thread-glint" cx={left ? 27 : 73} rx="4"
              style={{ '--thread-offset': `${offset}deg` } as CSSProperties} />
          ))}
        </g>
        <ellipse cx={left ? '25' : '76'} cy="25" rx="8" ry="5.5" fill="#fffaf0" opacity=".82"
          transform={`rotate(-35 ${left ? '25 25' : '76 25'})`} />
        {!left && <>
          <circle cx="61" cy="39" r="3.2" fill="#fffaf0" opacity=".9" />
          <circle cx="83" cy="55" r="2.7" fill="#fffaf0" opacity=".88" />
          <circle cx="63" cy="72" r="3.2" fill="#fffaf0" opacity=".9" />
          <ellipse cx="77" cy="82" rx="5" ry="2.4" fill="#fffaf0" opacity=".82" />
        </>}
      </svg>
    </div>
  );
}

interface FortuneCapsuleProps {
  turnId: number;
  onOpen: () => void;
  onReset: () => void;
}

export function FortuneCapsule({ turnId, onOpen, onReset }: FortuneCapsuleProps) {
  const [phase, setPhase] = useState<'idle' | 'opening' | 'revealed'>('idle');
  const [printReady, setPrintReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const openButton = useRef<HTMLButtonElement>(null);
  const replayButton = useRef<HTMLButtonElement>(null);
  const { data, isLoading, isError, refetch } = useGetRandomAffirmation({
    query: {
      enabled: phase !== 'idle',
      queryKey: [...getGetRandomAffirmationQueryKey(), turnId],
      staleTime: Infinity,
      retry: 1,
      gcTime: 0,
    },
  });

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (phase !== 'opening') return;
    const printTimer = window.setTimeout(() => setPrintReady(true), reducedMotion ? 10 : 5200);
    const timer = window.setTimeout(() => setPhase('revealed'), reducedMotion ? 30 : 5900);
    return () => {
      window.clearTimeout(printTimer);
      window.clearTimeout(timer);
    };
  }, [phase, reducedMotion]);

  useEffect(() => {
    if (phase === 'revealed') replayButton.current?.focus({ preventScroll: true });
  }, [phase]);

  const open = () => {
    if (phase !== 'idle') return;
    onOpen();
    setPhase('opening');
  };
  const replay = () => {
    setPrintReady(false);
    setPhase('idle');
    requestAnimationFrame(() => openButton.current?.focus({ preventScroll: true }));
  };

  return (
    <div className="fortune-machine">
      <div className={`fortune-reveal fortune-reveal--${phase}`} data-testid="fortune-capsule" data-phase={phase}>
        <div className="fortune-capsule">
          <CapsuleHalf side="left" />
          <CapsuleHalf side="right" />
          <div className="capsule-thread" aria-hidden="true"><i /></div>
          <div className="paper-slip" aria-hidden={!printReady}>
            <div className="paper-print" role="status" aria-live="polite">
              {!printReady ? null : isError ? (
                <div className="fortune-error">
                  <p>Couldn’t load your fortune.</p>
                  <button onClick={() => void refetch()}>Try again</button>
                </div>
              ) : (
                <p style={data && data.text.length > 100 ? { fontSize: '13px' } : undefined}>
                  {isLoading || !data ? 'Your fortune is on its way…' : data.text}
                </p>
              )}
            </div>
          </div>
          <div className="fortune-sparkles" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        </div>
        {phase === 'idle' && (
          <button ref={openButton} className="fortune-open-button" onClick={open}
            data-testid="button-open-gumball" aria-label="Open dispensed fortune capsule" />
        )}
      </div>
      {phase === 'revealed' && (
        <div className="fortune-controls">
          <button ref={replayButton} onClick={replay} data-testid="button-replay"><RotateCcw size={14} /> Replay</button>
          <button onClick={onReset} data-testid="button-another-fortune">Another fortune</button>
        </div>
      )}
    </div>
  );
}