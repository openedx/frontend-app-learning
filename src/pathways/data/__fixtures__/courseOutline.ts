import type { CourseSectionData } from '../types';

// The first section is in progress, the second one is complete and the rest are not started.
export const dataPipelinesOutline: CourseSectionData[] = [
  {
    id: 'block-v1:edX+DE102+2026+type@chapter+block@what-is-a-pipeline',
    displayName: 'What is a Data Pipeline?',
    complete: false,
    subsections: [
      {
        id: 'block-v1:edX+DE102+2026+type@sequential+block@core-concepts',
        displayName: 'Core Concepts',
        complete: true,
      },
      {
        id: 'block-v1:edX+DE102+2026+type@sequential+block@real-world-context',
        displayName: 'Real-World Context',
        complete: false,
      },
    ],
  },
  {
    id: 'block-v1:edX+DE102+2026+type@chapter+block@sources-and-ingestion',
    displayName: 'Data Sources and Ingestion Methods',
    complete: true,
    subsections: [
      {
        id: 'block-v1:edX+DE102+2026+type@sequential+block@data-sources',
        displayName: 'Data Sources',
        complete: true,
      },
      {
        id: 'block-v1:edX+DE102+2026+type@sequential+block@ingestion-methods',
        displayName: 'Ingestion Methods',
        complete: true,
      },
    ],
  },
  {
    id: 'block-v1:edX+DE102+2026+type@chapter+block@batch-vs-real-time',
    displayName: 'Batch vs Real-Time Processing',
    complete: false,
    subsections: [
      {
        id: 'block-v1:edX+DE102+2026+type@sequential+block@batch-processing',
        displayName: 'Batch Processing',
        complete: false,
      },
      {
        id: 'block-v1:edX+DE102+2026+type@sequential+block@stream-processing',
        displayName: 'Stream Processing',
        complete: false,
      },
    ],
  },
  {
    id: 'block-v1:edX+DE102+2026+type@chapter+block@transformation-basics',
    displayName: 'Data Transformation Basics',
    complete: false,
    subsections: [
      {
        id: 'block-v1:edX+DE102+2026+type@sequential+block@cleaning-data',
        displayName: 'Cleaning Data',
        complete: false,
      },
    ],
  },
  {
    id: 'block-v1:edX+DE102+2026+type@chapter+block@etl-and-elt',
    displayName: 'Introduction to ETL & ELT',
    complete: false,
    subsections: [
      {
        id: 'block-v1:edX+DE102+2026+type@sequential+block@etl-vs-elt',
        displayName: 'ETL vs ELT',
        complete: false,
      },
    ],
  },
  {
    id: 'block-v1:edX+DE102+2026+type@chapter+block@orchestration',
    displayName: 'Pipeline Orchestration Fundamentals',
    complete: false,
    subsections: [
      {
        id: 'block-v1:edX+DE102+2026+type@sequential+block@scheduling',
        displayName: 'Scheduling and Dependencies',
        complete: false,
      },
    ],
  },
];
