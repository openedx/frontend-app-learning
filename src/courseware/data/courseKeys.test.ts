import { isBlockInCourse, isRouteInCourse } from './courseKeys';

describe('isBlockInCourse', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';

  it.each([
    ['a block of the course', 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@abc'],
    ['a block of a published branch of the course', 'block-v1:edX+DemoX+Demo_Course+branch@published-branch+type@vertical+block@abc'],
    ['a block of a version of the course', 'block-v1:edX+DemoX+Demo_Course+version@5e3c+type@vertical+block@abc'],
    ['a block whose key differs only in case', 'block-v1:EDX+DEMOX+DEMO_COURSE+type@vertical+block@abc'],
    ['a unit marker', 'first'],
    ['a missing id', undefined],
    ['a key of an unknown format', 'i4x://edX/DemoX/sequential/abc'],
  ])('accepts %s', (_, usageKey) => {
    expect(isBlockInCourse(usageKey, courseId)).toBe(true);
  });

  it.each([
    ['another run', 'block-v1:edX+DemoX+2026+type@sequential+block@abc'],
    ['another course number', 'block-v1:edX+OtherX+Demo_Course+type@sequential+block@abc'],
    ['another organisation', 'block-v1:Other+DemoX+Demo_Course+type@vertical+block@abc'],
  ])('rejects a block of %s', (_, usageKey) => {
    expect(isBlockInCourse(usageKey, courseId)).toBe(false);
  });

  it('accepts blocks of a CCX and of its master course in the CCX', () => {
    const ccxId = 'ccx-v1:edX+DemoX+Demo_Course+ccx@3';
    expect(isBlockInCourse('ccx-block-v1:edX+DemoX+Demo_Course+ccx@3+type@vertical+block@abc', ccxId)).toBe(true);
    expect(isBlockInCourse('block-v1:edX+DemoX+Demo_Course+type@vertical+block@abc', ccxId)).toBe(true);
    expect(isBlockInCourse('ccx-block-v1:edX+OtherX+Run+ccx@3+type@vertical+block@abc', ccxId)).toBe(false);
  });

  it('rejects blocks of another CCX of the same master course', () => {
    const ccxBlock = 'ccx-block-v1:edX+DemoX+Demo_Course+ccx@4+type@vertical+block@abc';
    expect(isBlockInCourse(ccxBlock, 'ccx-v1:edX+DemoX+Demo_Course+ccx@3')).toBe(false);
    expect(isBlockInCourse(ccxBlock, courseId)).toBe(false);
  });

  it('accepts any block when the course id is not a course key', () => {
    expect(isBlockInCourse('block-v1:edX+DemoX+Demo_Course+type@vertical+block@abc', undefined)).toBe(true);
  });
});

describe('isRouteInCourse', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const sequenceId = 'block-v1:edX+DemoX+Demo_Course+type@sequential+block@s1';
  const unitId = 'block-v1:edX+DemoX+Demo_Course+type@vertical+block@u1';
  const otherSequenceId = 'block-v1:Other+DemoX+Demo_Course+type@sequential+block@s1';
  const otherUnitId = 'block-v1:Other+DemoX+Demo_Course+type@vertical+block@u1';

  it.each([
    ['the course root', undefined, undefined],
    ['a sequence of the course', sequenceId, undefined],
    ['a sequence and unit of the course', sequenceId, unitId],
    ['a unit marker', sequenceId, 'first'],
  ])('accepts %s', (_, routeSequenceId, routeUnitId) => {
    expect(isRouteInCourse(courseId, routeSequenceId, routeUnitId)).toBe(true);
  });

  it.each([
    ['a sequence of another course', otherSequenceId, undefined],
    ['a unit of another course', sequenceId, otherUnitId],
    ['a sequence and unit of another course', otherSequenceId, otherUnitId],
  ])('rejects %s', (_, routeSequenceId, routeUnitId) => {
    expect(isRouteInCourse(courseId, routeSequenceId, routeUnitId)).toBe(false);
  });
});
