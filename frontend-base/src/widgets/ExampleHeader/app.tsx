import { App, LinkMenuItem, WidgetOperationTypes } from '@openedx/frontend-base';

import { templateRole } from '../../constants';

const app: App = {
  appId: 'org.openedx.frontend.app.template.exampleHeader',
  slots: [
    {
      slotId: 'org.openedx.frontend.slot.header.primaryLinks.v1',
      id: 'org.openedx.frontend.widget.template.exampleHeaderLink.v1',
      op: WidgetOperationTypes.APPEND,
      element: (
        <LinkMenuItem
          label="Example Menu"
          role={templateRole}
          variant="navLink"
        />
      ),
      condition: {
        active: [templateRole],
      },
    },
  ],
};

export default app;
