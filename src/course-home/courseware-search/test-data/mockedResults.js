// Test data for testing the CoursewareSearchResults UI component.

const mockedResults = [{
  type: 'document',
  title: 'A Comprehensive Introduction to Supply Chain Analytics',
  href: 'https://www.edx.org/',
  isExternal: true,
}, {
  type: 'document',
  title: 'Basics of Data Collection for Supply Chain Analytics: Exploring Methods and Techniques for Optimal Data Gathering',
  breadcrumbs: ['A Comprehensive Introduction to Supply Chain Analytics'],
  href: 'https://www.edx.org/',
  isExternal: true,
}, {
  type: 'document',
  title: 'Zero-Waste Strategies in Supply Chain Management',
  breadcrumbs: [
    'A Comprehensive Introduction to Supply Chain Analytics',
    'Basics of Data Collection for Supply Chain Analytics: Exploring Methods and Techniques for Optimal Data Gathering',
  ],
  href: '/',
}, {
  type: 'text',
  title: 'Addressing Overproduction and Excess Inventory in Supply Chains',
  breadcrumbs: [
    'A Comprehensive Introduction to Supply Chain Analytics',
    'Basics of Data Collection for Supply Chain Analytics: Exploring Methods and Techniques for Optimal Data Gathering',
    'Zero-Waste Strategies in Supply Chain Management',
  ],
  href: '/',
}, {
  type: 'text',
  title: 'Balancing Supply and Demand',
  breadcrumbs: [
    'Strategic Sourcing and Its Impact on Supply-Demand Balance',
    'Dealing with Over-supply and Under-supply Situations',
    'Scenario Planning for Uncertain Supply-Demand Conditions',
  ],
  contentMatches: 9,
  href: '/',
}, {
  type: 'text',
  title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ornare porttitor purus, eget vehicula lorem ullamcorper in. In pellentesque vehicula diam, eget efficitur nisl aliquet id. Donec tincidunt dictum odio quis placerat.',
  breadcrumbs: ['Section name', 'Subsection name', 'Unit name'],
  contentMatches: 6,
  href: '/',
}, {
  type: 'video',
  title: 'TextSupply chain toolbox',
  breadcrumbs: ['Section name', 'Subsection name', 'Unit name'],
  href: '/',
}, {
  type: 'video',
  title: 'Utilizing Demand-Driven Strategies',
  breadcrumbs: ['Section name', 'Subsection name', 'Unit name'],
  contentMatches: 20,
  href: '/',
}, {
  type: 'video',
  title: 'Video',
  breadcrumbs: ['Section name', 'Subsection name', 'Unit name'],
  contentMatches: 1,
  href: '/',
}];

export default mockedResults;
