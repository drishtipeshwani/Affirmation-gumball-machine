import { useState } from "react";
import { GumballMachine } from "./_shared/GumballMachine";
import { AffirmationModal } from "./_shared/AffirmationModal";
import "./fortune-ball.css";

export function Current() {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [turnId, setTurnId] = useState(0);

  return (
    <main className="fortune-shell current-shell">
      <header className="fortune-header">
        <div className="fortune-wordmark"><span className="wordmark-sun" />AUTUMN LANE</div>
        <span className="header-note">A little pause, just for you</span>
      </header>
      <section className="fortune-current-content">
        <div className="current-copy">
          <p className="eyebrow">A MOMENT OF KINDNESS</p>
          <h1>Take what<br />you need.</h1>
          <p className="intro">Turn the handle. Let a small reminder find its way to you.</p>
          <span className="handwritten">with care, always</span>
        </div>
        <div className="current-machine">
          <GumballMachine
            disabled={ready}
            onCrank={() => undefined}
            onDispense={() => { setReady(true); setTurnId((value) => value + 1); }}
            onBallClick={() => setOpen(true)}
          />
        </div>
      </section>
      <footer className="fortune-footer"><span>MAKE ROOM FOR A GENTLER THOUGHT</span><i /></footer>
      <AffirmationModal open={open} onOpenChange={setOpen} shouldFetch={open} turnId={turnId} />
    </main>
  );
}

export default Current;