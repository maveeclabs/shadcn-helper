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
  status?: 'installed' | 'not-installed' | 'unknown';
  dependenciesCheck?: {
    missingDependencies: string[];
    allInstalled: boolean;
  };
}

export type UIVariant = 'base-ui' | 'radix' | 'react-aria' | 'unknown';

export interface ProjectInfo {
  isReact: boolean;
  isNextJs: boolean;
  hasShadcn: boolean;
  hasComponentsJson: boolean;
  packageManager: string;
  shadcnVersion?: string;
  uiVariant: UIVariant;
  error?: string;
}

export interface InstallResult {
  success: boolean;
  component: string;
  output?: string;
  error?: string;
}

export interface InitResult {
  success: boolean;
  output?: string;
  error?: string;
  interactive?: boolean;
}

export interface WebviewMessage {
  type: string;
  payload?: unknown;
}

export type InstallFlowStatus = 'idle' | 'installing' | 'success' | 'error';
