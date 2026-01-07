import { reducer, setExamsData } from './slice';

describe('course home data slice', () => {
  describe('setExamsData reducer', () => {
    it('should set examsData in state', () => {
      const initialState = {
        courseStatus: 'loading',
        courseId: null,
        metadataModel: 'courseHomeCourseMetadata',
        proctoringPanelStatus: 'loading',
        tabFetchStates: {},
        toastBodyText: '',
        toastBodyLink: null,
        toastHeader: '',
        showSearch: false,
        examsData: null,
      };

      const mockExamsData = [
        {
          id: 1,
          courseId: 'course-v1:edX+DemoX+Demo_Course',
          examName: 'Midterm Exam',
          attemptStatus: 'created',
        },
        {
          id: 2,
          courseId: 'course-v1:edX+DemoX+Demo_Course',
          examName: 'Final Exam',
          attemptStatus: 'submitted',
        },
      ];

      const action = setExamsData(mockExamsData);
      const newState = reducer(initialState, action);

      expect(newState.examsData).toEqual(mockExamsData);
      expect(newState).toEqual({
        ...initialState,
        examsData: mockExamsData,
      });
    });

    it('should update examsData when state already has data', () => {
      const initialState = {
        courseStatus: 'loaded',
        courseId: 'test-course',
        metadataModel: 'courseHomeCourseMetadata',
        proctoringPanelStatus: 'loading',
        tabFetchStates: {},
        toastBodyText: '',
        toastBodyLink: null,
        toastHeader: '',
        showSearch: false,
        examsData: [{ id: 1, examName: 'Old Exam' }],
      };

      const newExamsData = [
        {
          id: 2,
          courseId: 'course-v1:edX+DemoX+Demo_Course',
          examName: 'New Exam',
          attemptStatus: 'ready_to_start',
        },
      ];

      const action = setExamsData(newExamsData);
      const newState = reducer(initialState, action);

      expect(newState.examsData).toEqual(newExamsData);
      expect(newState.examsData).not.toEqual(initialState.examsData);
    });

    it('should set examsData to empty array', () => {
      const initialState = {
        courseStatus: 'loaded',
        courseId: 'test-course',
        metadataModel: 'courseHomeCourseMetadata',
        proctoringPanelStatus: 'loading',
        tabFetchStates: {},
        toastBodyText: '',
        toastBodyLink: null,
        toastHeader: '',
        showSearch: false,
        examsData: [{ id: 1, examName: 'Some Exam' }],
      };

      const action = setExamsData([]);
      const newState = reducer(initialState, action);

      expect(newState.examsData).toEqual([]);
    });

    it('should set examsData to null', () => {
      const initialState = {
        courseStatus: 'loaded',
        courseId: 'test-course',
        metadataModel: 'courseHomeCourseMetadata',
        proctoringPanelStatus: 'loading',
        tabFetchStates: {},
        toastBodyText: '',
        toastBodyLink: null,
        toastHeader: '',
        showSearch: false,
        examsData: [{ id: 1, examName: 'Some Exam' }],
      };

      const action = setExamsData(null);
      const newState = reducer(initialState, action);

      expect(newState.examsData).toBeNull();
    });

    it('should not affect other state properties when setting examsData', () => {
      const initialState = {
        courseStatus: 'loaded',
        courseId: 'test-course-id',
        metadataModel: 'courseHomeCourseMetadata',
        proctoringPanelStatus: 'complete',
        tabFetchStates: { progress: 'loaded' },
        toastBodyText: 'Toast message',
        toastBodyLink: 'http://example.com',
        toastHeader: 'Toast Header',
        showSearch: true,
        examsData: null,
      };

      const mockExamsData = [{ id: 1, examName: 'Test Exam' }];
      const action = setExamsData(mockExamsData);
      const newState = reducer(initialState, action);

      // Verify that only examsData changed
      expect(newState).toEqual({
        ...initialState,
        examsData: mockExamsData,
      });

      // Verify other properties remain unchanged
      expect(newState.courseStatus).toBe(initialState.courseStatus);
      expect(newState.courseId).toBe(initialState.courseId);
      expect(newState.showSearch).toBe(initialState.showSearch);
      expect(newState.toastBodyText).toBe(initialState.toastBodyText);
    });
  });
});
