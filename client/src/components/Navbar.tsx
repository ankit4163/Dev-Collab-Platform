import React from "react";
import { useAuth } from "../context/AuthContext";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 border-b border-surface-200 bg-white flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-surface-900">Dev Collab</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-surface-600">{user?.name}</span>
        <button
          onClick={logout}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Log out
        </button>
      </div>
    </header>
  );
};
