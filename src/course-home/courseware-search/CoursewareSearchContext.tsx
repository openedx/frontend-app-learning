import React, {
  createContext, useContext, useMemo, useState, ReactNode,
} from 'react';

interface CoursewareSearchContextValue {
  show: boolean;
  open: () => void;
  close: () => void;
}

const CoursewareSearchContext = createContext<CoursewareSearchContextValue | null>(null);

export const CoursewareSearchProvider = ({ children }: { children: ReactNode }) => {
  const [show, setShow] = useState(false);

  const value = useMemo<CoursewareSearchContextValue>(() => ({
    show,
    open: () => setShow(true),
    close: () => setShow(false),
  }), [show]);

  return <CoursewareSearchContext.Provider value={value}>{children}</CoursewareSearchContext.Provider>;
};

export const useCoursewareSearch = (): CoursewareSearchContextValue => {
  const context = useContext(CoursewareSearchContext);
  if (!context) {
    throw new Error('useCoursewareSearch must be used within a CoursewareSearchProvider');
  }
  return context;
};
