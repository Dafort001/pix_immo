export function IPhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto max-w-sm">
      <div className="relative aspect-[9/19.5] w-full rounded-[2.5rem] border-8 border-slate-900 bg-white shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-3xl"></div>
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
