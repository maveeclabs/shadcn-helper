export interface ComponentFile {
  path: string;
  content?: string;
  target?: string;
  type?: string;
}

export interface ShadcnComponent {
  name: string;
  description: string;
  dependencies: string[];
  registryDependencies: string[];
  files: ComponentFile[];
  docsUrl?: string;
  examplesCode?: string;
}

export interface ProjectInfo {
  isReact: boolean;
  isNextJs: boolean;
  hasShadcn: boolean;
  hasComponentsJson: boolean;
  packageManager: PackageManager;
  shadcnVersion?: string;
  uiVariant: UIVariant;
}

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

export type UIVariant = 'base-ui' | 'radix' | 'react-aria' | 'unknown';

export type InstallStatus = 'installed' | 'not-installed' | 'unknown';

export interface ComponentStatus {
  name: string;
  status: InstallStatus;
}

export interface RegistryInfo {
  components: ShadcnComponent[];
  registryUrl: string;
}

export interface WebviewMessage {
  type: string;
  payload?: unknown;
}

export interface SearchResult {
  query: string;
  results: ShadcnComponent[];
}
