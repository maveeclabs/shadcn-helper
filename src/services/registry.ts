import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';
import * as path from 'path';
import { URL } from 'url';
import { Logger } from '../utils/logger';
import { getWorkspaceRoot } from '../utils/workspace';
import { ShadcnComponent, ComponentFile } from '../types';

const logger = Logger.getInstance();

interface V4IndexItem {
  name: string;
  type: string;
  registryDependencies?: string[];
  files: Array<{ path: string; type: string }>;
  meta?: {
    links?: {
      base?: { docs?: string; examples?: string; api?: string };
      aria?: { docs?: string; examples?: string; api?: string };
      radix?: { docs?: string; examples?: string; api?: string };
    };
  };
}

interface V4ComponentResponse {
  $schema?: string;
  name: string;
  type: string;
  author?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: Array<{
    path: string;
    content?: string;
    type: string;
    target?: string;
  }>;
}

const STYLE_PRIORITY = ['default', 'new-york', 'new-york-v4'];

function detectStyle(): string {
  const root = getWorkspaceRoot();
  if (!root) return 'default';

  try {
    const componentsJsonPath = path.join(root, 'components.json');
    if (fs.existsSync(componentsJsonPath)) {
      const config = JSON.parse(fs.readFileSync(componentsJsonPath, 'utf-8'));
      if (config.style && STYLE_PRIORITY.includes(config.style)) {
        return config.style;
      }
    }
  } catch {
    logger.debug('Failed to parse components.json for style detection');
  }
  return 'default';
}

