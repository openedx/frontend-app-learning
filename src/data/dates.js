// Sample WIP data while we develop the dates tab
export default function datesData() {
  return JSON.parse(`
  {
          "id": "course-v1:edX+DemoX+Demo_Course",
          "isStaff": true,
          "number": "DemoX",
          "org": "edX",
          "title": "Demonstration Course",
    "tabs": [
        {
            "url": "/courses/course-v1:edX+DemoX+Demo_Course/course/",
            "title": "Course",
            "slug": "courseware",
            "type": "courseware",
            "priority": 0
        },
        {
            "url": "/courses/course-v1:edX+DemoX+Demo_Course/discussion/forum/",
            "title": "Discussion",
            "slug": "discussion",
            "type": "discussion",
            "priority": 1
        },
        {
            "url": "/courses/course-v1:edX+DemoX+Demo_Course/course_wiki",
            "title": "Wiki",
            "slug": "wiki",
            "type": "wiki",
            "priority": 2
        },
        {
            "url": "/courses/course-v1:edX+DemoX+Demo_Course/progress",
            "title": "Progress",
            "slug": "progress",
            "type": "progress",
            "priority": 3
        },
        {
            "url": "/courses/course-v1:edX+DemoX+Demo_Course/dates",
            "title": "Dates",
            "slug": "dates",
            "type": "dates",
            "priority": 4
        },
        {
            "url": "/courses/course-v1:edX+DemoX+Demo_Course/instructor",
            "title": "Instructor",
            "slug": "instructor",
            "type": "instructor",
            "priority": 5
        }
    ],
"dates": [
    {
        "title": "Course Starts",
        "link": "/testing",
        "date": "2015-02-05T05:00:00Z"
    },
    {
        "contains_gated_content": true,
        "link": "/testing",
        "title": "Homework - Question Styles force publish",
        "date": "2020-01-14T13:00:00Z"
    },
    {
        "title": "New Subsection",
        "date": "2020-04-20T08:30:00Z"
    },
    {
        "title": "current_datetime",
        "date": "2020-05-05T17:47:55.957725Z"
    },
    {
        "title": "Verification Upgrade Deadline",
        "date": "2020-09-16T19:05:00Z"
    },
    {
        "title": "edX Exams",
        "date": "2022-01-02T00:00:00Z"
    },
    {
        "title": "Homework - Labs and Demos",
        "date": "2022-01-14T13:00:00Z"
    },
    {
        "title": "Homework - Essays",
        "date": "2022-04-30T12:00:00Z"
    },
    {
        "title": "Course End",
        "date": "2025-02-09T00:30:00Z"
    },
    {
        "title": "Verification Deadline",
        "date": "2025-02-09T00:30:00Z"
    }
]
}
`);
}
