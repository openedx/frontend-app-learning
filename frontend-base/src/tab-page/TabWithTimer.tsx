import TabPage, { type TabPageProps } from './TabPage';

// https://github.com/openedx/frontend-app-learning/issues/2198
const TabWithTimer = (props: TabPageProps) => <TabPage {...props} />;

export default TabWithTimer;
