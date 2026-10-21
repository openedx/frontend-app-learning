import { SlotOperation } from '@openedx/frontend-base';

import { exampleHeaderApp } from './widgets/ExampleHeader';

const slots: SlotOperation[] = [
  ...(exampleHeaderApp.slots ?? []),
];

export default slots;
