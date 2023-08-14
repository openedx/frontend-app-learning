import React, { useEffect, useState } from 'react';
import { getConfig } from '@edx/frontend-platform';
import PropTypes from 'prop-types';
import { getLocale } from '@edx/frontend-platform/i18n';
import { getNotices } from './api';
/**
 * This component uses the platform-plugin-notices plugin to function.
 * If the user has an unacknowledged notice, they will be rerouted off
 * course home and onto a full-screen notice page. If the plugin is not
 * installed, or there are no notices, we just passthrough this component.
 */
const NoticesProvider = ({ children }) => {
  const [isRedirected, setIsRedirected] = useState();
  useEffect(async () => {
    if (getConfig().ENABLE_NOTICES) {
      const data = await getNotices();
      if (data && data.results && data.results.length > 0) {
        const { results } = data;
        setIsRedirected(true);
        window.location.replace(`${results[0]}?next=${window.location.href}`);
      }
    }
  }, []);
  const setFont = () => {
    const body = document.querySelector('body');
    const locale = getLocale();
    let className = '';

    if (locale === 'fa' || locale === 'fa-ir') {
      className = 'lang_fa';
    } else if (locale === 'ar') {
      className = 'lang_ar';
    }

    body.className = className;
  };

  useEffect(() => {
    setFont();
  }, [getLocale()]);

  return (
    <div>
      {isRedirected === true ? null : children}
    </div>
  );
};

NoticesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default NoticesProvider;
