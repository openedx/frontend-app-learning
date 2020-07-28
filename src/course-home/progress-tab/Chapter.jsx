import React from 'react';
import PropTypes from 'prop-types';
import Subsection from './Subsection';

export default function Chapter({
  chapter,
}) {
  if (chapter.displayName === 'hidden') { return null; }
  const { subsections } = chapter;
  return (
    <section className="border-top border-light-500">
      <div className="row">
        <div className="lead font-weight-normal col-12 col-sm-3 my-3 border-right border-light-500">
          {chapter.displayName}
        </div>
        <div className="col-12 col-sm-9">
          {subsections.map((subsection) => (
            <Subsection
              key={subsection.url}
              subsection={subsection}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

Chapter.propTypes = {
  chapter: PropTypes.shape({
    displayName: PropTypes.string,
    subsections: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string,
    })),
  }).isRequired,
};
