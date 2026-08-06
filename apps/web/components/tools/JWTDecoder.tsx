"use client";

import { useState } from "react";
import { KeyRound, Copy, Check, Info, AlertCircle } from "lucide-react";

interface DecodedToken {
  header: any;
  payload: any;
  signature: string;
  isExpired: boolean;
  timeRemaining: string;
}

export default function JWTDecoder() {
  const [token, setToken] = useState("");
  const [decoded, setDecoded] = useState<DecodedToken | null>(null);
  const [error, setError] = useState("");
  const [copiedSection, setCopiedSection] = useState<"header" | "payload" | "">("");

  const decodeJWT = (jwt: string) => {
    setError("");
    setDecoded(null);

    if (!jwt.trim()) return;

    const parts = jwt.trim().split(".");
    if (parts.length !== 3) {
      setError("Invalid token format. A JWT must consist of three parts separated by dots (.)");
      return;
    }

    try {
      const base64UrlDecode = (str: string) => {
        let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) {
          base64 += "=";
        }
        return decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
      };

      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));
      const signature = parts[2];

      // Expiration calculations
      let isExpired = false;
      let timeRemaining = "N/A";
      if (payload.exp) {
        const expTime = payload.exp * 1000;
        const now = Date.now();
        isExpired = now > expTime;

        if (isExpired) {
          timeRemaining = "Expired";
        } else {
          const diff = expTime - now;
          const mins = Math.floor(diff / 60000);
          const hrs = Math.floor(mins / 60);
          const days = Math.floor(hrs / 24);

          if (days > 0) timeRemaining = `${days}d ${hrs % 24}h remaining`;
          else if (hrs > 0) timeRemaining = `${hrs}h ${mins % 60}m remaining`;
          else timeRemaining = `${mins}m remaining`;
        }
      }

      setDecoded({
        header,
        payload,
        signature,
        isExpired,
        timeRemaining,
      });
    } catch (err) {
      setError("Failed to decode token segments. Make sure the string is a valid base64url-encoded JWT.");
    }
  };

  const handleCopy = (section: "header" | "payload") => {
    if (!decoded) return;
    const data = section === "header" ? decoded.header : decoded.payload;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(""), 2000);
  };

  const loadSampleToken = () => {
    // Standard test JWT
    const sample = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoyNTE2MjM5MDIyLCJhZG1pbiI6dHJ1ZX0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    setToken(sample);
    decodeJWT(sample);
  };

  const formatEpoch = (seconds: number) => {
    return new Date(seconds * 1000).toLocaleString();
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
            Paste JSON Web Token (JWT)
          </label>
          <button
            type="button"
            onClick={loadSampleToken}
            className="text-xs text-indigo-500 hover:underline cursor-pointer"
          >
            Load Sample JWT
          </button>
        </div>
        <textarea
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            decodeJWT(e.target.value);
          }}
          placeholder="Paste JWT string here..."
          className="w-full h-32 px-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 py-3 resize-none transition-all text-zinc-900 dark:text-zinc-50"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 border border-red-100 dark:border-red-950/30 bg-red-50/50 dark:bg-red-950/10 rounded-lg text-xs text-red-600 dark:text-red-400 font-medium">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {decoded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Header */}
          <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-zinc-500">HEADER (ALGORITHM & TOKEN TYPE)</span>
              <button
                onClick={() => handleCopy("header")}
                className="text-xs text-indigo-500 hover:underline cursor-pointer"
              >
                {copiedSection === "header" ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="p-4 font-mono text-xs text-red-600 dark:text-red-400 bg-zinc-50/30 dark:bg-zinc-950/10 overflow-auto max-h-60 whitespace-pre">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>

          {/* Claims Payload */}
          <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-zinc-500">PAYLOAD (DATA CLAIMS)</span>
              <button
                onClick={() => handleCopy("payload")}
                className="text-xs text-indigo-500 hover:underline cursor-pointer"
              >
                {copiedSection === "payload" ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="p-4 font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-zinc-50/30 dark:bg-zinc-950/10 overflow-auto max-h-60 whitespace-pre">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
          </div>

          {/* Decoded Timestamps metadata if present */}
          {decoded.payload.exp && (
            <div className="lg:col-span-2 flex items-center gap-2.5 px-4 py-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/30 rounded-lg text-xs text-zinc-500 dark:text-zinc-400">
              <Info className="w-4 h-4 text-indigo-500 shrink-0" />
              <div className="flex flex-wrap gap-4 font-mono">
                <span>
                  Issued At (iat):{" "}
                  <strong className="text-zinc-700 dark:text-zinc-300">
                    {decoded.payload.iat ? formatEpoch(decoded.payload.iat) : "N/A"}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Expiration (exp):{" "}
                  <strong className="text-zinc-700 dark:text-zinc-300">
                    {formatEpoch(decoded.payload.exp)}
                  </strong>{" "}
                  ({decoded.timeRemaining})
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
