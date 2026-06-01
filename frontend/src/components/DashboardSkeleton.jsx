const DashboardSkeleton = () => {
  return (
    <div className="p-6 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 w-64 bg-white/10 rounded mb-3" />
        <div className="h-4 w-40 bg-white/10 rounded" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-white/5 rounded-2xl border border-white/10 p-5"
          >
            <div className="w-12 h-12 bg-white/10 rounded-xl mb-4" />
            <div className="h-4 bg-white/10 rounded w-24 mb-3" />
            <div className="h-8 bg-white/10 rounded w-32 mb-2" />
            <div className="h-3 bg-white/10 rounded w-20" />
          </div>
        ))}
      </div>

      {/* Main Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/5 rounded-2xl h-[450px]" />

        <div className="space-y-6">
          <div className="bg-white/5 rounded-2xl h-[220px]" />
          <div className="bg-white/5 rounded-2xl h-[220px]" />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
