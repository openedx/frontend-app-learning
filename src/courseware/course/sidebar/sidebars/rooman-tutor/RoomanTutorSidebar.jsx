/**
 * Rooman AI Tutor — sidebar chat panel.
 *
 * Fetches answers from the Rooman Lab Platform's POST /api/practice/tutor/chat.
 * The MFE runs at `apps.dev-lms.<host>` and the lab platform runs at
 * `dev-labs.<host>` — cross-origin. The lab platform's CORS middleware
 * allows `*` so the fetch works without credentials; we pass
 * `credentials: 'omit'` so browsers don't reject the `*`-origin + creds
 * combination.
 *
 * Conversation state is in-memory only (component-local useState). Refresh
 * = lost. That's deliberate for v0.1 — persisting per-learner history
 * needs a server-side log we haven't designed yet.
 *
 * Configuration:
 *   process.env.LAB_PLATFORM_BASE_URL controls the lab platform host. Set
 *   via Tutor's MFE_CONFIG_OVERRIDES in `~/.local/share/tutor/config.yml`:
 *
 *     MFE_CONFIG_OVERRIDES:
 *       learning:
 *         LAB_PLATFORM_BASE_URL: https://dev-labs.13-232-120-92.sslip.io
 *
 *   The default fallback below works for the dev box. Override for prod.
 */
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { useModel } from '@src/generic/model-store';
import PropTypes from 'prop-types';

import SidebarBase from '../../common/SidebarBase';
import SidebarContext from '../../SidebarContext';
import { ID } from './RoomanTutorTrigger';
import messages from './messages';

const LAB_PLATFORM_BASE_URL = (
  process.env.LAB_PLATFORM_BASE_URL
  || 'https://dev-labs.13-232-120-92.sslip.io'
);
const CHAT_URL = `${LAB_PLATFORM_BASE_URL.replace(/\/$/, '')}/api/practice/tutor/chat`;

/**
 * Trim the chat history we send to the server so we don't blow past the
 * LLM's token budget. The endpoint caps history at 10 turns; we send the
 * last 6 user-or-assistant turns (3 exchanges) which is the sweet spot
 * between "remembers the conversation" and "doesn't replay 50 messages".
 */
const HISTORY_WINDOW = 6;

const RoomanTutorSidebar = ({ intl }) => {
  const { courseId, unitId } = useContext(SidebarContext);
  // Course + unit titles flow into the prompt so the LLM has context.
  // useModel returns undefined when the data isn't loaded yet; we degrade
  // gracefully — the endpoint accepts missing titles.
  const courseHomeMeta = useModel('courseHomeMeta', courseId);
  const unit = useModel('units', unitId);
  const courseTitle = courseHomeMeta?.title || '';
  const unitTitle = unit?.title || '';

  const [history, setHistory] = useState([]);   // [{role, content}]
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on every new message.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, sending]);

  const send = useCallback(async () => {
    const question = draft.trim();
    if (!question || sending) return;
    setSending(true);
    setError(null);

    // Optimistic UI: render the learner's turn immediately while we wait.
    const optimisticHistory = [...history, { role: 'user', content: question }];
    setHistory(optimisticHistory);
    setDraft('');

    try {
      const res = await fetch(CHAT_URL, {
        method: 'POST',
        credentials: 'omit',   // see file-top comment re CORS + credentials
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          question,
          course_id: courseId || null,
          unit_id:   unitId || null,
          course_title: courseTitle,
          unit_title:   unitTitle,
          // Send the last few turns so the LLM remembers the thread.
          history: history.slice(-HISTORY_WINDOW),
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
      }
      const data = await res.json();
      setHistory([...optimisticHistory, { role: 'assistant', content: data.text || '' }]);
    } catch (e) {
      setError(e.message || 'Unknown error');
      // Roll back the optimistic user message so they can edit + retry
      // without losing what they typed.
      setHistory(history);
      setDraft(question);
    } finally {
      setSending(false);
    }
  }, [draft, sending, history, courseId, unitId, courseTitle, unitTitle]);

  // Enter = send, Shift+Enter = newline.
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <SidebarBase
      title={intl.formatMessage(messages.tutorTitle)}
      ariaLabel={intl.formatMessage(messages.tutorTitle)}
      sidebarId={ID}
      width="30rem"
      showTitleBar
    >
      <div className="rooman-tutor d-flex flex-column" style={{ height: '100%' }}>
        <div
          ref={scrollRef}
          className="flex-grow-1 overflow-auto p-3"
          style={{ minHeight: 0 }}
          data-testid="rooman-tutor-history"
        >
          {history.length === 0 && !sending ? (
            <div className="text-muted text-center mt-4 px-3">
              {intl.formatMessage(messages.placeholderEmpty)}
            </div>
          ) : (
            history.map((turn, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i} className={`mb-3 d-flex ${turn.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                <div
                  className={`px-3 py-2 rounded ${turn.role === 'user' ? 'bg-primary text-white' : 'bg-light text-dark'}`}
                  style={{
                    maxWidth: '85%',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: '14px',
                    lineHeight: 1.5,
                  }}
                >
                  {turn.content}
                </div>
              </div>
            ))
          )}
          {sending && (
            <div className="d-flex justify-content-start mb-3">
              <div
                className="px-3 py-2 rounded bg-light text-muted"
                style={{ fontSize: '14px', fontStyle: 'italic' }}
              >
                …
              </div>
            </div>
          )}
          {error && (
            <div className="alert alert-warning small mb-0 mt-2" role="alert">
              <strong>{intl.formatMessage(messages.errorPrefix)}</strong>
              <br />
              {error}
            </div>
          )}
        </div>

        <div className="border-top p-2 d-flex align-items-end" style={{ gap: '8px' }}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={intl.formatMessage(messages.inputPlaceholder)}
            disabled={sending}
            rows={2}
            className="form-control"
            style={{ resize: 'none', fontSize: '14px' }}
            data-testid="rooman-tutor-input"
          />
          <button
            type="button"
            onClick={send}
            disabled={sending || !draft.trim()}
            className="btn btn-primary"
            style={{ flex: '0 0 auto' }}
          >
            {sending
              ? intl.formatMessage(messages.sending)
              : intl.formatMessage(messages.send)}
          </button>
        </div>
      </div>
    </SidebarBase>
  );
};

RoomanTutorSidebar.propTypes = {
  intl: intlShape.isRequired,
};

RoomanTutorSidebar.ID = ID;

export default injectIntl(RoomanTutorSidebar);
