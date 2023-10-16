import { useState, useLayoutEffect, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { fetchCoursewareSearchSettings } from '../data/thunks';

export function useCoursewareSearchFeatureFlag() {
  const { courseId } = useParams();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    fetchCoursewareSearchSettings(courseId).then(response => setEnabled(response.enabled));
  }, [courseId]);

  return enabled;
}

export function useCoursewareSearchState() {
  const enabled = useCoursewareSearchFeatureFlag();
  const show = useSelector(state => state.courseHome.showSearch);

  return { show: enabled && show };
}

export function useElementBoundingBox(elementId) {
  const [elementInfo, setElementInfo] = useState(undefined);

  useLayoutEffect(() => {
    // Handler to call on window resize and scroll
    function recalculate() {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Unable to find element with id="${elementId}" in the document.`);
      }
      const info = element.getBoundingClientRect();
      setElementInfo(info);
    }

    // Add event listener
    global.addEventListener('resize', recalculate);
    global.addEventListener('scroll', recalculate);

    // Call handler right away so state gets updated with initial window size
    recalculate();

    // Remove event listener on cleanup
    return () => {
      global.removeEventListener('resize', recalculate);
      global.removeEventListener('scroll', recalculate);
    };
  }, []); // Empty array ensures that effect is only run on mount

  return elementInfo;
}

export function useLockScroll() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.classList.add('_search-no-scroll');

    return () => {
      document.body.classList.remove('_search-no-scroll');
    };
  }, []);
}
