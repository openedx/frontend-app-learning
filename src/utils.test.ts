import { appendBrowserTimezoneToUrl } from './utils';

describe('appendBrowserTimezoneToUrl', () => {
  const url = 'http://localhost:18000/api/course_home/course_metadata/course-v1:edX+DemoX+Demo_Course';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const reportTimeZone = (timeZone: string) => {
    const options = Intl.DateTimeFormat().resolvedOptions();
    jest.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({ ...options, timeZone });
  };

  it('appends the browser time zone', () => {
    reportTimeZone('America/New_York');
    expect(appendBrowserTimezoneToUrl(url)).toBe(`${url}?browser_timezone=America%2FNew_York`);
  });

  it('leaves the URL as it is when the browser reports no time zone', () => {
    reportTimeZone('');
    expect(appendBrowserTimezoneToUrl(url)).toBe(url);
  });
});
