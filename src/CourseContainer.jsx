import React from 'react';
import {
  Route, Switch, useParams, useRouteMatch,
} from 'react-router-dom';
import SequenceContainer from './SequenceContainer';

export default (props) => {
  const { path } = useRouteMatch();
  const { courseId } = useParams();

  return (
    <>
      <div>CourseContainer</div>
      <Switch>
        <Route exact path={path}>
          <h3>{path} find the sequence and redirect</h3>
        </Route>

        <Route exact path={`${path}/home`}>
          <h3>Course Home</h3>
        </Route>
        {/* CoursewareContainer ???? */}
        <Route
          path={`${path}/sequence/:sequenceId`}
          component={SequenceContainer}
        />
      </Switch>
    </>
  );
};
