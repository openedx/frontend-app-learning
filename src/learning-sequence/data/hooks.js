import { useContext, useMemo, useState, useEffect } from 'react';
import { history } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';

import CourseStructureContext from '../CourseStructureContext';
import { getCourseBlocks } from './api';
import { findBlockAncestry, createBlocksMap, createSequenceIdList, createUnitIdList } from './utils';

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

export function useMissingSequenceRedirect(
  loaded,
  blocks,
  courseUsageKey,
  courseId,
  sequenceId,
) {
  useEffect(() => {
    if (loaded && !sequenceId) {
      const course = blocks[courseId];
      const nextSectionId = course.children[0];
      const nextSection = blocks[nextSectionId];
      const nextSequenceId = nextSection.children[0];
      const nextSequence = blocks[nextSequenceId];
      const nextUnitId = nextSequence.children[0];
      history.push(`/course/${courseUsageKey}/${nextSequenceId}/${nextUnitId}`);
    }
  }, [loaded, sequenceId]);
}

export function useLoadCourseStructure(courseUsageKey) {
  const { authenticatedUser } = useContext(AppContext);

  const [blocks, setBlocks] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [courseId, setCourseId] = useState();

  useEffect(() => {
    setLoaded(false);
    getCourseBlocks(courseUsageKey, authenticatedUser.username).then((blocksData) => {
      setBlocks(createBlocksMap(blocksData.blocks));
      setCourseId(blocksData.root);
      setLoaded(true);
    });
    // getCourse(courseUsageKey).then((courseData) => {

    // });
  }, [courseUsageKey]);

  return {
    blocks, loaded, courseId,
  };
}

export function useCurrentCourse() {
  const { loaded, courseId, blocks } = useContext(CourseStructureContext);

  return loaded ? blocks[courseId] : null;
}

export function useCurrentSequence() {
  const { loaded, blocks, sequenceId } = useContext(CourseStructureContext);

  return loaded && sequenceId ? blocks[sequenceId] : null;
}

export function useCurrentSection() {
  const { loaded, blocks } = useContext(CourseStructureContext);
  const sequence = useCurrentSequence();
  return loaded ? blocks[sequence.parentId] : null;
}

export function useCurrentUnit() {
  const { loaded, blocks, unitId } = useContext(CourseStructureContext);

  return loaded && unitId ? blocks[unitId] : null;
}


export function useUnitIds() {
  const { loaded, blocks, courseId } = useContext(CourseStructureContext);

  return useMemo(
    () => (loaded ? createUnitIdList(blocks, courseId) : []),
    [loaded, blocks, courseId],
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

export function useCurrentSequenceUnits() {
  const { loaded, blocks } = useContext(CourseStructureContext);
  const sequence = useCurrentSequence();

  return loaded ? sequence.children.map(id => blocks[id]) : [];
}

export function useSequenceIdList() {
  const { loaded, blocks, courseId } = useContext(CourseStructureContext);

  const sequenceIdList = useMemo(
    () => (loaded ? createSequenceIdList(blocks, courseId) : []),
    [blocks, courseId],
  );

  return sequenceIdList;
}
