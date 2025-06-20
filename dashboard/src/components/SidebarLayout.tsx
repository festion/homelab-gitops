// File: dashboard/src/components/SidebarLayout.tsx

import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  Home as HomeIcon,
  FileSearch as AuditIcon,
  ListTodo as RoadmapIcon,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: <HomeIcon size={18} />, to: '/' },
  { label: 'Audit', icon: <AuditIcon size={18} />, to: '/audit' },
  { label: 'Roadmap', icon: <RoadmapIcon size={18} />, to: '/roadmap' },
];

const SidebarLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside
        className={`transition-all duration-200 p-2 bg-gray-900 text-white ${
          collapsed ? 'w-16' : 'w-48'
        }`}
      >
        <div className="flex justify-between items-center px-2 mb-4">
          {!collapsed && <h1 className="text-xl font-bold">GitOps</h1>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-sm text-gray-300 hover:text-white"
          >
            {collapsed ? '⮞' : '⮜'}
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-700 transition ${
                location.pathname === item.to ? 'bg-gray-800 font-bold' : ''
              }`}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;
