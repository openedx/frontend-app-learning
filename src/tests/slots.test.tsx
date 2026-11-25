import { getSiteConfig, Slot, WidgetOperationTypes } from '@openedx/frontend-base';
import { screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';

import { render } from './render';
import { addSlotOperations, addTestApp, removeSlotOperations } from './slots';

describe('addSlotOperations', () => {
  const slotId = 'org.openedx.frontend.slot.learning.test.v1';
  const operation = {
    slotId, id: 'org.example.widget', op: WidgetOperationTypes.APPEND, element: <p>Test widget</p>,
  } as const;
  const siteConfigBeforeTests = getSiteConfig();

  it('installs operations that a slot renders', () => {
    addSlotOperations([operation]);
    addSlotOperations([{ ...operation, id: 'org.example.other', element: <p>Other widget</p> }]);

    render(<Slot id={slotId} />);

    expect(screen.getByText('Test widget')).toBeInTheDocument();
    expect(screen.getByText('Other widget')).toBeInTheDocument();
  });

  it('leaves no operations behind after a test', () => {
    expect(getSiteConfig()).toBe(siteConfigBeforeTests);

    render(<Slot id={slotId} />);

    expect(screen.queryByText('Test widget')).not.toBeInTheDocument();
  });

  it('installs an app whose providers the render helper mounts', () => {
    const Provider = ({ children }: { children?: ReactNode }) => <section aria-label="Test provider">{children}</section>;
    addTestApp({ providers: [Provider], slots: [operation] });

    render(<Slot id={slotId} />);

    expect(within(screen.getByRole('region', { name: 'Test provider' })).getByText('Test widget')).toBeInTheDocument();
  });

  it('restores the site config on demand, and only once', () => {
    addSlotOperations([operation]);
    removeSlotOperations();
    removeSlotOperations();

    expect(getSiteConfig()).toBe(siteConfigBeforeTests);
  });
});
