import type { RemoteModule } from './FederatedRemote';

type Container = {
  init: (shareScope: unknown) => Promise<void> | void;
  get: (module: string) => Promise<() => RemoteModule>;
};

type RemoteWindow = Window & Record<string, Container | undefined>;

type RemoteDefinition = {
  url: string;
  scope: string;
  module: string;
};

declare const __webpack_init_sharing__: (scope: string) => Promise<void>;
declare const __webpack_share_scopes__: { default: unknown };

const scriptPromises = new Map<string, Promise<Container>>();
const initializedContainers = new WeakSet<Container>();

function loadContainer(url: string, scope: string) {
  const existingContainer = (window as unknown as RemoteWindow)[scope];

  if (existingContainer) {
    return Promise.resolve(existingContainer);
  }

  const existingPromise = scriptPromises.get(scope);

  if (existingPromise) {
    return existingPromise;
  }

  const promise = new Promise<Container>((resolve, reject) => {
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => {
      script.remove();
      scriptPromises.delete(scope);
      reject(new Error(`${scope} remote zaman aşımına uğradı`));
    }, 5000);

    script.src = url;
    script.async = true;
    script.onload = () => {
      window.clearTimeout(timeout);
      const container = (window as unknown as RemoteWindow)[scope];

      if (container) {
        resolve(container);
      } else {
        scriptPromises.delete(scope);
        reject(new Error(`${scope} container bulunamadı`));
      }
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      script.remove();
      scriptPromises.delete(scope);
      reject(new Error(`${scope} remote yüklenemedi`));
    };

    document.head.appendChild(script);
  });

  scriptPromises.set(scope, promise);
  return promise;
}

export async function loadRemote({ url, scope, module }: RemoteDefinition): Promise<RemoteModule> {
  const container = await loadContainer(url, scope);
  await __webpack_init_sharing__('default');

  if (!initializedContainers.has(container)) {
    await container.init(__webpack_share_scopes__.default);
    initializedContainers.add(container);
  }

  const factory = await container.get(module);
  return factory();
}

