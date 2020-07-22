import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

import './block.factory';

Factory.define('sequenceMetadata')
  .option('courseId', (courseId) => {
    if (courseId) {
      return courseId;
    }
    throw new Error('courseId must be specified for sequenceMetadata factory.');
  })
  // An array of units
  .option('unitBlocks', ['courseId'], courseId => ([
    Factory.build(
      'block',
      { type: 'vertical' },
      { courseId },
    ),
  ]))
  .option(
    'sequenceBlock', ['courseId', 'unitBlocks'], (courseId, unitBlocks) => (
      Factory.build(
        'block',
        { type: 'sequential', children: unitBlocks.map(unitBlock => unitBlock.id) },
        { courseId },
      )
    ),
  )
  .attr('element_id', ['sequenceBlock'], sequenceBlock => sequenceBlock.block_id)
  .attr('item_id', ['sequenceBlock'], sequenceBlock => sequenceBlock.id)
  .attr('display_name', ['sequenceBlock'], sequenceBlock => sequenceBlock.display_name)
  .attr('ajax_url', ['sequenceBlock'], sequenceBlock => `${sequenceBlock.student_view_url}/handler/xmodule_handler}`)
  .attr('gated_content', ['sequenceBlock'], sequenceBlock => ({
    gated: false,
    prereq_url: null,
    prereq_id: null,
    prereq_section_name: null,
    gated_section_name: sequenceBlock.display_name,
  }))
  .attr('items', ['unitBlocks', 'sequenceBlock'], (unitBlocks, sequenceBlock) => unitBlocks.map(
    unitBlock => ({
      href: '',
      graded: unitBlock.graded,
      id: unitBlock.id,
      bookmarked: false,
      path: `Chapter Display Name > ${sequenceBlock.display_name} > ${unitBlock.display_name}`,
      type: 'other',
      complete: null,
      content: '',
      page_title: unitBlock.display_name,
    }),
  ))
  .attrs({
    exclude_units: true,
    position: null,
    next_url: null,
    tag: 'sequential',
    save_position: true,
    prev_url: null,
    is_time_limited: false,
    show_completion: true,
    banner_text: null,
  });
