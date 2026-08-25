export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary-container border-t-transparent rounded-full animate-spin" />
        <p className="text-on-surface-variant text-sm">Loading...</p>
      </div>
    </div>
  );
}
