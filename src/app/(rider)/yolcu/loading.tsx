export default function RiderLoading() {
  return (
    <div className="lg:flex lg:justify-center lg:pt-10 lg:pb-16">
      <div className="px-5 py-4 max-w-md mx-auto space-y-4 w-full">
        <div className="space-y-1">
          <div className="h-3 w-20 rounded-md skeleton" />
          <div className="h-7 w-48 rounded-md skeleton" />
        </div>
        <div className="aspect-[4/3] rounded-2xl skeleton" />
        <div className="h-12 rounded-full skeleton" />
        <div className="space-y-2">
          <div className="h-14 rounded-xl skeleton" />
          <div className="h-14 rounded-xl skeleton" />
        </div>
        <div className="h-20 rounded-2xl skeleton" />
        <div className="h-12 rounded-full skeleton" />
      </div>
    </div>
  );
}
