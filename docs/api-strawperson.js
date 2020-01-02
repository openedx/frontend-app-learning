// API Response Strawpersons

/**
 * "overview" is an API call made once to get course data that doesn't change depending on which 
 * sequence we're looking at.  The MFE makes it once to load the majority of 
 * navigation/user/permission data it needs.
 */
const overview = {
  course: {
    key: String, // This is 'course_key' - I'm assuming it's a string ID, effectively.
    name: String, // Given the "display" properties below, I'm assuming this is a non-display version of the course name.
    courseUrl: String,
    chapterUrl: String,
    outlineUrl: String,
    resumeUrl: String,
    isPublic: Boolean,
    displayOrgWithDefault: String, // What are these *WithDefault things?
    displayNumberWithDefault: String,
    displayNameWithDefault: String,
    activePage: String, // Is this necessary?  Isn't this based on the URL?
    defaultPage: String,
    pages: [
      {
        order: Number,
        type: String,
        url: String,
        title: String,
        needsAttention: Boolean,
      },
    ],
  },
  user: {
    userId: Number, // In JWT
    username: String, // In JWT
    roles: [
      String, // In JWT
    ],
    administrator: Boolean, // In JWT
    avatar: String,
    resumeLastCourseUrl: String,
  },
  masqueradeUser: {
    role: String,
    partitionId: Number,
    groupId: Number,
    username: String,
  },
  permissions: { // course-related permissions
    hasEnrollment: Boolean,
    needsPayment: Boolean,
    userCanMasquerade: Boolean,
    courseCanMasquerade: Boolean,
    includeSpecialExams: Boolean,
    administrator: Boolean, // is course administration different than our existing notion of 'staff' for user accounts?
  },
}

/**
 * This is sequence detail data.  If we're pulling the Sequence Nav out of the iframe and into the MFE, then this can be folded into the above 'overview' API.  I'm assuming here that exams and proctoring data are at the sequence level, not at the unit level.
 */
const details = {
  id: String,
  name: String,
  sectionUrl: String,
  units: [
    {
      title: String,
      type: String,
      id: Number,
      bookmarked: Boolean,
      path: Breadcrumb,
      graded: Boolean,
      complete: Boolean,
      url: String,
    },
  ],
  nextUrl: String,
  previousUrl: String,
  bannerText: String, // How is this localized?  Should we send a code to the frontend instead?
  excludeUnits: String, // We can maybe derive this from who the user is
  prerequisiteUrl: String, // Lack of prerequisiteUrl means this is not gated content.
  prerequisiteSectionName: String, // Should be null if prerequisiteUrl is null.
  exam: { // null if not an exam
    isEntranceExam: Boolean,
    entranceExamStatus: String,
    entranceExamPassed: Boolean,
    currentScore: Number,
    requiredScore: Number,
  },
  proctoring: { // null if not proctored
    isTimeLimited: Boolean,
    isTimedExam: Boolean,
    defaultTimeLimitMinutes: Number,
    isProctoredEnabled: Boolean,
    isProctoredExam: Boolean,
    examReviewRules: Object, // Not sure what this is
    isPracticeExam: Boolean,
    isOnboardingExam: Boolean,
    allowProctoringOptOut: Boolean,
  }
}

/*
 * Messages are returned on arbitrary requests as a top-level object key.
 */
const messages = {
  code: String,
  userMessage: String,
  messageType: String,
  dismissable: Boolean,
  ephemeral: Boolean,
}

// Like messages, this may ride on any request coming back from the server (or so I hear)
const entranceExamPassed = Boolean;
