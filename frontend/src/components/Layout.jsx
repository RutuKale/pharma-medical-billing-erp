import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 min-h-screen">
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Layout;