import React from 'react';
import { ShadcnComponent, InstallFlowStatus, UIVariant } from '../types';

interface DetailViewProps {
  component: ShadcnComponent;
  onBack: () => void;
  onInstall: (name: string) => void;
  onOpenDocs: (url: string) => void;
  installStatus?: InstallFlowStatus;
  uiVariant?: UIVariant;
}

export default function DetailView({
  component,
  onBack,
  onInstall,
  onOpenDocs,
  installStatus,
  uiVariant
}: DetailViewProps) {
  const [copied, setCopied] = React.useState(false);
  const isInstalled = component.status === 'installed';
  const isInstalling = installStatus === 'installing';
  const isBaseUI = uiVariant === 'base-ui';
  const hasMissingDeps = !isBaseUI && component.dependenciesCheck &&
    !component.dependenciesCheck.allInstalled;

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.debug('Clipboard API not available');
    }
  };

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

      {!isBaseUI && component.dependencies.length > 0 && (
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

      {!isBaseUI && component.dependenciesCheck && !component.dependenciesCheck.allInstalled && (
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

      {component.examplesCode && (
        <section className="detail-section">
          <div className="section-header">
            <h4>Usage Examples</h4>
            <button className="copy-btn" onClick={() => handleCopy(component.examplesCode!)}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="example-code"><code>{component.examplesCode}</code></pre>
        </section>
      )}

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

        {component.docsUrl && (
          <button
            className="action-btn secondary large"
            onClick={() => onOpenDocs(component.docsUrl!)}
          >
            Open Documentation
          </button>
        )}
      </div>
    </div>
  );
}
