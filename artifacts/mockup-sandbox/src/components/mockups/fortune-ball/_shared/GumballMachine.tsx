import React, { useRef, useState, useEffect } from 'react';

interface GumballMachineProps {
  onDispense: () => void;
  onCrank: () => void;
  onBallClick?: () => void;
  disabled?: boolean;
}

const CX = 100;
const CY = 222;
const OUTLINE = '#e0708f';
const BLUE = '#7ab8e4';
const BLUE_D = '#4e8cc4';
const NAVY = '#3d4a8a';
const PINK = '#f48fa4';
const CREAM = '#fbf0cf';
const NUDGE_ANGLE = 20;

const BALLS: Array<[number, number, string]> = [
  [59, 99, BLUE], [79, 91, PINK], [101, 94, CREAM], [122, 99, NAVY], [141, 93, BLUE],
  [47, 117, NAVY], [68, 113, CREAM], [89, 111, BLUE], [111, 116, PINK], [133, 116, CREAM], [154, 113, PINK],
  [48, 139, PINK], [69, 135, BLUE], [92, 132, NAVY], [113, 137, CREAM], [136, 137, BLUE], [154, 137, NAVY],
  [59, 157, CREAM], [80, 153, PINK], [101, 154, BLUE], [123, 158, NAVY], [145, 154, CREAM],
  [77, 170, BLUE], [99, 174, PINK], [120, 172, CREAM],
  [58, 125, BLUE], [80, 126, NAVY], [102, 124, PINK], [126, 127, BLUE],
  [70, 148, CREAM], [94, 145, CREAM], [115, 148, PINK], [138, 146, PINK],
];

const GLOBE_SHAPE = 'M57 65 C24 83 19 137 49 165 Q100 196 151 165 C181 137 176 83 143 65 Q100 75 57 65 Z';

