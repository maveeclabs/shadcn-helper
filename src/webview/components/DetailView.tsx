import React from 'react';
import { ShadcnComponent, InstallFlowStatus, UIVariant } from '../types';

interface DetailViewProps {
  component: ShadcnComponent;
  onBack: () => void;
  onInstall: (name: string) => void;
  installStatus?: InstallFlowStatus;
  uiVariant?: UIVariant;
}

export default function DetailView({
  component,
  onBack,
  onInstall,
  installStatus,
  uiVariant
}: DetailViewProps) {
  const isInstalled = component.status === 'installed';
  const [docsOpen, setDocsOpen] = React.useState(false);
  const isInstalling = installStatus === 'installing';
  const isBaseUI = uiVariant === 'base-ui';
  const isUnknown = uiVariant === 'unknown';
  const hasMissingDeps = !isBaseUI && !isUnknown && component.dependenciesCheck &&
    !component.dependenciesCheck.allInstalled;

  return (
    <div className="detail-view">
      <button className="back-btn" onClick={onBack}>
        &larr; Back
      </button>

      <div className="detail-header">
        <h2>{component.name}</h2>
        {component.status && (
          <span className={`status-badge ${component.status === 'installed' ? 'installed' : 'not-installed'}`}>
            {component.status === 'installed' ? 'Installed' : 'Not Installed'}
          </span>
        )}
        {uiVariant && uiVariant !== 'unknown' && (
          <span className={`variant-badge variant-${uiVariant}`}>
            {uiVariant === 'base-ui' ? 'Base UI' : uiVariant === 'radix' ? 'Radix UI' : 'React Aria'}
          </span>
        )}
      </div>

      <p className="detail-description">{component.description}</p>

      <div className="detail-actions">
        {!isInstalled && (
          <button
            className="action-btn primary large"
            onClick={() => onInstall(component.name)}
            disabled={isInstalling}
          >
            {isInstalling ? 'Installing...' : `Install ${component.name}`}
          </button>
        )}
      </div>

      {!isBaseUI && !isUnknown && component.dependencies.length > 0 && (
        <section className="detail-section">
          <h4>Dependencies</h4>
          <ul className="dependency-list">
            {component.dependencies.map(dep => (
              <li key={dep} className={hasMissingDeps ? 'missing' : ''}>
                {dep}
              </li>
            ))}
          </ul>
        </section>
      )}

      {component.registryDependencies.length > 0 && (
        <section className="detail-section">
          <h4>Required Components</h4>
          <div className="required-components">
            {component.registryDependencies.map(dep => (
              <span key={dep} className="required-component-tag">{dep}</span>
            ))}
          </div>
        </section>
      )}

      {!isBaseUI && !isUnknown && component.dependenciesCheck && !component.dependenciesCheck.allInstalled && (
        <section className="detail-section warning">
          <h4>Missing Dependencies</h4>
          <p>The following dependencies are required but not installed:</p>
          <ul className="dependency-list missing">
            {component.dependenciesCheck.missingDependencies.map(dep => (
              <li key={dep}>{dep}</li>
            ))}
          </ul>
        </section>
      )}

      {component.docsUrl && (
        <section className="detail-section">
          <button className="docs-toggle" onClick={() => setDocsOpen(!docsOpen)}>
            <h4>Documentation</h4>
            <span className={`docs-chevron ${docsOpen ? 'open' : ''}`}>▶</span>
          </button>
          {docsOpen && (
            <div className="docs-iframe-container">
              <iframe
                src={component.docsUrl}
                className="docs-iframe"
                title={`${component.name} documentation`}
              />
            </div>
          )}
        </section>
      )}
    </div>
  );
}
