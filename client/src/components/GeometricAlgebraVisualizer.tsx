import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Pause, Play, Rotate3D } from "lucide-react";
import { useState } from "react";
import type { VisualMode } from "@/data/curriculum";

function VolumePieces({ a, b }: { a: number; b: number }) {
  const pieces: { position: [number, number, number]; scale: [number, number, number]; color: string }[] = [
    { position: [-0.9, 0.9, 0.9], scale: [a, a, a], color: "#0F766E" },
    { position: [0.75, 0.9, 0.9], scale: [b, a, a], color: "#F97316" },
    { position: [-0.9, -0.65, 0.9], scale: [a, b, a], color: "#4F938A" },
    { position: [0.75, -0.65, 0.9], scale: [b, b, a], color: "#3E9D99" },
    { position: [-0.9, 0.9, -0.65], scale: [a, a, b], color: "#746A99" },
    { position: [0.75, 0.9, -0.65], scale: [b, a, b], color: "#0F766E" },
    { position: [-0.9, -0.65, -0.65], scale: [a, b, b], color: "#F97316" },
    { position: [0.75, -0.65, -0.65], scale: [b, b, b], color: "#4F938A" },
  ];
  return <group>{pieces.map((piece, index) => <mesh key={index} position={piece.position} scale={piece.scale}><boxGeometry args={[0.78, 0.78, 0.78]} /><meshStandardMaterial color={piece.color} transparent opacity={0.9} /></mesh>)}</group>;
}

function VolumeScene({ a, b, rotating }: { a: number; b: number; rotating: boolean }) {
  return <Canvas camera={{ position: [3.6, 3.2, 4.6], fov: 42 }} dpr={[1, 1.5]}><ambientLight intensity={1.2} /><directionalLight position={[4, 5, 4]} intensity={2} /><VolumePieces a={a} b={b} /><OrbitControls enableDamping enableRotate autoRotate={rotating} autoRotateSpeed={1.2} minDistance={3.1} maxDistance={7} /></Canvas>;
}

function AreaBlocks({ a, b }: { a: number; b: number }) {
  const unit = 28;
  const sizeA = a * unit;
  const sizeB = b * unit;
  return <svg viewBox="0 0 250 180" role="img" aria-label="Áreas que componen un cuadrado de binomio" className="geometry-svg">
    <rect x="12" y="12" width={sizeA} height={sizeA} rx="4" fill="#0F766E" opacity=".88" /><text x="26" y="42" className="geometry-label">x²</text>
    <rect x={12 + sizeA} y="12" width={sizeB} height={sizeA} rx="4" fill="#F97316" opacity=".88" /><text x={16 + sizeA} y="42" className="geometry-label">ax</text>
    <rect x="12" y={12 + sizeA} width={sizeA} height={sizeB} rx="4" fill="#4F938A" opacity=".88" /><text x="26" y={36 + sizeA} className="geometry-label">ax</text>
    <rect x={12 + sizeA} y={12 + sizeA} width={sizeB} height={sizeB} rx="4" fill="#3E9D99" opacity=".88" /><text x={16 + sizeA} y={36 + sizeA} className="geometry-label">a²</text>
    <path d={`M12 ${20 + sizeA + sizeB} H${12 + sizeA + sizeB}`} className="geometry-axis" /><text x="18" y="172" className="geometry-caption">(x + a)² = x² + 2ax + a²</text>
  </svg>;
}

function Balance({ value }: { value: number }) {
  const tilt = Math.max(-12, Math.min(12, (value - 5) * 2));
  return <svg viewBox="0 0 280 170" role="img" aria-label="Balanza geométrica de igualdad" className="geometry-svg balance-svg">
    <g transform={`rotate(${tilt} 140 82)`}><line x1="140" y1="78" x2="55" y2="52" stroke="currentColor" strokeWidth="4" /><line x1="140" y1="78" x2="225" y2="52" stroke="currentColor" strokeWidth="4" /><path d="M30 48 Q55 86 80 48" fill="#0F766E" opacity=".8" /><path d="M200 48 Q225 86 250 48" fill="#3E9D99" opacity=".8" /><text x="42" y="67" className="geometry-label">x + {value}</text><text x="210" y="67" className="geometry-label">2x</text></g><line x1="140" y1="78" x2="140" y2="138" stroke="currentColor" strokeWidth="5" /><path d="M102 145 H178 L140 112 Z" fill="#0F2926" /><text x="16" y="20" className="geometry-caption">Aplica la misma operación a ambos lados</text></svg>;
}

type Props = { mode: VisualMode; title: string; prompt: string };

export default function GeometricAlgebraVisualizer({ mode, title, prompt }: Props) {
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const [balanceValue, setBalanceValue] = useState(5);
  const [rotating, setRotating] = useState(true);
  const showVolume = mode === "volume";
  const showBalance = mode === "balance";
  return <section className="geometry-lab" aria-label={`Laboratorio: ${title}`}>
    <div className="geometry-lab-heading"><div><span className="eyebrow">Laboratorio visual · {showVolume ? "3D" : "2D"}</span><h3>{title}</h3><p>{prompt}</p></div>{showVolume ? <button className="geometry-motion-button" onClick={() => setRotating(value => !value)} aria-pressed={rotating}><Rotate3D size={15} /> {rotating ? <><Pause size={13} /> Pausar giro</> : <><Play size={13} /> Reanudar giro</>}</button> : <span className="geometry-badge">explora</span>}</div>
    <div className="geometry-stage">{showVolume ? <div className="geometry-canvas"><VolumeScene a={a / 2.6} b={b / 2.6} rotating={rotating} /></div> : showBalance ? <Balance value={balanceValue} /> : <AreaBlocks a={a} b={b} />}</div>
    <div className="geometry-controls">{showBalance ? <label>Valor del lado derecho<input type="range" min="1" max="9" value={balanceValue} onChange={event => setBalanceValue(Number(event.target.value))} /><strong>{balanceValue}</strong></label> : <><label>a<input type="range" min="1" max="5" value={a} onChange={event => setA(Number(event.target.value))} /><strong>{a}</strong></label><label>b<input type="range" min="1" max="4" value={b} onChange={event => setB(Number(event.target.value))} /><strong>{b}</strong></label></>}</div>
    {showVolume && <p className="geometry-help"><Rotate3D size={14} /> Arrastra con el mouse o el dedo para rotar el modelo. Usa la rueda para acercarte.</p>}
  </section>;
}
