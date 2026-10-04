import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold mb-4">Wandered Too Far</h1>
        <p className="text-muted-foreground mb-8 text-lg font-serif">
          This path doesn't seem to lead anywhere.
        </p>
        <Link href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-secondary text-secondary-foreground hover:brightness-110 transition-colors font-medium">
          Return to the Lane
        </Link>
      </div>
    </div>
  );
}
