interface VSCodeAPI {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}

declare function acquireVsCodeApi(): VSCodeAPI;

let vscodeApi: VSCodeAPI | null = null;

function getVsCodeApi(): VSCodeAPI | null {
  if (!vscodeApi) {
    try {
      vscodeApi = acquireVsCodeApi();
    } catch {
      console.debug('acquireVsCodeApi not available');
      return null;
    }
  }
  return vscodeApi;
}

export function postMessage(message: unknown): void {
  const api = getVsCodeApi();
  if (api) {
    api.postMessage(message);
  }
}

export function useVSCode() {
  return { postMessage };
}
