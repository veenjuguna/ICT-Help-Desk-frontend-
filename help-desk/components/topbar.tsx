import { Bell } from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-end px-6">
      <button className="relative p-2 rounded-full border border-gray-200 hover:bg-gray-100">
        <Bell size={20} />

        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
    </header>
  );
}
