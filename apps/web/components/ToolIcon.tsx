import { Combine, Scissors, Minimize2, FileImage, ImageDown, RefreshCw, Eraser, Compass, Code2, KeyRound, Hash, Binary, SearchCode, QrCode, ShieldAlert, PenTool, AlignLeft, Mic, Video, Film, FileText, Sparkles, Cpu } from "lucide-react";
const icons = { Combine, Scissors, Minimize2, FileImage, ImageDown, RefreshCw, Eraser, Compass, Code2, KeyRound, Hash, Binary, SearchCode, QrCode, ShieldAlert, PenTool, AlignLeft, Mic, Video, Film, FileText, Sparkles };
export default function ToolIcon({ name, size = 22 }: { name: string; size?: number }) {
  const Icon = icons[name as keyof typeof icons] || Cpu;
  return <Icon size={size} strokeWidth={1.7} />;
}
