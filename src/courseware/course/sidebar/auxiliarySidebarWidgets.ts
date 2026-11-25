import {
  isWidgetOptionsOperation, matchesWidgetId, useWidgetOperations, useWidgetsForId,
} from '@openedx/frontend-base';
import { useMemo, type ComponentType, type ReactNode } from 'react';

import type { CourseHomeMeta } from '@src/course-home/data/api';
import type { DiscussionTopic } from '@src/courseware/data/apiHooks';
import type { CoursewareMeta } from '@src/courseware/data/coursewareMeta';
import type { MinimalCourseMetadata } from '@src/courseware/data/minimalCourseOutline';
import { auxiliarySidebarSlotId } from '@src/slots/AuxiliarySidebarSlot';

// The course data an availability check is handed: the three metadata queries' results, merged.
export const buildWidgetCourse = (
  coursewareMetadata?: CoursewareMeta,
  minimalCourseMetadata?: MinimalCourseMetadata,
  courseHomeMeta?: CourseHomeMeta,
) => ({ ...coursewareMetadata, ...minimalCourseMetadata, ...courseHomeMeta });

// What a widget's `isAvailable` is asked about: the unit the learner is on. Every field of `course` is optional,
// since the first check can run before the data it reads has arrived. `unit` is the unit's discussion topic.
export interface SidebarAvailabilityContext {
  courseId: string;
  unitId: string;
  course: ReturnType<typeof buildWidgetCourse>;
  unit?: DiscussionTopic;
}

// The options of a sidebar widget: what a widget options operation on its panel, in the auxiliary sidebar slot, can set.
export interface AuxiliarySidebarWidgetOptions {
  // Whether the widget is offered on this unit. Default: always.
  isAvailable?: (context: SidebarAvailabilityContext) => boolean;
  // Mounted inside the sidebar provider, around the whole page, whether or not the widget is available.
  Provider?: ComponentType<{ children: ReactNode }>;
}

// A sidebar widget as SidebarProvider and its behavior hooks see it: a panel's ID, with its options.
export interface SidebarWidget extends AuxiliarySidebarWidgetOptions {
  id: string;
}

// The two options, from whatever the operations set: a value of the wrong kind is left out, so the default applies.
const readOptions = ({ isAvailable, Provider }: Record<string, unknown>): AuxiliarySidebarWidgetOptions => ({
  ...(typeof isAvailable === 'function' && { isAvailable: isAvailable as AuxiliarySidebarWidgetOptions['isAvailable'] }),
  ...((typeof Provider === 'function' || (typeof Provider === 'object' && Provider !== null))
    && { Provider: Provider as AuxiliarySidebarWidgetOptions['Provider'] }),
});

// A number for each function or component the options hold, to tell one list of widgets from the next.
const identities = new WeakMap<object, number>();
let lastIdentity = 0;
const identityOf = (value?: object) => {
  if (!value) {
    return 0;
  }
  if (!identities.has(value)) {
    lastIdentity += 1;
    identities.set(value, lastIdentity);
  }
  return identities.get(value);
};

/*
 * The sidebar widgets: each widget ID that survives every operation on the panel slot, in the slot's order, with the
 * options the slot's operations set on it (they merge in the order the operations were declared, so a later app can
 * change one option of an earlier app's widget). That order is the order the widgets are offered in: the first
 * available one opens, and their triggers follow it. Options for a widget with no panel are ignored, which is what
 * lets a site switch a widget off by removing its panel, or put a condition on it.
 */
export const useAuxiliarySidebarWidgets = (): SidebarWidget[] => {
  const { identified } = useWidgetsForId(auxiliarySidebarSlotId);
  const operations = useWidgetOperations(auxiliarySidebarSlotId);

  // A widget can have several nodes under one ID: it counts once.
  const panels = identified.filter((widget, index) => identified.findIndex(({ id }) => id === widget.id) === index);
  const widgets = panels.map((panel) => {
    const options = operations
      .filter(isWidgetOptionsOperation)
      .filter(operation => matchesWidgetId(panel, operation.relatedId))
      .reduce<Record<string, unknown>>((merged, operation) => ({ ...merged, ...operation.options }), {});
    return { id: panel.id, ...readOptions(options) };
  });

  // The list is rebuilt on every render: hand on the same one until a widget or an option changes, so the behavior
  // hooks downstream keep a stable list.
  const key = widgets
    .map(({ id, isAvailable, Provider }) => `${id} ${identityOf(isAvailable)} ${identityOf(Provider)}`)
    .join('\n');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => widgets, [key]);
};
