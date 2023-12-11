import React, { useState } from 'react';
import {
  getLocale, injectIntl, intlShape, isRtl,
} from '@edx/frontend-platform/i18n';

import {
  Button,
  Image,
  Form,
  ModalPopup,
  ModalCloseButton,
  useToggle,
  Icon,
  Avatar,
} from '@edx/paragon';

import { Close } from '@edx/paragon/icons';
import AIInfoImage from '../../assets/images/AI-info.svg';
import { AIIcon, ArrowSquareUpIcon } from '../../Icons';
import messages from '../messages';

const aiData = [
  {
    id: 'id_1',
    request: 'How can I attempt the exams?',
    response: `To approach exams successfully,
    it's important to adopt effective study strategies and time management skills.
    Here are some general tips: Create a Study Plan:
    Outline the topics you need to cover.
    Allocate specific time slots for studying each subject.
    Break down your study sessions into manageable chunks.
    Understand the Exam Format:
    Know the structure of the exam (multiple choice, essays, etc.).
    Understand the point distribution for each section.`,
  },
  {
    id: 'id_2',
    request: 'request 2',
    response: 'response 2',
  },
  {
    id: 'id_3',
    request: 'request 3',
    response: '',
  },
];

const AIWidget = ({ intl }) => {
  const [isOpen, open, close] = useToggle(false);
  const [target, setTarget] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState('');

  const inputLength = 200;
  const totalPrompts = 3;

  const isLocaleRtl = isRtl(getLocale());

  const hanldeSubmit = (event) => {
    event.preventDefault();
  };

  const handleInputChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <div className="ai-container" hidden>
      <Button
        ref={setTarget}
        className={`btn-ai ${isOpen ? 'btn-active' : ''}`}
        onClick={open}
      >
        <AIIcon />
      </Button>
      <ModalPopup
        positionRef={target}
        isBlocking
        isOpen={isOpen}
        onClose={close}
        placement={`top-${isLocaleRtl ? 'start' : 'end'}`}
      >
        <div className="ai-widget">
          <div className="ai-header">
            <AIIcon />
            <h4>{intl.formatMessage(messages.aiwidgetHeader)}</h4>
            <ModalCloseButton
              variant="black"
              className="ml-2"
            ><Icon src={Close} />
            </ModalCloseButton>
          </div>
          <div className="ai-body">
            {
              aiData.length > 0 ? (
                <div className="chat-wrapper">
                  {
                    aiData.map(({ id, request, response }) => (
                      <div className="box" key={id}>
                        <div className="chat-row qestion">
                          <div className="icon">
                            <Avatar height="2rem" width="2rem" />
                          </div>
                          <div className="text">
                            <p>{request}</p>
                          </div>
                        </div>
                        {
                          response.length > 0 && (
                            <div className="chat-row response">
                              <div className="icon"><AIIcon height="2rem" width="2rem" /></div>
                              <div className="text">
                                <p>{response}</p>
                              </div>
                            </div>
                          )
                        }
                      </div>
                    ))
                  }
                </div>
              ) : (
                <div className="no-data">
                  <Image
                    src={AIInfoImage}
                    alt="Image description"
                  />
                  <h4>{intl.formatMessage(messages.aiwidgetLabel)}</h4>
                </div>
              )
            }
          </div>
          <div className="ai-footer">
            <div className="form-info text-right">
              <span className="text-prompts">{intl.formatMessage(messages.aiwidgetPrompts, { prompts: totalPrompts - aiData.length })}</span>
            </div>
            <div className="form-wrapper">
              <Form onSubmit={hanldeSubmit} className={`ai-form ${isFocused ? 'is-focused' : ''}`}>
                <Form.Control
                  onFocus={() => { setIsFocused(true); }}
                  onBlur={() => { setIsFocused(false); }}
                  value={value}
                  autoFocus
                  maxLength={inputLength}
                  onChange={handleInputChange}
                  placeholder={`${intl.formatMessage(messages.aiwidgetLabel)}...`}
                />
                <span className="word-count">{inputLength - value.length}</span>
                <button
                  className="ai-submit-button"
                  type="submit"
                >
                  <ArrowSquareUpIcon />
                </button>
              </Form>
            </div>
          </div>
        </div>
      </ModalPopup>
    </div>
  );
};

AIWidget.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(AIWidget);
