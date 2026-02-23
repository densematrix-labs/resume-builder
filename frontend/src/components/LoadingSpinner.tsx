export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-amber-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-amber-500/20" />
        </div>
      </div>
    </div>
  )
}
