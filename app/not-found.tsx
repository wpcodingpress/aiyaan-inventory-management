export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-on-surface">404</h1>
        <p className="text-on-surface-variant mt-2">Page not found</p>
        <a href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-primary-container text-white rounded-lg hover:opacity-90">
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}
