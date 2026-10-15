import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return <div className="min-h-screen flex flex-col"><Header /><main id="main-content" className="empty-results flex-1"><Compass size={42} /><span className="eyebrow">404 / A little off track</span><h1 className="text-3xl font-semibold tracking-tight">Let’s find your next tool.</h1><p>This page isn’t here, but your toolkit is one click away.</p><Link href="/" className="primary-button">Explore all tools <ArrowRight size={16} /></Link></main><Footer /></div>;
}
