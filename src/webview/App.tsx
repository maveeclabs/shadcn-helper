import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShadcnComponent, ProjectInfo, InstallResult, InstallFlowStatus, InitResult } from './types';
import { postMessage } from './hooks/useVSCode';
import SearchBar from './components/SearchBar';
import ComponentCard from './components/ComponentCard';
import DetailView from './components/DetailView';
import ProjectBanner from './components/ProjectBanner';
import FilterBar from './components/FilterBar';

export default function App() {
  const [components, setComponents] = useState<ShadcnComponent[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<ShadcnComponent[]>([]);
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<ShadcnComponent | null>(null);
  const [installStatus, setInstallStatus] = useState<Map<string, InstallFlowStatus>>(new Map());
  const [filterInstalled, setFilterInstalled] = useState<'all' | 'installed' | 'uninstalled'>('all');
  const [loading, setLoading] = useState(true);
  const [initRunning, setInitRunning] = useState(false);

  const selectedNameRef = useRef<string | null>(null);
  selectedNameRef.current = selectedComponent?.name ?? null;

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const message = event.data;
      if (!message || !message.type) return;

      switch (message.type) {
        case 'components':
          setComponents(message.payload as ShadcnComponent[]);
          setLoading(false);
          break;

        case 'projectInfo':
          setProject(message.payload as ProjectInfo);
          break;

        case 'searchResults':
          setFilteredComponents(message.payload.results);
          break;

        case 'installResult': {
          const result = message.payload as InstallResult;
          setInstallStatus(prev => {
            const next = new Map(prev);
            next.set(result.component, result.success ? 'success' : 'error');
            return next;
          });
          if (result.success) {
            setComponents(prev =>
              prev.map(c =>
                c.name === result.component ? { ...c, status: 'installed' } : c
              )
            );
          }
          break;
        }

        case 'installProgress': {
          const { component, status: installState } = message.payload as { component: string; status: string };
          if (installState === 'starting') {
            setInstallStatus(prev => {
              const next = new Map(prev);
              next.set(component, 'installing');
              return next;
            });
          }
          break;
        }

        case 'initProgress':
          setInitRunning(true);
          break;

        case 'initResult': {
          setInitRunning(false);
          if (message.payload.success) {
            if (!message.payload.interactive) {
              postMessage({ type: 'ready' });
            }
          }
          break;
        }

        case 'componentDetails':
          if (selectedNameRef.current && message.payload.name === selectedNameRef.current) {
            setSelectedComponent(message.payload as ShadcnComponent);
          }
          break;
      }
    };

    window.addEventListener('message', handler);
    postMessage({ type: 'ready' });

    return () => window.removeEventListener('message', handler);
  }, []);

  useEffect(() => {
    let result = components;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }

    if (filterInstalled === 'installed') {
      result = result.filter(c => c.status === 'installed');
    } else if (filterInstalled === 'uninstalled') {
      result = result.filter(c => c.status !== 'installed');
    }

    setFilteredComponents(result);
  }, [components, searchQuery, filterInstalled]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query) {
      postMessage({ type: 'search', payload: { query } });
    }
  }, []);

  const handleInstall = useCallback((name: string) => {
    postMessage({ type: 'install', payload: { name } });
    setInstallStatus(prev => {
      const next = new Map(prev);
      next.set(name, 'installing');
      return next;
    });
  }, []);

  const handleViewDetails = useCallback((name: string) => {
    const component = components.find(c => c.name === name);
    if (component) {
      setSelectedComponent(component);
      postMessage({ type: 'getDetails', payload: { name } });
    }
  }, [components]);

  const handleOpenDocs = useCallback((url: string) => {
    postMessage({ type: 'openDocs', payload: { url } });
  }, []);

  const handleInit = useCallback((mode: 'defaults' | 'interactive') => {
    setInitRunning(true);
    postMessage({ type: 'initShadcn', payload: { mode } });
  }, []);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    postMessage({ type: 'ready' });
  }, []);

  if (loading) {
    return (
      <div className="app">
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading components...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <ProjectBanner project={project} onRefresh={handleRefresh} onInit={handleInit} />

      {selectedComponent ? (
        <DetailView
          component={selectedComponent}
          onBack={() => setSelectedComponent(null)}
          onInstall={handleInstall}
          installStatus={installStatus.get(selectedComponent.name)}
          uiVariant={project?.uiVariant}
        />
      ) : (
        <>
          <div className="toolbar">
            <SearchBar value={searchQuery} onChange={handleSearch} />
            <FilterBar value={filterInstalled} onChange={setFilterInstalled} />
          </div>

          <div className="components-list">
            {filteredComponents.length === 0 ? (
              <div className="empty-state">
                {searchQuery
                  ? `No components matching "${searchQuery}"`
                  : 'No components found'}
              </div>
            ) : (
              filteredComponents.map(component => (
                <ComponentCard
                  key={component.name}
                  component={component}
                  onInstall={handleInstall}
                  onViewDetails={handleViewDetails}
                  onOpenDocs={handleOpenDocs}
                  installStatus={installStatus.get(component.name)}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
