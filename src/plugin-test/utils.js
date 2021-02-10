export function loadDynamicScript(url) {
  return new Promise((resolve, reject) => {
    const element = document.createElement('script');

    element.src = url;
    element.type = 'text/javascript';
    element.async = true;

    element.onload = () => {
      // eslint-disable-next-line no-console
      console.log(`Dynamic Script Loaded: ${url}`);
      resolve(element, url);
    };

    element.onerror = () => {
      reject(new Error(`Failed to load dynamic script with URL: ${url}`));
    };

    document.head.appendChild(element);
  });
}

export function loadScriptComponent(scope, module) {
  return async () => {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    // eslint-disable-next-line no-undef
    await __webpack_init_sharing__('default');

    const container = window[scope]; // or get the container somewhere else
    // Initialize the container, it may provide shared modules
    // eslint-disable-next-line no-undef
    await container.init(__webpack_share_scopes__.default);
    const factory = await window[scope].get(module);
    const Module = factory();
    return Module;
  };
}
