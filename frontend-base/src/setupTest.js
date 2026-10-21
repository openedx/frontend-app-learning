import siteConfig from 'site.config';
import { mergeSiteConfig } from '@openedx/frontend-base';
import '@testing-library/jest-dom';

mergeSiteConfig(siteConfig);
