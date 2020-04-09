import { getConfig } from '@edx/frontend-platform';

export default function toggleNotes() {
  const iframe = document.getElementById('unit-iframe');
  iframe.contentWindow.postMessage('tools.toggleNotes', getConfig().LMS_BASE_URL);
}
