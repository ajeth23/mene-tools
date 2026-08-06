import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h2 className="text-3xl font-bold mb-4">404 - Not Found</h2>
      <p className="text-zinc-500 mb-8">Could not find requested resource</p>
      <Link 
        href="/"
        className="px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
