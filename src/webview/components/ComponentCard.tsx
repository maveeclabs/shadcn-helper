import React from 'react';
import { ShadcnComponent, InstallFlowStatus } from '../types';

interface ComponentCardProps {
  component: ShadcnComponent;
  onInstall: (name: string) => void;
  onViewDetails: (name: string) => void;
  onOpenDocs: (url: string) => void;
  installStatus?: InstallFlowStatus;
}

export default function ComponentCard({
  component,
  onInstall,
  onViewDetails,
  onOpenDocs,
  installStatus
}: ComponentCardProps) {
  const isInstalled = component.status === 'installed';
  const isInstalling = installStatus === 'installing';

  return (
    <div
      className={`component-card ${isInstalled ? 'installed' : ''}`}
      onClick={() => onViewDetails(component.name)}
    >
      <div className="card-header">
        <h3 className="card-title">{component.name}</h3>
        {isInstalled && <span className="status-badge installed">Installed</span>}
      </div>

      <p className="card-description">{component.description}</p>

      <div className="card-actions" onClick={e => e.stopPropagation()}>
        {!isInstalled && (
          <button
            className="action-btn primary"
            onClick={() => onInstall(component.name)}
            disabled={isInstalling}
          >
            {isInstalling ? 'Installing...' : 'Install'}
          </button>
        )}

        <button
          className="action-btn secondary"
          onClick={() => onViewDetails(component.name)}
        >
          Details
        </button>

        {component.docsUrl && (
          <button
            className="action-btn link"
            onClick={() => onOpenDocs(component.docsUrl!)}
          >
            Docs
          </button>
        )}
      </div>
    </div>
  );
}
