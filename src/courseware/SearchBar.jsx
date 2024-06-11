import { Form } from '@openedx/paragon';
import { useEffect, useState } from 'react';
import { getConfig } from '@edx/frontend-platform';
import PropTypes from 'prop-types';

const myHeaders = new Headers();
myHeaders.append('Content-Type', 'application/json');

const SearchBar = ({ courseId }) => {
  const [state, setState] = useState({
    data: [], loading: false, userProvidedText: null,
  });
  const [userProvidedText, setUserProvidedText] = useState(null);

  const valueChange = (value) => {
    if (userProvidedText !== value.userProvidedText) {
      setUserProvidedText(value.userProvidedText);
    }
  };

  useEffect(() => {
    if (!userProvidedText) { return; }

    const requestOptions = {
      method: 'GET', headers: myHeaders, redirect: 'follow',
    };

    setState({ ...state, loading: true });

    fetch(`${getConfig().LMS_BASE_URL}/search/${courseId}/auto_suggest_search?term=${userProvidedText}`, requestOptions)
      .then(data => data.json())
      .then(data => data.results)
      .then(results => {
        setTimeout(() => {
          setState({
            ...state,
            data: results,
            loading: false,
          });
        }, 1500);
      });
  }, [userProvidedText]);

  return (
    <Form.Group>
      <Form.Label>
        <h4>Course Search</h4>
      </Form.Label>
      <Form.Autosuggest
        placeholder="Seach ..."
        screenReaderText="Loading..."
        loading={state.loading}
        onChange={valueChange}
      >
        {state.data.map((item) => (
          <Form.AutosuggestOption
            key={item.id}
          >{item.display_name}
          </Form.AutosuggestOption>
        ))}
      </Form.Autosuggest>
    </Form.Group>
  );
};

SearchBar.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default SearchBar;
