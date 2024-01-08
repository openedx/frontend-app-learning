/* eslint-disable import/prefer-default-export */
import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

Factory.define('verifiedMode')
  .attr('currency', 'USD')
  .attr('currencySymbol', '$')
  .attr('price', '$149')
  .attr('sku', '8CF08E5')
  .attr('upgradeUrl', 'http://localhost:18130/basket/add/?sku=8CF08E5');

Factory.define('discussionTopic')
  .option('topicPrefix', null, '')
  .option('courseId', null, 'course-v1:edX+DemoX+Demo_Course')
  .sequence('id', ['topicPrefix'], (idx, topicPrefix) => `${topicPrefix}topic-${idx}`)
  .sequence('name', ['topicPrefix'], (idx, topicPrefix) => `${topicPrefix}topic ${idx}`)
  .sequence(
    'usage_key',
    ['id', 'courseId'],
    (idx, id, courseId) => `block-v1:${courseId.replace('course-v1:', '')}+type@vertical+block@${id}`,
  )
  .attr('enabled_in_context', ['enabled_in_context'], (enabledInContext) => Boolean(enabledInContext))

  .attr('thread_counts', [], {
    discussion: 0,
    question: 0,
  });

// Given a pre-build units state, build topics from it.
export function buildTopicsFromUnits(units, enabledInContext = true) {
  return Object.values(units).map(unit => Factory.build('discussionTopic', { usage_key: unit.id, enabled_in_context: enabledInContext }));
}
