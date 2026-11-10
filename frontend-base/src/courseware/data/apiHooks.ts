interface QueryOptions {
  enabled?: boolean;
}

type CoursewareQueryStub = (courseId: string | undefined, options?: QueryOptions) => { data: undefined };

// https://github.com/openedx/frontend-app-learning/issues/2195
export const useCoursewareMetadata: CoursewareQueryStub = () => ({ data: undefined });

// https://github.com/openedx/frontend-app-learning/issues/2195
export const useMinimalCourseOutline: CoursewareQueryStub = () => ({ data: undefined });
