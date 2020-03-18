import PropTypes from 'prop-types';

export const courseShape = PropTypes.shape({
  id: PropTypes.string,
  title: PropTypes.string,
  sectionIds: PropTypes.arrayOf(PropTypes.string),
  number: PropTypes.string,
  org: PropTypes.string,
  enrollmentStart: PropTypes.string,
  enrollmentEnd: PropTypes.string,
  end: PropTypes.string,
  start: PropTypes.string,
  enrollmentMode: PropTypes.string,
  isEnrolled: PropTypes.bool,
  userHasAccess: PropTypes.bool,
  isStaff: PropTypes.bool,
  verifiedMode: PropTypes.shape({
    price: PropTypes.number,
    currency: PropTypes.string,
    currencySymbol: PropTypes.string,
    sku: PropTypes.string,
    upgradeUrl: PropTypes.string,
  }),
  tabs: PropTypes.arrayOf(PropTypes.shape({
    url: PropTypes.string,
    slug: PropTypes.string,
    priority: PropTypes.number,
    title: PropTypes.string,
    type: PropTypes.string,
  })),
});

export const sectionShape = PropTypes.shape({
  id: PropTypes.string,
  title: PropTypes.string,
  sequenceIds: PropTypes.arrayOf(PropTypes.string),
  courseId: PropTypes.string,
});

export const sequenceShape = PropTypes.shape({
  id: PropTypes.string,
  title: PropTypes.string,
  lmsWebUrl: PropTypes.string,
  unitIds: PropTypes.arrayOf(PropTypes.string),
  sectionId: PropTypes.string,
});

export const unitShape = PropTypes.shape({
  id: PropTypes.string,
  title: PropTypes.string,
  sequenceId: PropTypes.string,
});

export const statusShape = PropTypes.shape({
  course: PropTypes.oneOf(['loading', 'loaded', 'failed']).isRequired,
  section: PropTypes.oneOf(['loading', 'loaded', 'failed']).isRequired,
  sequence: PropTypes.oneOf(['loading', 'loaded', 'failed']).isRequired,
  unit: PropTypes.oneOf(['loading', 'loaded', 'failed']).isRequired,
});