const DEFAULT_COMPONENTS: ShadcnComponent[] = [
  { name: 'Accordion', description: 'A vertically stacked set of interactive headings that each reveal a section of content.', dependencies: ['@radix-ui/react-accordion'], registryDependencies: [], files: [] },
  { name: 'Alert', description: 'Displays a callout for user attention.', dependencies: ['@radix-ui/react-alert-dialog'], registryDependencies: [], files: [] },
  { name: 'Alert Dialog', description: 'A modal dialog that interrupts the user with important content.', dependencies: ['@radix-ui/react-alert-dialog'], registryDependencies: [], files: [] },
  { name: 'Aspect Ratio', description: 'Displays content within a desired ratio.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Attachment', description: 'Displays a file or image attachment with media, metadata, upload state, and actions.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Avatar', description: 'An image element with a fallback for representing the user.', dependencies: ['@radix-ui/react-avatar'], registryDependencies: [], files: [] },
  { name: 'Badge', description: 'Displays a badge or a component that looks like a badge.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Breadcrumb', description: 'Displays the path to the current resource using a hierarchy of links.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Bubble', description: 'Displays conversational content in a message bubble with variants, alignment, and reactions.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Button', description: 'Displays a button or a component that looks like a button.', dependencies: ['@radix-ui/react-slot'], registryDependencies: [], files: [] },
  { name: 'Button Group', description: 'A container that groups related buttons together with consistent styling.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Calendar', description: 'A date calendar component.', dependencies: ['date-fns', 'react-day-picker'], registryDependencies: [], files: [] },
  { name: 'Card', description: 'Displays a card with header, content, and footer sections.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Carousel', description: 'A carousel with motion and swipe built using Embla.', dependencies: ['embla-carousel'], registryDependencies: [], files: [] },
  { name: 'Chart', description: 'Beautiful charts built using Recharts.', dependencies: ['recharts'], registryDependencies: [], files: [] },
  { name: 'Checkbox', description: 'A control that allows the user to toggle between checked and not checked.', dependencies: ['@radix-ui/react-checkbox'], registryDependencies: [], files: [] },
  { name: 'Collapsible', description: 'An interactive component which expands/collapses a panel.', dependencies: ['@radix-ui/react-collapsible'], registryDependencies: [], files: [] },
  { name: 'Combobox', description: 'Autocomplete input and command palette with a list of suggestions.', dependencies: ['@radix-ui/react-popover', 'cmdk'], registryDependencies: [], files: [] },
  { name: 'Command', description: 'Fast, composable, unstyled command palette.', dependencies: ['cmdk'], registryDependencies: [], files: [] },
  { name: 'Context Menu', description: 'Displays a menu at the right-click location.', dependencies: ['@radix-ui/react-context-menu'], registryDependencies: [], files: [] },
  { name: 'Data Table', description: 'Powerful table and datagrid built with TanStack Table.', dependencies: ['@tanstack/react-table'], registryDependencies: ['Table'], files: [] },
  { name: 'Date Picker', description: 'A date picker component with range and presets.', dependencies: ['date-fns', 'react-day-picker'], registryDependencies: ['Button', 'Calendar', 'Popover'], files: [] },
  { name: 'Dialog', description: 'A window overlaid on either the primary window or another dialog window.', dependencies: ['@radix-ui/react-dialog'], registryDependencies: [], files: [] },
  { name: 'Direction', description: 'A provider component that sets the text direction for your application.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Drawer', description: 'A drawer component built on top of Vaul.', dependencies: ['vaul'], registryDependencies: [], files: [] },
  { name: 'Dropdown Menu', description: 'Displays a menu to the user — such as a set of actions or functions.', dependencies: ['@radix-ui/react-dropdown-menu'], registryDependencies: [], files: [] },
  { name: 'Empty', description: 'Use the Empty component to display an empty state.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Field', description: 'Combine labels, controls, and help text to compose accessible form fields and grouped inputs.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Hover Card', description: 'For sighted users to preview content available behind a link.', dependencies: ['@radix-ui/react-hover-card'], registryDependencies: [], files: [] },
  { name: 'Input', description: 'Displays a form input field with a label.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Input Group', description: 'Add addons, buttons, and helper content to inputs.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Input OTP', description: 'A one-time password input component.', dependencies: ['input-otp'], registryDependencies: [], files: [] },
  { name: 'Item', description: 'A versatile component for displaying content with media, title, description, and actions.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Kbd', description: 'Used to display textual user input from keyboard.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Label', description: 'Renders an accessible label associated with controls.', dependencies: ['@radix-ui/react-label'], registryDependencies: [], files: [] },
  { name: 'Marker', description: 'Displays an inline status, system note, bordered row, or labeled separator in a conversation.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Menubar', description: 'A visually persistent menu common in desktop applications.', dependencies: ['@radix-ui/react-menubar'], registryDependencies: [], files: [] },
  { name: 'Message', description: 'Displays a message in a conversation, with optional avatar, header, footer, and alignment.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Message Scroller', description: 'A chat scroll container that anchors turns, follows streamed responses, and loads history without jumping.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Native Select', description: 'A styled native HTML select element with consistent design system integration.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Navigation Menu', description: 'A collection of navigation links.', dependencies: ['@radix-ui/react-navigation-menu'], registryDependencies: [], files: [] },
  { name: 'Pagination', description: 'Pagination for navigating through pages of content.', dependencies: [], registryDependencies: ['Button'], files: [] },
  { name: 'Popover', description: 'Displays rich content in a portal, triggered by a button.', dependencies: ['@radix-ui/react-popover'], registryDependencies: [], files: [] },
  { name: 'Progress', description: 'Displays an indicator showing the completion progress of a task.', dependencies: ['@radix-ui/react-progress'], registryDependencies: [], files: [] },
  { name: 'Radio Group', description: 'A set of checkable buttons where no more than one can be checked.', dependencies: ['@radix-ui/react-radio-group'], registryDependencies: [], files: [] },
  { name: 'Resizable', description: 'Resizable panels with splitter support.', dependencies: ['react-resizable-panels'], registryDependencies: [], files: [] },
  { name: 'Scroll Area', description: 'Custom styled scrollbar component.', dependencies: ['@radix-ui/react-scroll-area'], registryDependencies: [], files: [] },
  { name: 'Select', description: 'Displays a list of options for the user to pick from.', dependencies: ['@radix-ui/react-select'], registryDependencies: [], files: [] },
  { name: 'Separator', description: 'Visually or semantically separates content.', dependencies: ['@radix-ui/react-separator'], registryDependencies: [], files: [] },
  { name: 'Sheet', description: 'Extends the Dialog component to display content from the edge.', dependencies: ['@radix-ui/react-dialog'], registryDependencies: [], files: [] },
  { name: 'Sidebar', description: 'A collapsible sidebar navigation component.', dependencies: ['@radix-ui/react-slot'], registryDependencies: ['Button', 'Separator', 'Sheet', 'Tooltip'], files: [] },
  { name: 'Skeleton', description: 'Loading placeholder that mimics the shape of content.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Slider', description: 'Allows users to select a value from a range.', dependencies: ['@radix-ui/react-slider'], registryDependencies: [], files: [] },
  { name: 'Spinner', description: 'An indicator that can be used to show a loading state.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Switch', description: 'A control that allows the user to toggle between two states.', dependencies: ['@radix-ui/react-switch'], registryDependencies: [], files: [] },
  { name: 'Table', description: 'A responsive table component.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Tabs', description: 'A set of layered sections of content displayed one at a time.', dependencies: ['@radix-ui/react-tabs'], registryDependencies: [], files: [] },
  { name: 'Textarea', description: 'Displays a form textarea field.', dependencies: [], registryDependencies: [], files: [] },
  { name: 'Toast', description: 'A succinct message displayed at the edge of the screen.', dependencies: ['sonner'], registryDependencies: [], files: [] },
  { name: 'Toggle', description: 'A two-state toggle button.', dependencies: ['@radix-ui/react-toggle'], registryDependencies: [], files: [] },
  { name: 'Toggle Group', description: 'A set of toggle buttons.', dependencies: ['@radix-ui/react-toggle-group'], registryDependencies: ['Toggle'], files: [] },
  { name: 'Tooltip', description: 'A popup that displays information when hovering over an element.', dependencies: ['@radix-ui/react-tooltip'], registryDependencies: [], files: [] },
  { name: 'Typography', description: 'A styling system for HTML and rendered markdown.', dependencies: [], registryDependencies: [], files: [] },
];

