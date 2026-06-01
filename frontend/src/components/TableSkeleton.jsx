const TableSkeleton = ({ rows = 8 }) => {
  return (
    <div className="animate-pulse">
      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        {[...Array(rows)].map((_, index) => (
          <div
            key={index}
            className="flex gap-4 p-4 border-b border-white/5"
          >
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-4 w-48 bg-white/10 rounded" />
            <div className="h-4 w-20 bg-white/10 rounded" />
            <div className="h-4 w-24 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;