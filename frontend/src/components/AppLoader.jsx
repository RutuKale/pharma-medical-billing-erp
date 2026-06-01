import { Pill } from "lucide-react";

const AppLoader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="text-center">
        <div className="relative inline-flex">
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-500 opacity-30" />

          <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-2xl shadow-2xl">
            <Pill size={42} className="text-white animate-pulse" />
          </div>
        </div>

        <h1 className="mt-6 text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          PharmaMed
        </h1>

        <p className="mt-2 text-blue-300/70">Loading Medical ERP...</p>

        <div className="w-64 h-2 mx-auto mt-6 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-full animate-loader bg-gradient-to-r from-blue-500 to-indigo-500" />
        </div>
      </div>

      <style>{`
        @keyframes loader {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-loader {
          animation: loader 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AppLoader;
