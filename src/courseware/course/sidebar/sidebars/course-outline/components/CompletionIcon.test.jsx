import { render, screen } from '@testing-library/react';

import CompletionIcon from './CompletionIcon';

describe('CompletionIcon', () => {
  it('renders check circle icon when completion is equal to total and completion tracking is enabled', () => {
    const completionStat = { completed: 5, total: 5 };
    render(<CompletionIcon completionStat={completionStat} enabled />);
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
  });

  it('renders dashed circle icon when completion is between 0 and total and completion tracking is enabled', () => {
    const completionStat = { completed: 2, total: 5 };
    render(<CompletionIcon completionStat={completionStat} enabled />);
    expect(screen.getByTestId('dashed-circle-icon')).toBeInTheDocument();
  });

  it('renders completion solid icon when completion is between 0 and total and completion tracking is not enabled', () => {
    const completionStat = { completed: 2, total: 5 };
    render(<CompletionIcon completionStat={completionStat} enabled={false} />);
    expect(screen.getByTestId('completion-solid-icon')).toBeInTheDocument();
  });

  it('renders completion solid icon when completion is 0 and enabled', () => {
    const completionStat = { completed: 0, total: 5 };
    render(<CompletionIcon completionStat={completionStat} enabled />);
    expect(screen.getByTestId('completion-solid-icon')).toBeInTheDocument();
  });

  it('renders completion solid icon when completion is at any value and not enabled', () => {
    const completionStat = { completed: 0, total: 5 };
    render(<CompletionIcon completionStat={completionStat} enabled={false} />);
    expect(screen.getByTestId('completion-solid-icon')).toBeInTheDocument();
  });
});