const componentDescriptions: Record<string, string> = {
  accordion: 'A vertically stacked set of interactive headings that each reveal a section of content.',
  alert: 'Displays a callout for user attention.',
  'alert-dialog': 'A modal dialog that interrupts the user with important content.',
  'aspect-ratio': 'Displays content within a desired ratio.',
  attachment: 'Displays a file or image attachment with media, metadata, upload state, and actions.',
  avatar: 'An image element with a fallback for representing the user.',
  badge: 'Displays a badge or a component that looks like a badge.',
  breadcrumb: 'Displays the path to the current resource using a hierarchy of links.',
  bubble: 'Displays conversational content in a message bubble with variants, alignment, and reactions.',
  button: 'Displays a button or a component that looks like a button.',
  'button-group': 'A container that groups related buttons together with consistent styling.',
  calendar: 'A date calendar component.',
  card: 'Displays a card with header, content, and footer sections.',
  carousel: 'A carousel with motion and swipe built using Embla.',
  chart: 'Beautiful charts built using Recharts.',
  checkbox: 'A control that allows the user to toggle between checked and not checked.',
  collapsible: 'An interactive component which expands/collapses a panel.',
  combobox: 'Autocomplete input and command palette with a list of suggestions.',
  command: 'Fast, composable, unstyled command palette.',
  'context-menu': 'Displays a menu at the right-click location.',
  'data-table': 'Powerful table and datagrid built with TanStack Table.',
  'date-picker': 'A date picker component with range and presets.',
  dialog: 'A window overlaid on either the primary window or another dialog window.',
  direction: 'A provider component that sets the text direction for your application.',
  drawer: 'A drawer component built on top of Vaul.',
  'dropdown-menu': 'Displays a menu to the user — such as a set of actions or functions.',
  empty: 'Use the Empty component to display an empty state.',
  field: 'Combine labels, controls, and help text to compose accessible form fields and grouped inputs.',
  'hover-card': 'For sighted users to preview content available behind a link.',
  input: 'Displays a form input field with a label.',
  'input-group': 'Add addons, buttons, and helper content to inputs.',
  'input-otp': 'A one-time password input component.',
  item: 'A versatile component for displaying content with media, title, description, and actions.',
  kbd: 'Used to display textual user input from keyboard.',
  label: 'Renders an accessible label associated with controls.',
  marker: 'Displays an inline status, system note, bordered row, or labeled separator in a conversation.',
  menubar: 'A visually persistent menu common in desktop applications.',
  message: 'Displays a message in a conversation, with optional avatar, header, footer, and alignment.',
  'message-scroller': 'A chat scroll container that anchors turns, follows streamed responses, and loads history without jumping.',
  'native-select': 'A styled native HTML select element with consistent design system integration.',
  'navigation-menu': 'A collection of navigation links.',
  pagination: 'Pagination for navigating through pages of content.',
  popover: 'Displays rich content in a portal, triggered by a button.',
  progress: 'Displays an indicator showing the completion progress of a task.',
  'radio-group': 'A set of checkable buttons where no more than one can be checked.',
  resizable: 'Resizable panels with splitter support.',
  'scroll-area': 'Custom styled scrollbar component.',
  select: 'Displays a list of options for the user to pick from.',
  separator: 'Visually or semantically separates content.',
  sheet: 'Extends the Dialog component to display content from the edge.',
  sidebar: 'A collapsible sidebar navigation component.',
  skeleton: 'Loading placeholder that mimics the shape of content.',
  slider: 'Allows users to select a value from a range.',
  spinner: 'An indicator that can be used to show a loading state.',
  switch: 'A control that allows the user to toggle between two states.',
  table: 'A responsive table component.',
  tabs: 'A set of layered sections of content displayed one at a time.',
  textarea: 'Displays a form textarea field.',
  toast: 'A succinct message displayed at the edge of the screen.',
  toggle: 'A two-state toggle button.',
  'toggle-group': 'A set of toggle buttons.',
  tooltip: 'A popup that displays information when hovering over an element.',
  typography: 'A styling system for HTML and rendered markdown.',
};

