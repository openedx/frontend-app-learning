import React from 'react';
import {
  Route, Switch, useParams, useRouteMatch,
} from 'react-router-dom';

export default (props) => {
  const { path } = useRouteMatch();
  const { courseId, sequenceId } = useParams();
  // const { courseId } = props;

  return (
    <>
      <div>SequenceContainer</div>

      {courseId} <br />
      {sequenceId}
      <Switch>
        <Route exact path={path}>
          <h3>{path} find the unit and redirect</h3>
        </Route>
        <Route exact path={`${path}/home`}>
          <h3>Course Home</h3>
        </Route>
        <Route
          path={`${path}/sequence/:sequenceId`}
          render={(routeProps) => (
            <SequenceContainer {...routeProps} courseId={courseId} />
          )}
        />
      </Switch>
      {props.children}
    </>
  );
};
