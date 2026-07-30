import React from 'react';
import { ProjectInfo } from '../types';

interface ProjectBannerProps {
  project: ProjectInfo | null;
  onRefresh: () => void;
  onInit: (mode: 'defaults' | 'interactive') => void;
}

export default function ProjectBanner({ project, onRefresh, onInit }: ProjectBannerProps) {
  if (!project) {
    return (
      <div className="project-banner warning">
        <div className="banner-content">
          <span className="banner-icon">&#9888;</span>
          <span>Open a React project to use Shadcn Helper</span>
        </div>
      </div>
    );
  }

  if (!project.isReact) {
    return (
      <div className="project-banner warning">
        <div className="banner-content">
          <span className="banner-icon">&#9888;</span>
          <span>Not a React project</span>
        </div>
      </div>
    );
  }

  const items: string[] = [];
  if (project.isNextJs) items.push('Next.js');
  items.push(project.packageManager);

  return (
    <div className={`project-banner ${project.hasShadcn ? 'success' : 'info'}`}>
      <div className="banner-content">
        <span className="banner-status">
          {project.hasShadcn ? 'shadcn/ui' : 'No shadcn/ui'}
        </span>
        <span className="banner-details">
          {items.join(' \u00B7 ')}
        </span>
        <button className="banner-refresh" onClick={onRefresh} title="Refresh">
          &#8635;
        </button>
      </div>
      <div className="banner-actions">
        {!project.hasShadcn && (
          <>
            <button className="banner-init-btn" onClick={() => onInit('defaults')} title="Quick Setup">
              Quick Setup
            </button>
            <button className="banner-init-btn interactive" onClick={() => onInit('interactive')} title="Interactive Setup">
              Terminal
            </button>
          </>
        )}
      </div>
    </div>
  );
}
