import { useContext, useMemo, useState, useEffect } from 'react';
import { AppContext } from '@edx/frontend-platform/react';

import CourseStructureContext from './CourseStructureContext';
import { findBlockAncestry, getCourseBlocks, createBlocksMap, createSubSectionIdList, createUnitIdList } from './api';

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

  const [blocks, setBlocks] = useState(null);
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

export function useCurrentCourse() {
  const { loaded, courseBlockId, blocks } = useContext(CourseStructureContext);

  return loaded ? blocks[courseBlockId] : null;
}

export function useCurrentSubSection() {
  const { loaded, blocks, subSectionId } = useContext(CourseStructureContext);

  return loaded ? blocks[subSectionId] : null;
}

export function useCurrentSection() {
  const { loaded, blocks } = useContext(CourseStructureContext);
  const subSection = useCurrentSubSection();
  return loaded ? blocks[subSection.parentId] : null;
}

export function useCurrentUnit() {
  const { loaded, blocks, unitId } = useContext(CourseStructureContext);

  return loaded ? blocks[unitId] : null;
}


export function useUnitIds() {
  const { loaded, blocks, courseBlockId } = useContext(CourseStructureContext);

  return useMemo(
    () => (loaded ? createUnitIdList(blocks, courseBlockId) : []),
    [loaded, blocks, courseBlockId],
  );
}


export function usePreviousUnit() {
  const { loaded, blocks, unitId } = useContext(CourseStructureContext);
  const unitIds = useUnitIds();

  const currentUnitIndex = unitIds.indexOf(unitId);
  if (currentUnitIndex === 0) {
    return null;
  }
  return loaded ? blocks[unitIds[currentUnitIndex - 1]] : null;
}

export function useNextUnit() {
  const { loaded, blocks, unitId } = useContext(CourseStructureContext);
  const unitIds = useUnitIds();

  const currentUnitIndex = unitIds.indexOf(unitId);
  if (currentUnitIndex === unitIds.length - 1) {
    return null;
  }
  return loaded ? blocks[unitIds[currentUnitIndex + 1]] : null;
}

export function useCurrentSubSectionUnits() {
  const { blocks } = useContext(CourseStructureContext);
  const subSection = useCurrentSubSection();
  return subSection.children.map(id => blocks[id]);
}

export function useSubSectionIdList() {
  const { loaded, blocks, courseBlockId } = useContext(CourseStructureContext);

  const subSectionIdList = useMemo(
    () => (loaded ? createSubSectionIdList(blocks, courseBlockId) : []),
    [blocks, courseBlockId],
  );

  return subSectionIdList;
}
