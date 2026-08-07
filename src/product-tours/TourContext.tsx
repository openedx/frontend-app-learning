import React, {
  createContext, useContext, useMemo, useReducer, ReactNode,
} from 'react';

export interface TourData {
  courseHomeTourStatus?: string;
  showCoursewareTour?: boolean;
}

interface TourState {
  showCoursewareTour: boolean;
  showExistingUserCourseHomeTour: boolean;
  showNewUserCourseHomeModal: boolean;
  showNewUserCourseHomeTour: boolean;
}

type TourAction =
  | { type: 'setTourData'; payload: TourData }
  | { type: 'disableCourseHomeTour' }
  | { type: 'disableCoursewareTour' }
  | { type: 'closeNewUserCourseHomeModal' }
  | { type: 'launchCourseHomeTour' };

const initialState: TourState = {
  showCoursewareTour: false,
  showExistingUserCourseHomeTour: false,
  showNewUserCourseHomeModal: false,
  showNewUserCourseHomeTour: false,
};

// Mirrors the reducers of the former `tours` Redux slice 1:1.
function reducer(state: TourState, action: TourAction): TourState {
  switch (action.type) {
    case 'setTourData': {
      const { courseHomeTourStatus, showCoursewareTour } = action.payload;
      return {
        ...state,
        showCoursewareTour: !!showCoursewareTour,
        showExistingUserCourseHomeTour: courseHomeTourStatus === 'show-existing-user-tour',
        showNewUserCourseHomeModal: courseHomeTourStatus === 'show-new-user-tour',
      };
    }
    case 'disableCourseHomeTour':
      return {
        ...state,
        showNewUserCourseHomeModal: false,
        showNewUserCourseHomeTour: false,
        showExistingUserCourseHomeTour: false,
      };
    case 'disableCoursewareTour':
      return { ...state, showCoursewareTour: false };
    case 'closeNewUserCourseHomeModal':
      return { ...state, showNewUserCourseHomeModal: false };
    case 'launchCourseHomeTour': {
      const next = { ...state, showExistingUserCourseHomeTour: false };
      if (!state.showNewUserCourseHomeModal || !state.showNewUserCourseHomeTour) {
        next.showNewUserCourseHomeTour = true;
      }
      return next;
    }
    default:
      return state;
  }
}

interface TourContextValue extends TourState {
  setTourData: (payload: TourData) => void;
  disableCourseHomeTour: () => void;
  disableCoursewareTour: () => void;
  closeNewUserCourseHomeModal: () => void;
  launchCourseHomeTour: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export const TourProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo<TourContextValue>(() => ({
    ...state,
    setTourData: (payload) => dispatch({ type: 'setTourData', payload }),
    disableCourseHomeTour: () => dispatch({ type: 'disableCourseHomeTour' }),
    disableCoursewareTour: () => dispatch({ type: 'disableCoursewareTour' }),
    closeNewUserCourseHomeModal: () => dispatch({ type: 'closeNewUserCourseHomeModal' }),
    launchCourseHomeTour: () => dispatch({ type: 'launchCourseHomeTour' }),
  }), [state]);

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};

export const useTourState = (): TourContextValue => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTourState must be used within a TourProvider');
  }
  return context;
};
