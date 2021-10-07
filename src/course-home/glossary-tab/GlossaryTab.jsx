import React, { createContext } from 'react';
import { useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import './GlossaryTab.scss';

import messages from './messages';

import { useModel } from '../../generic/model-store';

import {
  SearchField,
  DropdownButton,
  Dropdown
} from '@edx/paragon';

export const CourseContext = createContext();

function KeyTermList() {
  const { courseId, termData, setTermData } = useContext(CourseContext);

  const restUrl = `http://localhost:18500/api/v1/course_terms?course_id=${courseId}`;

  fetch(restUrl)
    .then((response) => response.json())
    .then((jsonData) => {
      setTermData(jsonData);
    })
    .catch((error) => {
      // handle your errors here
      console.error(error);
    });

  const displayTerms = termData;

  return (
    <div className='key-term_list'>
      {displayTerms.length === 0 ? (
        <h3 className='filter-container'>No Terms to Display...</h3>
      ) : null}
    </div>
  );
}

function GlossaryTab({ intl }) {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    
  } = useModel('glossary', courseId);

  const [termData, setTermData] = useState([]);

  return (
    <>
      {/* Header */}
      <div role="heading" aria-level="1" className="h2 my-3">
        {intl.formatMessage(messages.glossaryHeader)}
      </div>

      {/* Search Functions */}
      <div class="row">
        <SearchField
                    onSubmit={(value) => {
                      console.log(`search submitted: ${value}`);
                      console.log(value);
                    }}
                    onClear={() => console.log()}
                    placeholder='Search'
        />

        <DropdownButton id="dropdown-basic-button" title="Filter Modules">
          <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
          <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
          <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
        </DropdownButton>
      </div>
      
      {/* List of Key Terms */}
      <CourseContext.Provider value={{ courseId, termData, setTermData }}>
        <KeyTermList /> 
      </CourseContext.Provider>
      
    </>
  );
}

GlossaryTab.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(GlossaryTab);
