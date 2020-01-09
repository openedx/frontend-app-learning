import { useContext, useMemo, useState, useEffect } from 'react';
import { AppContext } from '@edx/frontend-platform/react';

import CourseStructureContext from './CourseStructureContext';
import { findBlockAncestry, getCourseBlocks, createBlocksMap } from './api';

export function useBlockAncestry(blockId) {
  const { blocks, loaded } = useContext(CourseStructureContext);
  return useMemo(() => {
    if (!loaded) {
      return [];
    }
    return findBlockAncestry(
      blocks,
      blockId,
    );
  }, [blocks, blockId, loaded]);
}

export function useCourseStructure(courseId) {
  const { authenticatedUser } = useContext(AppContext);

  const [blocks, setBlocks] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [courseBlockId, setCourseBlockId] = useState();

  useEffect(() => {
    setLoaded(false);
    getCourseBlocks(courseId, authenticatedUser.username).then((blocksData) => {
      setBlocks(createBlocksMap(blocksData.blocks));
      setCourseBlockId(blocksData.root);
      setLoaded(true);
    });
  }, [courseId]);

  return {
    blocks, loaded, courseBlockId,
  };
}
