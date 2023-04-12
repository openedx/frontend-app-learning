import HTMLRenderer from './renderers/HTMLRenderer';

export const renderers = {
  html: HTMLRenderer,
};

export const FRendlyTypes = Object.keys(renderers);

export default {
  renderers,
  FRendlyTypes,
};
