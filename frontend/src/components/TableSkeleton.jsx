const TableSkeleton = ({ rows = 8 }) => {
  return (
    <div className="animate-pulse">
      <div className="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden">
        {[...Array(rows)].map((_, index) => (
          <div
            key={index}
            className="flex gap-4 p-4 border-b border-white/5"
          >
            <div className="h-4 w-32 bg-slate-50 rounded" />
            <div className="h-4 w-48 bg-slate-50 rounded" />
            <div className="h-4 w-20 bg-slate-50 rounded" />
            <div className="h-4 w-24 bg-slate-50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;