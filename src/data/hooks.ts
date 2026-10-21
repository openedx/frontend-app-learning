import { useParams } from 'react-router-dom';

// eslint-disable-next-line import/prefer-default-export
export const useContextId = () => useParams().courseId;