function getDescription(name: string, v4Item?: V4IndexItem): string {
  if (v4Item?.meta?.links) return '';
  return componentDescriptions[name.toLowerCase()] || '';
}

function getDocsUrl(name: string, variant?: string): string {
  const kebabName = name.toLowerCase().replace(/\s+/g, '-');
  if (variant && variant !== 'unknown') {
    return `https://ui.shadcn.com/docs/components/${variant}/${kebabName}`;
  }
  return `https://ui.shadcn.com/docs/components/${kebabName}`;
}

function fetchJSON<T>(urlStr: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const fetcher = url.protocol === 'https:' ? https : http;

    const req = fetcher.get(url.toString(), { timeout: 10000 }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url.origin);
        fetcher.get(redirectUrl.toString(), { timeout: 10000 }, (redirectRes) => {
          const chunks: Buffer[] = [];
          redirectRes.on('data', (chunk: Buffer) => chunks.push(chunk));
          redirectRes.on('end', () => {
            try {
              resolve(JSON.parse(Buffer.concat(chunks).toString()));
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', reject);
        return;
      }

      if (res.statusCode === 404) {
        reject(new Error(`Not found: ${urlStr}`));
        return;
      }

      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString()));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

function fetchText(urlStr: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const fetcher = url.protocol === 'https:' ? https : http;

    const req = fetcher.get(url.toString(), { timeout: 10000 }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url.origin);
        fetcher.get(redirectUrl.toString(), { timeout: 10000 }, (redirectRes) => {
          const chunks: Buffer[] = [];
          redirectRes.on('data', (chunk: Buffer) => chunks.push(chunk));
          redirectRes.on('end', () => {
            resolve(Buffer.concat(chunks).toString());
          });
        }).on('error', reject);
        return;
      }

      if (res.statusCode === 404) {
        reject(new Error(`Not found: ${urlStr}`));
        return;
      }

      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        resolve(Buffer.concat(chunks).toString());
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

export class RegistryService {
  private registryUrl: string;
  private components: ShadcnComponent[] = [];
  private fetched = false;
  private detailCache = new Map<string, ShadcnComponent>();
  private linksCache = new Map<string, NonNullable<V4IndexItem['meta']>>();

  constructor(registryUrl: string = 'https://ui.shadcn.com') {
    this.registryUrl = registryUrl;
  }

  setRegistryUrl(url: string): void {
    if (url !== this.registryUrl) {
      this.registryUrl = url;
      this.fetched = false;
      this.detailCache.clear();
      this.linksCache.clear();
    }
  }

  async fetchComponents(): Promise<ShadcnComponent[]> {
    if (this.fetched) {
      return this.components;
    }

    try {
      const index = await fetchJSON<V4IndexItem[]>(`${this.registryUrl}/r/index.json`);
      this.components = [];
      for (const item of index) {
        const lowerName = item.name.toLowerCase();
        if (item.meta) {
          this.linksCache.set(lowerName, item.meta);
        }
        this.components.push({
          name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
          description: getDescription(item.name, item),
          dependencies: [],
          registryDependencies: item.registryDependencies || [],
          files: item.files.map(f => ({ path: f.path, type: f.type })),
          docsUrl: getDocsUrl(item.name)
        });
      }
      this.fetched = true;
      logger.info(`Fetched ${this.components.length} components from registry v4 index`);
    } catch (error) {
      logger.warn(`Failed to fetch registry index, using defaults: ${error}`);
      this.components = DEFAULT_COMPONENTS.map(c => ({
        ...c,
        docsUrl: c.docsUrl || getDocsUrl(c.name)
      }));
      this.fetched = true;
    }

    return this.components;
  }

  getComponent(name: string): ShadcnComponent | undefined {
    return this.components.find(
      c => c.name.toLowerCase() === name.toLowerCase()
    );
  }

  searchComponents(query: string): ShadcnComponent[] {
    const lower = query.toLowerCase();
    return this.components.filter(c =>
      c.name.toLowerCase().includes(lower) ||
      c.description.toLowerCase().includes(lower)
    );
  }

  async fetchComponentDetail(name: string, uiVariant?: string): Promise<ShadcnComponent | undefined> {
    const lowerName = name.toLowerCase();

    const cached = this.detailCache.get(lowerName);
    if (cached) return cached;

    const base = this.getComponent(name);
    if (!base) return undefined;

    const style = detectStyle();
    const stylesToTry = [style, ...STYLE_PRIORITY.filter(s => s !== style)];

    let detail: ShadcnComponent | undefined;

    for (const s of stylesToTry) {
      try {
        const data = await fetchJSON<V4ComponentResponse>(
          `${this.registryUrl}/r/styles/${encodeURIComponent(s)}/${encodeURIComponent(lowerName)}.json`
        );

        detail = {
          name: base.name,
          description: base.description || getDescription(name),
          dependencies: data.dependencies || base.dependencies,
          registryDependencies: data.registryDependencies || base.registryDependencies,
          files: (data.files || []).map(f => ({
            path: f.path,
            content: f.content,
            target: f.target,
            type: f.type
          })),
          docsUrl: base.docsUrl
        };
        break;
      } catch (err) {
        logger.debug(`Style ${s} not available for ${lowerName}: ${err}`);
        continue;
      }
    }

    if (!detail) return base;

    const meta = this.linksCache.get(lowerName);
    const variantKey = uiVariant === 'base-ui' ? 'base' : uiVariant === 'react-aria' ? 'aria' : uiVariant === 'radix' ? 'radix' : undefined;
    const exampleUrl = variantKey ? meta?.links?.[variantKey as keyof typeof meta.links]?.examples : undefined;
    if (exampleUrl) {
      try {
        detail.examplesCode = await fetchText(exampleUrl);
      } catch (err) {
        logger.debug(`Failed to fetch examples for ${lowerName}: ${err}`);
      }
    }

    this.detailCache.set(lowerName, detail);
    return detail;
  }
}
