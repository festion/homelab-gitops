// File: dashboard/src/pages/home.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileSearch,
  FileText,
  GitBranch,
  Network,
  Shield,
  TrendingUp,
  Zap,
  CheckCircle,
} from 'lucide-react';

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  status: 'active' | 'new' | 'updated';
}> = ({ icon, title, description, link, status }) => (
  <Link
    to={link}
    className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">{icon}</div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {status === 'new' && (
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
          NEW
        </span>
      )}
      {status === 'updated' && (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
          UPDATED
        </span>
      )}
    </div>
    <p className="text-gray-600 text-sm">{description}</p>
  </Link>
);

const StatCard: React.FC<{ label: string; value: string; change?: string }> = ({
  label,
  value,
  change,
}) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      {change && (
        <div className="flex items-center text-green-600">
          <TrendingUp size={16} />
          <span className="text-sm font-medium ml-1">{change}</span>
        </div>
      )}
    </div>
  </div>
);

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">GitOps Advanced DevOps Platform</h1>
        <p className="text-blue-100 mb-4">
          Complete repository management, CI/CD orchestration, and quality assurance
        </p>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <CheckCircle size={16} className="mr-2" />
            <span>Phase 1B: Template Engine</span>
          </div>
          <div className="flex items-center">
            <Zap size={16} className="mr-2" />
            <span>Phase 2: DevOps Platform Active</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Repositories" value="12" change="+2" />
        <StatCard label="Active Pipelines" value="5" change="+5" />
        <StatCard label="Templates Applied" value="8" change="+8" />
        <StatCard label="Quality Gates" value="3" change="+3" />
      </div>

      {/* Feature Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Core Features */}
          <FeatureCard
            icon={<FileSearch className="text-blue-600" size={24} />}
            title="Repository Audit"
            description="Monitor repository health, track changes, and ensure compliance across your GitOps environment."
            link="/audit"
            status="active"
          />

          {/* Phase 2 Features */}
          <FeatureCard
            icon={<FileText className="text-green-600" size={24} />}
            title="Template Management"
            description="Apply standardized DevOps templates across repositories with batch operations and rollback support."
            link="/templates"
            status="new"
          />

          <FeatureCard
            icon={<GitBranch className="text-purple-600" size={24} />}
            title="CI/CD Pipelines"
            description="Design, execute, and monitor continuous integration pipelines with visual workflow builder."
            link="/pipelines"
            status="new"
          />

          <FeatureCard
            icon={<Network className="text-orange-600" size={24} />}
            title="Dependency Tracking"
            description="Visualize and coordinate dependencies across repositories with impact analysis."
            link="/dependencies"
            status="new"
          />

          <FeatureCard
            icon={<Shield className="text-red-600" size={24} />}
            title="Quality Gates"
            description="Enforce code quality standards with automated gates and compliance monitoring."
            link="/quality"
            status="new"
          />

          <FeatureCard
            icon={<TrendingUp className="text-indigo-600" size={24} />}
            title="Project Roadmap"
            description="View development progress and upcoming features in the platform evolution."
            link="/roadmap"
            status="updated"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Phase 2 pipeline engine deployed successfully</span>
            </div>
            <span className="text-xs text-gray-500">2 min ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Dependency scanner operational</span>
            </div>
            <span className="text-xs text-gray-500">5 min ago</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm">Template engine backup system active</span>
            </div>
            <span className="text-xs text-gray-500">10 min ago</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/templates"
            className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText size={20} className="mr-2" />
            Apply Template
          </Link>
          <Link
            to="/pipelines"
            className="flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <GitBranch size={20} className="mr-2" />
            Create Pipeline
          </Link>
          <Link
            to="/dependencies"
            className="flex items-center justify-center p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Network size={20} className="mr-2" />
            Scan Dependencies
          </Link>
        </div>
      </div>
    </div>
  );
}
