import React, { useState } from 'react';

import PropTypes from 'prop-types';
import { Button, Form } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlug } from '@fortawesome/free-solid-svg-icons';
import PluginComponent from '../../../plugin-test/PluginComponent';
import { useModel, useModels } from '../../../generic/model-store';
import { loadDynamicScript, loadScriptComponent } from '../../../plugin-test/utils';

export default function InContextSidebar({
  courseId, sectionId, unitId, sequenceId,
}) {
  const course = useModel('coursewareMeta', courseId);
  const section = useModel('sections', sectionId);
  const unit = useModel('units', unitId);
  const sequence = useModel('sequences', sequenceId);

  const sections = useModels('sections', course ? course.sectionIds : []);
  let sequenceIds = [];
  if (sections) {
    sections.forEach((curSection) => {
      sequenceIds = sequenceIds.concat(curSection.sequenceIds);
    });
  }
  const sequences = useModels('sequences', sequenceIds);
  let unitIds = [];
  if (sequences) {
    sequences.forEach((curSequence) => {
      unitIds = unitIds.concat(curSequence.unitIds);
    });
  }
  const units = useModels('units', unitIds);

  const [pluginUrl, setPluginUrl] = useState('');
  const handlePluginUrlChange = (event) => {
    setPluginUrl(event.target.value);
  };

  const handlePluginAdd = (event) => {
    event.preventDefault();
    loadDynamicScript(pluginUrl).then(() => {
      const pluginFunction = loadScriptComponent('plugin', './Pomodoro');
      pluginFunction();
      setPluginUrl('');
    });
  };

  if (!course || !section || !unit || !sequence) {
    return null;
  }
  return (
    <div className="pt-3">
      <div className="mb-3">
        <Form onSubmit={handlePluginAdd}>
          <h4><FontAwesomeIcon icon={faPlug} /> Add a plugin?</h4>
          <Form.Control className="mb-1" onChange={handlePluginUrlChange} placeholder="URL to your plugin..." type="text" />
          <Button type="submit">Add</Button>
        </Form>
      </div>
      <hr />
      {getConfig().plugins.slots.coursewareSidebar.map((plugin) => (
        <React.Fragment key={`plugin-${plugin.url}-${plugin.module}`}>
          <PluginComponent
            course={course}
            activeUnit={unit}
            activeSequence={sequence}
            activeSection={section}
            unitIds={unitIds}
            units={units}
            sequences={sequences}
            sections={sections}
            plugin={plugin}
          />
          <hr />
        </React.Fragment>
      ))}
    </div>
  );
}

InContextSidebar.propTypes = {
  courseId: PropTypes.string,
  sectionId: PropTypes.string,
  unitId: PropTypes.string,
  sequenceId: PropTypes.string,
};

InContextSidebar.defaultProps = {
  courseId: null,
  sectionId: null,
  unitId: null,
  sequenceId: null,
};
