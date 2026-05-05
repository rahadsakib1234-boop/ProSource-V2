import { useHashLocation } from 'wouter/use-hash-location';

export default function NotFound() {
  const [, setLocation] = useHashLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-foreground mb-2">404</h1>
        <p className="text-muted-foreground mb-6">Page not found</p>
        <button
          onClick={() => setLocation('/')}
          className="px-6 py-2 bg-accent text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
