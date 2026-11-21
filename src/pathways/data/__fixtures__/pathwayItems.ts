import type { PathwayItemData } from '../types';

export const passedItem: PathwayItemData = {
  id: 'course-v1:edX+DE101+2026',
  displayName: 'Introduction to Data Engineering',
  endDate: '2026-09-30',
  hasCertificate: true,
  type: 'course',
  status: 'passed',
};

export const notPassedItem: PathwayItemData = {
  id: 'course-v1:edX+DE102+2026',
  displayName: 'Data Pipelines',
  endDate: '2026-10-31',
  hasCertificate: true,
  type: 'course',
  status: 'not-passed',
};

export const inProgressItem: PathwayItemData = {
  id: 'course-v1:edX+DE103+2026',
  displayName: 'Data Warehousing',
  endDate: '2026-12-15',
  hasCertificate: true,
  type: 'course',
  status: 'in-progress',
};

export const inProgressWithoutCertificateItem: PathwayItemData = {
  id: 'course-v1:edX+DE104+2026',
  displayName: 'Machine Learning Operations for Production Systems on Kubernetes',
  endDate: '2027-01-20',
  hasCertificate: false,
  type: 'course',
  status: 'in-progress',
};

export const notStartedItem: PathwayItemData = {
  id: 'course-v1:edX+DE105+2026',
  displayName: 'Stream Processing',
  endDate: '2027-02-28',
  hasCertificate: true,
  type: 'course',
  status: 'not-started',
};

export const notStartedWithoutCertificateItem: PathwayItemData = {
  id: 'course-v1:edX+DE106+2026',
  displayName: 'Data Governance',
  endDate: '2027-03-31',
  hasCertificate: false,
  type: 'course',
  status: 'not-started',
};

// One item per status, with and without certificate, in the order of the pathway.
export const dataEngineeringItems: PathwayItemData[] = [
  passedItem,
  notPassedItem,
  inProgressItem,
  inProgressWithoutCertificateItem,
  notStartedItem,
  notStartedWithoutCertificateItem,
];
