import { CardSkeleton } from '@/components/common/LoadingSkeleton';

export default function RootLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="border-b">
        <div className="container-wide flex h-16 items-center justify-between gap-4">
          <div className="h-6 w-6 rounded-md skeleton" />
          <div className="hidden md:flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-7 w-20 rounded-full skeleton" />
            ))}
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 rounded-full skeleton" />
          </div>
        </div>
      </div>
      <div className="container-wide py-16 grid lg:grid-cols-2 gap-10">
        <div className="space-y-4">
          <div className="h-12 w-3/4 rounded-md skeleton" />
          <div className="h-12 w-5/6 rounded-md skeleton" />
          <div className="h-5 w-2/3 rounded-md skeleton" />
        </div>
        <CardSkeleton />
      </div>
    </div>
  );
}
