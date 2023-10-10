import React from 'react';

import { useNavigate, useParams } from 'react-router-dom';

const withParamsAndNavigation = WrappedComponent => {
  const WithParamsNavigationComponent = props => {
    const { courseId, sequenceId, unitId } = useParams();
    const navigate = useNavigate();
    return (
      <WrappedComponent
        routeCourseId={courseId}
        routeSequenceId={sequenceId}
        routeUnitId={unitId}
        navigate={navigate}
        {...props}
      />
    );
  };
  return WithParamsNavigationComponent;
};

export default withParamsAndNavigation;
