import { templateRole } from './constants';

const routes = [
  {
    id: 'org.openedx.frontend.route.template.main',
    path: 'template',
    handle: {
      roles: [templateRole],
    },
    async lazy() {
      const module = await import(/* webpackChunkName: "template-main" */ './Main');
      return { Component: module.default };
    },
    children: [
      {
        index: true,
        async lazy() {
          const module = await import(/* webpackChunkName: "template-example" */ './example/ExamplePage');
          return { Component: module.default };
        },
      },
    ],
  },
];

export default routes;
