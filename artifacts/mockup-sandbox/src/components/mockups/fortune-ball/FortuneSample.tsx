import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { RotateCcw } from "lucide-react";
import { GumballMachine } from "./_shared/GumballMachineSample";
import "./fortune-ball.css";
import "./FortuneSample.css";

const AFFIRMATIONS = [
  "You are doing better than you think.",
  "A good idea is waiting for you to start badly.",
  "Someone will be glad you took the slower road.",
  "A small kindness today, a big ripple tomorrow.",
  "You already know the next step. Take it.",
  "Rest is also part of the plan.",
  "Curiosity opens doors effort cannot.",
  "The best answers come when you stop forcing it.",
];

function CapsuleHalf({ side }: { side: "left" | "right" }) {
  const gradient = useId();
  const left = side === "left";
  const outline = left
    ? "M50 0 C22 0 0 22 0 50 C0 78 22 100 50 100 Z"
    : "M50 0 C78 0 100 22 100 50 C100 78 78 100 50 100 Z";
  const shellColor = left ? ["#d5f0fc", "#8bc8eb", "#68addd"] : ["#ffd078", "#f39a1b", "#cc6d10"];
  return (
    <div className={`split-ball split-ball-${side}`} aria-hidden="true">
      <svg viewBox="-2 -2 104 104">
        <defs>
          <radialGradient id={gradient} cx="30%" cy="25%" r="88%">
            <stop offset="0" stopColor={shellColor[0]} stopOpacity={left ? ".76" : ".9"} />
            <stop offset=".6" stopColor={shellColor[1]} stopOpacity={left ? ".66" : ".82"} />
            <stop offset="1" stopColor={shellColor[2]} stopOpacity={left ? ".62" : ".76"} />
          </radialGradient>
          <clipPath id={`${gradient}-clip`}><path d={outline} /></clipPath>
        </defs>
        <path d={outline} fill={`url(#${gradient})`} stroke="#744a2d" strokeWidth="2.2" strokeLinejoin="round" />
        <g clipPath={`url(#${gradient}-clip)`}>
          {[0, 120, 240].map((offset) => (
            <ellipse
              key={offset}
              className="capsule-thread-glint"
              cx={left ? 27 : 73}
              rx="4"
              style={{ "--thread-offset": `${offset}deg` } as CSSProperties}
            />
          ))}
        </g>
        <ellipse cx={left ? "25" : "76"} cy="25" rx="8" ry="5.5" fill="#fffaf0" opacity=".82" transform={`rotate(-35 ${left ? "25 25" : "76 25"})`} />
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

export function FortuneSample() {
  const [ready, setReady] = useState(true);
  const [affirmation, setAffirmation] = useState(AFFIRMATIONS[0]);
  const previousAffirmation = useRef(0);
  const [phase, setPhase] = useState<"idle" | "opening" | "revealed">(
    new URLSearchParams(window.location.search).get("state") === "open" ? "revealed" : "idle"
  );
  const [sequence, setSequence] = useState(0);
  const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (phase !== "opening") return;
    // The CSS timeline follows the supplied reference: part at 3.6s,
    // hop by 4.4s, unroll to 5.4s, and reveal the print from 5.2s.
    const timer = window.setTimeout(() => setPhase("revealed"), reduceMotion ? 30 : 5900);
    return () => window.clearTimeout(timer);
  }, [phase, reduceMotion]);

  const openBall = () => {
    if (phase !== "idle") return;
    let nextAffirmation = previousAffirmation.current;
    while (nextAffirmation === previousAffirmation.current) {
      nextAffirmation = Math.floor(Math.random() * AFFIRMATIONS.length);
    }
    previousAffirmation.current = nextAffirmation;
    setAffirmation(AFFIRMATIONS[nextAffirmation]);
    setPhase("opening");
  };
  const replay = () => {
    setPhase("idle");
    setReady(true);
    setSequence((value) => value + 1);
  };

  return (
    <main className="fortune-shell sample-shell">
      <header className="fortune-header">
        <div className="fortune-wordmark"><span className="wordmark-sun" />AUTUMN LANE</div>
        <span className="header-note">A little pause, just for you</span>
      </header>
      <section className="sample-content">
        <div className="sample-copy">
          <p className="eyebrow">A SMALL THING, FOR THIS MOMENT</p>
          <h1>Something<br /><em>good</em> is waiting.</h1>
          <p className="intro">A tiny kindness, tucked inside a candy-colored surprise.</p>
          <div className="sample-instruction"><span className="instruction-mark">01</span><span>Tap the ball: lift, twist, and unlock your note.</span></div>
          <span className="handwritten">take your time</span>
        </div>
        <div className="sample-machine-wrap">
          <div className="machine-stage" key={sequence}>
            <GumballMachine
              disabled={ready}
              onCrank={() => undefined}
              onDispense={() => setReady(true)}
              onBallClick={openBall}
            />
            {ready && (
              <div className={`fortune-reveal fortune-reveal--${phase}`} aria-live="polite">
                <div className="fortune-capsule">
                  <CapsuleHalf side="left" />
                  <CapsuleHalf side="right" />
                  <div className="capsule-thread" aria-hidden="true"><i /></div>
                  <div className="paper-slip" aria-hidden={phase !== "revealed"}>
                    <div className="paper-print">
                      <p>{affirmation}</p>
                    </div>
                  </div>
                  <div className="fortune-sparkles" aria-hidden="true">
                    <i /><i /><i /><i /><i />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="machine-caption">
            <span className="caption-dot" />
            {phase === "revealed" ? "A little reminder to keep" : phase === "opening" ? "A little twist, a little surprise…" : ready ? "Tap the ball to open your note" : "Your kind thought is waiting"}
          </div>
          {phase === "revealed" && (
            <button className="replay-button" onClick={replay} data-testid="button-replay" aria-label="Replay the fortune ball opening">
              <RotateCcw size={14} /> Try again
            </button>
          )}
        </div>
      </section>
      <footer className="fortune-footer"><span>MAKE ROOM FOR A GENTLER THOUGHT</span><i /></footer>
    </main>
  );
}

export default FortuneSample;