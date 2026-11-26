import { useState, useLayoutEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { debounce } from 'lodash';
import { useCoursewareSearchEnabled } from './data/apiHooks';

const DEBOUNCE_WAIT = 100; // ms

export function useCoursewareSearchFeatureFlag() {
  const { courseId } = useParams();
  return useCoursewareSearchEnabled(courseId).data?.enabled ?? false;
}

// Measures the element a ref points at. The legacy app looked up Learning's own tab strip by id, which the shell's course bar
// replaces; the caller now hands in a ref to an element of its own.
export function useElementBoundingBox(elementRef) {
  const [info, setInfo] = useState(undefined);

  useLayoutEffect(() => {
    const element = elementRef?.current;
    if (!element) {
      return undefined;
    }

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
  }, [elementRef]);

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
// The search rewrites the address without leaving the page: the reader stays where they are.
const inPlace = { preventScrollReset: true };
export function useCoursewareSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams(initSearchParams);
  const clearSearchParams = () => setSearchParams(initSearchParams, inPlace);

  const query = searchParams.get('q');
  const filter = searchParams.get('f')?.toLowerCase();

  const setQuery = (q) => setSearchParams((params) => ({ q, f: params.get('f') }), inPlace);
  const setFilter = (f) => setSearchParams((params) => ({ q: params.get('q'), f }), inPlace);

  return {
    query, filter, setQuery, setFilter, clearSearchParams,
  };
}
