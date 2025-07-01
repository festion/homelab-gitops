// File: dashboard/src/router.tsx

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import SidebarLayout from './components/SidebarLayout';
import AuditPage from './pages/audit';
import Home from './pages/home';
import Roadmap from './pages/roadmap';
// Phase 2 imports
import TemplatesPage from './pages/phase2/templates';
import PipelinesPage from './pages/phase2/pipelines';
import DependenciesPage from './pages/phase2/dependencies';
import QualityPage from './pages/phase2/quality';

const router = createBrowserRouter([
  {
    path: '/',
    element: <SidebarLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'audit', element: <AuditPage /> },
      { path: 'audit/:repo', element: <AuditPage /> },
      { path: 'roadmap', element: <Roadmap /> },
      // Phase 2 routes
      { path: 'templates', element: <TemplatesPage /> },
      { path: 'pipelines', element: <PipelinesPage /> },
      { path: 'dependencies', element: <DependenciesPage /> },
      { path: 'quality', element: <QualityPage /> },
    ],
  },
]);

export default function RouterRoot() {
  return <RouterProvider router={router} />;
}