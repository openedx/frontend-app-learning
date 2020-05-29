// Sample data helpful when developing, to see a variety of configurations.
// This set of data is not realistic (mix of having access and not), but it
// is intended to demonstrate many UI results.
// To use, have getTabData in api.js return the result of this call instead:
/*
import fakeDatesData from '../dates-tab/fakeData';
export async function getTabData(courseId, tab, version) {
  if (tab === 'dates') { return camelCaseObject(fakeDatesData()); }
  ...
}
*/

export default function fakeDatesData() {
  return JSON.parse(`
{
  "course_date_blocks": [
    {
      "date": "2020-05-01T17:59:41Z",
      "date_type": "course-start-date",
      "description": "",
      "learner_has_access": true,
      "link": "",
      "title": "Course Starts"
    },
    {
      "complete": true,
      "date": "2020-05-04T02:59:40.942669Z",
      "date_type": "assignment-due-date",
      "description": "",
      "learner_has_access": true,
      "title": "Multi Badges Completed"
    },
    {
      "date": "2020-05-05T02:59:40.942669Z",
      "date_type": "assignment-due-date",
      "description": "",
      "learner_has_access": true,
      "title": "Multi Badges Past Due"
    },
    {
      "date": "2020-05-27T02:59:40.942669Z",
      "date_type": "assignment-due-date",
      "description": "",
      "learner_has_access": true,
      "link": "https://example.com/",
      "title": "Both Past Due 1"
    },
    {
      "date": "2020-05-27T02:59:40.942669Z",
      "date_type": "assignment-due-date",
      "description": "",
      "learner_has_access": true,
      "link": "https://example.com/",
      "title": "Both Past Due 2"
    },
    {
      "complete": true,
      "date": "2020-05-28T08:59:40.942669Z",
      "date_type": "assignment-due-date",
      "description": "",
      "learner_has_access": true,
      "link": "https://example.com/",
      "title": "One Completed/Due 1"
    },
    {
      "date": "2020-05-28T08:59:40.942669Z",
      "date_type": "assignment-due-date",
      "description": "",
      "learner_has_access": true,
      "link": "https://example.com/",
      "title": "One Completed/Due 2"
    },
    {
      "complete": true,
      "date": "2020-05-29T08:59:40.942669Z",
      "date_type": "assignment-due-date",
      "description": "",
      "learner_has_access": true,
      "link": "https://example.com/",
      "title": "Both Completed 1"
    },
    {
      "complete": true,
      "date": "2020-05-29T08:59:40.942669Z",
      "date_type": "assignment-due-date",
      "description": "",
      "learner_has_access": true,
      "link": "https://example.com/",
      "title": "Both Completed 2"
    },
    {
      "date": "2020-06-16T17:59:40.942669Z",
      "date_type": "verified-upgrade-deadline",
      "description": "Don't miss the opportunity to highlight your new knowledge and skills by earning a verified certificate.",
      "learner_has_access": true,
      "link": "https://example.com/",
      "title": "Upgrade to Verified Certificate"
    },
    {
      "date": "2030-08-17T05:59:40.942669Z",
      "date_type": "assignment-due-date",
      "description": "",
      "learner_has_access": false,
      "link": "https://example.com/",
      "title": "One Verified 1"
    },
    {
      "date": "2030-08-17T05:59:40.942669Z",
      "date_type": "assignment-due-date",
      "description": "",
      "learner_has_access": true,
      "link": "https://example.com/",
      "title": "One Verified 2"
    },
    {
      "date": "2030-08-18T05:59:40.942669Z",
      "date_type": "assignment-due-date",
      "description": "",
      "learner_has_access": false,
      "link": "https://example.com/",
      "title": "Both Verified 1"
    },
    {
      "date": "2030-08-18T05:59:40.942669Z",
      "date_type": "assignment-due-date",
      "description": "",
      "learner_has_access": false,
      "link": "https://example.com/",
      "title": "Both Verified 2"
    },
    {
      "date": "2030-08-19T05:59:40.942669Z",
      "date_type": "assignment-due-date",
      "description": "",
      "learner_has_access": true,
      "title": "One Unreleased 1"
    },
    {
      "date": "2030-08-19T05:59:40.942669Z",
      "date_type": "assignment-due-date",
      "description": "",
      "learner_has_access": true,
      "link": "https://example.com/",
      "title": "One Unreleased 2"
    },
    {
      "date": "2030-08-20T05:59:40.942669Z",
      "date_type": "assignment-due-date",
      "description": "",
      "learner_has_access": true,
      "title": "Both Unreleased 1"
    },
    {
      "date": "2030-08-20T05:59:40.942669Z",
      "date_type": "assignment-due-date",
      "description": "",
      "learner_has_access": true,
      "title": "Both Unreleased 2"
    },
    {
      "date": "2030-08-23T00:00:00Z",
      "date_type": "course-end-date",
      "description": "",
      "learner_has_access": true,
      "link": "",
      "title": "Course Ends"
    },
    {
      "date": "2030-09-01T00:00:00Z",
      "date_type": "verification-deadline-date",
      "description": "You must successfully complete verification before this date to qualify for a Verified Certificate.",
      "learner_has_access": false,
      "link": "https://example.com/",
      "title": "Verification Deadline"
    }
  ],
  "display_reset_dates_text": false,
  "learner_is_verified": false,
  "user_timezone": "America/New_York",
  "verified_upgrade_link": "https://example.com/"
}
  `);
}
