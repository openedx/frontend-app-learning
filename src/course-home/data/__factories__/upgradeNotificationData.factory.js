import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

Factory.define('upgradeNotificationData')
  .option('host', 'http://localhost:18000')
  .option('dateBlocks', [])
  .option('offer', null)
  .option('userTimezone', null)
  .option('accessExpiration', null)
  .option('contentTypeGatingEnabled', false)
  .attr('courseId', 'course-v1:edX+DemoX+Demo_Course')
  .attr('upsellPageName', 'test')
  .attr('verifiedMode', ['host'], (host) => ({
    access_expiration_date: '2050-01-01T12:00:00',
    currency: 'USD',
    currencySymbol: '$',
    price: 149,
    sku: 'ABCD1234',
    upgradeUrl: `${host}/dashboard`,
  }))
  .attr('org', 'edX')
  .attr('timeOffsetMillis', 0);
