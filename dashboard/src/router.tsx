// File: dashboard/src/router.tsx

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import SidebarLayout from './components/SidebarLayout';
import AuditPage from './pages/audit';
import Home from './pages/home';

const router = createBrowserRouter([
  {
    path: '/',
    element: <SidebarLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'audit', element: <AuditPage /> },
      { path: 'audit/:repo', element: <AuditPage /> },
    ],
  },
]);

export default function RouterRoot() {
  return <RouterProvider router={router} />;
}