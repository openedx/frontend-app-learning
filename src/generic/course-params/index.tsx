import {
  createContext, type ReactNode, useContext, useMemo,
} from 'react';

/*
 * The course a tab renders, and where in it: what the route params held before a page passed them on as props. Only
 * route pages read the route; everything below a tab root reads these hooks.
 */
export interface CourseParams {
  courseId: string;
  sequenceId?: string;
  unitId?: string;
  targetUserId?: string;
  isPreview?: boolean;
}

const CourseParamsContext = createContext<CourseParams | null>(null);

export const CourseParamsProvider = ({
  courseId, sequenceId, unitId, targetUserId, isPreview = false, children,
}: CourseParams & { children?: ReactNode }) => {
  const value = useMemo(() => ({
    courseId, sequenceId, unitId, targetUserId, isPreview,
  }), [courseId, sequenceId, unitId, targetUserId, isPreview]);
  return <CourseParamsContext.Provider value={value}>{children}</CourseParamsContext.Provider>;
};

const useCourseParams = (hook: string): CourseParams => {
  const params = useContext(CourseParamsContext);
  if (!params) {
    throw new Error(`${hook} must be used within a CourseParamsProvider`);
  }
  return params;
};

export const useCourseId = (): string => useCourseParams('useCourseId').courseId;

export const useSequenceId = (): string | undefined => useCourseParams('useSequenceId').sequenceId;

export const useUnitId = (): string | undefined => useCourseParams('useUnitId').unitId;

export const useTargetUserId = (): string | undefined => useCourseParams('useTargetUserId').targetUserId;

export const useIsPreview = (): boolean => !!useCourseParams('useIsPreview').isPreview;
