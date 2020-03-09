/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import PropTypes from 'prop-types';

const courseMetaSlice = createSlice({
  name: 'course-meta',
  initialState: {
    fetchState: null,
  },
  reducers: {
    fetchCourseMetadataRequest: (draftState) => {
      draftState.fetchState = 'loading';
    },
    fetchCourseMetadataSuccess: (draftState, { payload }) => ({
      fetchState: 'loaded',

      /*
       * NOTE: If you change the data saved here,
       * update the courseMetadataShape below!
       */

      // Course identifiers
      name: payload.name,
      number: payload.number,
      org: payload.org,

      // Enrollment dates
      enrollmentStart: payload.enrollmentStart,
      enrollmentEnd: payload.enrollmentEnd,

      // Course dates
      end: payload.end,
      start: payload.start,

      // User access/enrollment status
      enrollmentMode: payload.enrollment.mode,
      isEnrolled: payload.enrollment.isActive,
      userHasAccess: payload.userHasAccess,
      isStaff: payload.userHasStaffAccess,
      verifiedMode: payload.verifiedMode,

      // Misc
      tabs: payload.tabs,
    }),
    fetchCourseMetadataFailure: (draftState) => {
      draftState.fetchState = 'failed';
    },
  },
});

export const {
  fetchCourseMetadataRequest,
  fetchCourseMetadataSuccess,
  fetchCourseMetadataFailure,
} = courseMetaSlice.actions;

export const { reducer } = courseMetaSlice;

export const courseMetadataShape = PropTypes.shape({
  fetchState: PropTypes.string,
  // Course identifiers
  name: PropTypes.string,
  number: PropTypes.string,
  org: PropTypes.string,

  // Enrollment dates
  enrollmentStart: PropTypes.string,
  enrollmentEnd: PropTypes.string,

  // User access/enrollment status
  enrollmentMode: PropTypes.string,
  isEnrolled: PropTypes.bool,
  userHasAccess: PropTypes.bool,
  isStaff: PropTypes.bool,
  verifiedMode: PropTypes.shape({
    price: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
    currencySymbol: PropTypes.string.isRequired,
    sku: PropTypes.string.isRequired,
    upgradeUrl: PropTypes.string.isRequired,
  }),

  // Course dates
  start: PropTypes.string,
  end: PropTypes.string,

  // Misc
  tabs: PropTypes.arrayOf(PropTypes.shape({
    priority: PropTypes.number,
    slug: PropTypes.string,
    title: PropTypes.string,
    type: PropTypes.string,
    url: PropTypes.string,
  })),
});
