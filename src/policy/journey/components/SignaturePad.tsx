import { useRef, useState } from 'react';
import { Eraser, PenTool } from 'lucide-react';

interface Props {
  label?: string;
  onSign: (pngDataUrl: string, name: string) => void;
  requireName?: boolean;
}

/** Minimal in-browser signature capture — saves a PNG data URL. */
export function SignaturePad({ label = 'Signature', onSign, requireName = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [empty, setEmpty] = useState(true);
  const [name, setName] = useState('');

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent) => {
    const c = canvasRef.current!.getContext('2d')!;
    const { x, y } = pos(e);
    c.strokeStyle = '#FFC107';
    c.lineWidth = 2;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x, y);
    setDrawing(true);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing) return;
    const c = canvasRef.current!.getContext('2d')!;
    const { x, y } = pos(e);
    c.lineTo(x, y);
    c.stroke();
    setEmpty(false);
  };
  const end = () => setDrawing(false);

  const clear = () => {
    const c = canvasRef.current!;
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
    setEmpty(true);
  };

  const submit = () => {
    if (empty) return;
    if (requireName && !name.trim()) return;
    onSign(canvasRef.current!.toDataURL('image/png'), name.trim());
  };

  return (
    <div className="border border-white/10 rounded-xl p-4 bg-black/20 space-y-3">
      <div className="flex items-center gap-2 text-[#FFC107] text-xs font-montserrat font-bold uppercase tracking-widest">
        <PenTool size={14} /> {label}
      </div>

      {requireName && (
        <input
          className="w-full bg-transparent border border-white/15 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#FFC107]/60"
          placeholder="Printed name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      )}

      <canvas
        ref={canvasRef}
        width={520}
        height={140}
        className="w-full h-[140px] bg-black/30 rounded-lg border border-dashed border-white/20 touch-none"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />

      <div className="flex gap-2">
        <button
          onClick={clear}
          className="glass-interactive flex items-center gap-2 border border-white/15 rounded-lg px-3 py-2 text-xs text-white/70 hover:text-white">
          <Eraser size={14} /> Clear
        </button>
        <button
          onClick={submit}
          disabled={empty || (requireName && !name.trim())}
          className="gradient-gold rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed">
          Apply Signature
        </button>
      </div>
    </div>
  );
}
