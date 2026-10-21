import { useState, useLayoutEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { debounce } from 'lodash';
import { useCoursewareSearchEnabled } from './data/apiHooks';

const DEBOUNCE_WAIT = 100; // ms

export function useCoursewareSearchFeatureFlag() {
  const { courseId } = useParams();
  return useCoursewareSearchEnabled(courseId).data?.enabled ?? false;
}

export function useElementBoundingBox(elementId) {
  const [info, setInfo] = useState(undefined);

  const element = document.getElementById(elementId);

  if (!element) {
    console.warn(`useElementBoundingBox(): Unable to find element with id='${elementId}' in the document.`); // eslint-disable-line no-console
    return undefined;
  }

  useLayoutEffect(() => {
    // Handler to call on window resize and scroll
    function recalculate() {
      const bounds = element.getBoundingClientRect();
      setInfo(bounds);
    }
    const debouncedRecalculate = debounce(recalculate, DEBOUNCE_WAIT, { leading: true });

    // Add event listener
    global.addEventListener('resize', debouncedRecalculate);
    global.addEventListener('scroll', debouncedRecalculate);

    // Call handler right away so state gets updated with initial window size
    debouncedRecalculate();

    // Remove event listener on cleanup
    return () => {
      global.removeEventListener('resize', debouncedRecalculate);
      global.removeEventListener('scroll', debouncedRecalculate);
    };
  }, []);

  return info;
}

export function useLockScroll() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.body.classList.add('_search-no-scroll');

    return () => {
      document.body.classList.remove('_search-no-scroll');
    };
  }, []);
}

const initSearchParams = { q: '', f: '' };
export function useCoursewareSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams(initSearchParams);
  const clearSearchParams = () => setSearchParams(initSearchParams);

  const query = searchParams.get('q');
  const filter = searchParams.get('f')?.toLowerCase();

  const setQuery = (q) => setSearchParams((params) => ({ q, f: params.get('f') }));
  const setFilter = (f) => setSearchParams((params) => ({ q: params.get('q'), f }));

  return {
    query, filter, setQuery, setFilter, clearSearchParams,
  };
}
