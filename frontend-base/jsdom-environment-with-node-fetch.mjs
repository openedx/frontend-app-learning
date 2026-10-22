// This file can be removed if https://github.com/jsdom/jsdom/issues/1724 is resolved.
import jsdom from 'jest-environment-jsdom';

const JSDOMEnvironment = jsdom.default;

export default class JSDOMEnvironmentWithNodeFetch extends JSDOMEnvironment {
  constructor(...args) {
    super(...args);
    this.global.AbortController = AbortController;
    this.global.AbortSignal = AbortSignal;
    this.global.fetch = fetch;
    this.global.Headers = Headers;
    this.global.Request = Request;
    this.global.Response = Response;
  }
}