export function GumballMachine({ onDispense, onCrank, onBallClick, disabled }: GumballMachineProps) {
  const [rotation, setRotation] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [isTurning, setIsTurning] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);
  const centerRef = useRef({ x: 0, y: 0 });
  const lastAngle = useRef(0);
  const totalRotation = useRef(0);
  const autoTurning = useRef(false);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => () => {
    if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
  }, []);

  const completeTurn = () => {
    if (autoTurning.current || disabled || totalRotation.current >= 360) return;
    autoTurning.current = true;
    isDragging.current = false;
    setPressed(false);
    setIsTurning(true);
    const startRotation = totalRotation.current;
    const startTime = performance.now();
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 850;
    let lastSoundStep = Math.floor(startRotation / 30);
    onCrank();

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const angle = startRotation + (360 - startRotation) * eased;
      totalRotation.current = angle;
      setRotation(angle);
      const soundStep = Math.floor(angle / 30);
      if (soundStep > lastSoundStep) {
        onCrank();
        lastSoundStep = soundStep;
      }
      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        animationFrame.current = null;
        autoTurning.current = false;
        setIsTurning(false);
        onDispense();
      }
    };
    animationFrame.current = requestAnimationFrame(animate);
  };

  const calculateCenter = () => {
    if (!svgRef.current) return;
    const matrix = svgRef.current.getScreenCTM();
    if (!matrix) return;
    const point = new DOMPoint(CX, CY).matrixTransform(matrix);
    centerRef.current = { x: point.x, y: point.y };
  };

  useEffect(() => {
    if (!disabled && totalRotation.current >= 360) {
      setRotation(0);
      totalRotation.current = 0;
      lastAngle.current = 0;
    }
  }, [disabled]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || autoTurning.current || totalRotation.current >= 360 || isDragging.current || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    setPressed(true);
    calculateCenter();
    const dx = e.clientX - centerRef.current.x;
    const dy = e.clientY - centerRef.current.y;
    lastAngle.current = Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || disabled || autoTurning.current) return;
    const dx = e.clientX - centerRef.current.x;
    const dy = e.clientY - centerRef.current.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    let delta = angle - lastAngle.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    totalRotation.current += delta;
    if (totalRotation.current < 0) totalRotation.current = 0;
    setRotation(totalRotation.current);
    lastAngle.current = angle;
    if (totalRotation.current >= NUDGE_ANGLE) {
      completeTurn();
      if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setPressed(false);
    if (!autoTurning.current && totalRotation.current < NUDGE_ANGLE) {
      totalRotation.current = 0;
      setRotation(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!['ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    if (disabled || autoTurning.current || totalRotation.current >= 360 || e.repeat) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      totalRotation.current = NUDGE_ANGLE;
      setRotation(NUDGE_ANGLE);
      completeTurn();
    } else {
      totalRotation.current = 0;
      setRotation(0);
    }
  };

  const dispensed = disabled && totalRotation.current >= 360;
  const shake = Math.sin((rotation * Math.PI) / 30) * 1.6;
  const stroke = { stroke: OUTLINE, strokeWidth: 2.2, strokeLinejoin: 'round' as const };

  return (
    <div className="relative" style={{ height: 'min(66dvh, 560px)', aspectRatio: '1 / 2' }}>
      <svg ref={svgRef} viewBox="0 0 200 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full overflow-visible">
        <defs>
          <radialGradient id="glass" cx="0.35" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="0.6" stopColor="#f1f8f4" stopOpacity="0.2" />
            <stop offset="1" stopColor="#a9d5e6" stopOpacity="0.45" />
          </radialGradient>
          <clipPath id="globe-interior"><path d={GLOBE_SHAPE} /></clipPath>
          {[NAVY, BLUE, PINK, CREAM].map((color) => (
            <radialGradient key={color} id={`gumball-${color.slice(1)}`} cx="0.3" cy="0.25" r="0.8">
              <stop offset="0" stopColor={color} />
              <stop offset="0.7" stopColor={color} />
              <stop offset="1" stopColor={color} stopOpacity="0.78" />
            </radialGradient>
          ))}
        </defs>
        {/* soft floor shadow */}
        <ellipse cx="100" cy="388" rx="62" ry="7" fill="#b56a6a" opacity="0.22" />

        {/* foot + stem */}
        <ellipse cx="100" cy="372" rx="56" ry="14" fill={PINK} {...stroke} />
        <ellipse cx="96" cy="368" rx="30" ry="5" fill="#fff" opacity="0.35" />
        <path d="M80 296 Q92 312 90 336 Q88 356 78 368 Q100 378 122 368 Q112 356 110 336 Q108 312 120 296 Z" fill={PINK} {...stroke} />
        <path d="M94 310 Q96 336 90 356" stroke="#fff" strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" />

        {/* pedestal plate */}
        <path d="M44 268 L156 268 Q166 270 162 280 Q158 296 100 302 Q42 296 38 280 Q34 270 44 268 Z" fill={PINK} {...stroke} />

        {/* body */}
        <path d="M58 168 L142 168 Q150 172 152 190 L158 262 Q130 272 100 272 Q70 272 42 262 L48 190 Q50 172 58 168 Z" fill={PINK} {...stroke} />
        <path d="M58 180 Q56 220 54 252" stroke="#fff" strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" />
        {/* muted front panel */}
        <path d="M70 176 L130 176 L134 252 Q100 258 66 252 Z" fill="#C5C7BC" stroke="#a6ac9b" strokeWidth="2" strokeLinejoin="round" />
        {/* recessed, hollow dispensing opening and its inner floor */}
        <path d="M78 289 V277 C78 253 122 253 122 277 V289 Q100 297 78 289 Z" fill="#454640" stroke="#b6677c" strokeWidth="2" strokeLinejoin="round" />
        <path d="M79 286 Q100 276 121 286 L121 288 Q100 296 79 288 Z" fill="#74766b" />

        {/* globe */}
        <g transform={`translate(0 ${shake * 0.4})`}>
          <path d={GLOBE_SHAPE} fill="url(#glass)" stroke={BLUE} strokeWidth="2.6" strokeLinejoin="round" />
          <g clipPath="url(#globe-interior)">
          <g opacity={dispensed ? 0.75 : 1} transform={`translate(${shake} 0)`}>
            {BALLS.map(([x, y, c], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="10.5" fill={`url(#gumball-${c.slice(1)})`} stroke={c === CREAM ? '#ecd9a0' : c} strokeWidth="1.2" />
                <ellipse cx={x - 3.5} cy={y - 4} rx="3.2" ry="2.3" transform={`rotate(-35 ${x - 3.5} ${y - 4})`} fill="#fff" opacity="0.55" />
              </g>
            ))}
          </g>
          </g>
        </g>
        {/* globe base ring */}
        <path d="M60 176 Q100 188 140 176 L142 168 Q100 180 58 168 Z" fill={PINK} {...stroke} />

        {/* cap */}
        <path d="M54 66 Q58 34 100 28 Q142 34 146 66 Q100 76 54 66 Z" fill={BLUE} stroke={BLUE_D} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M70 52 Q80 42 94 40" stroke="#fff" strokeOpacity="0.6" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M90 30 Q90 16 100 16 Q110 16 110 30 Z" fill={BLUE} stroke={BLUE_D} strokeWidth="2.4" strokeLinejoin="round" />

        {/* teardrop crank plate */}
        <path d="M100 186 Q82 214 82 232 Q82 254 100 254 Q118 254 118 232 Q118 214 100 186 Z" fill={BLUE} stroke={BLUE_D} strokeWidth="2.4" strokeLinejoin="round" />
        <circle cx="100" cy="200" r="6" fill={NAVY} />
        <path d="M92 236 Q96 248 100 246" stroke="#fff" strokeOpacity="0.45" strokeWidth="3" strokeLinecap="round" />

        {/* wavy handle: interactive */}
        <g
          id="machine-handle"
          transform={`rotate(${rotation} ${CX} ${CY})`}
          className="machine-handle cursor-grab active:cursor-grabbing touch-none outline-none"
          data-pressed={pressed}
          data-testid="slider-machine-crank"
          aria-busy={isTurning}
          aria-disabled={disabled || isTurning}
          tabIndex={disabled ? -1 : 0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onLostPointerCapture={() => { isDragging.current = false; setPressed(false); }}
          onKeyDown={handleKeyDown}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={360}
          aria-valuenow={Math.min(Math.round(rotation), 360)}
          aria-label="Gumball machine crank. Nudge clockwise or press the right arrow to start an automatic turn."
          aria-valuetext={isTurning ? 'Turning automatically' : dispensed ? 'Gumball ready' : 'Nudge clockwise to dispense'}
        >
          <circle cx={CX} cy={CY} r="34" fill="transparent" />
          <path
            d={`M${CX - 26} ${CY} q6.5 -9 13 0 t13 0 t13 0 t13 0`}
            stroke="#f2a0a8" strokeWidth="9" strokeLinecap="round" fill="none"
          />
          <path
            d={`M${CX - 26} ${CY} q6.5 -9 13 0 t13 0 t13 0 t13 0`}
            stroke={OUTLINE} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" transform="translate(0 4)"
          />
          <circle cx={CX} cy={CY} r="6.5" fill={CREAM} stroke={OUTLINE} strokeWidth="2" />
        </g>
      </svg>

      {dispensed && (
        <button
          className="ball-pop absolute left-1/2 z-10 h-[8%] aspect-square -translate-x-1/2 rounded-full cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#4e8cc4]"
          style={{ top: '66.5%', background: 'radial-gradient(circle at 32% 30%, #fff 0 12%, #f6a3b5 14%, #e8648f 100%)', boxShadow: 'inset -3px -4px 7px rgba(120,30,60,0.3), 0 4px 6px rgba(150,60,80,0.3)' }}
          onClick={onBallClick}
          data-testid="button-open-gumball"
          aria-label="Open dispensed gumball"
        />
      )}
    </div>
  );
}
