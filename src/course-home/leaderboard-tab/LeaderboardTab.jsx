import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Alert, Spinner } from '@openedx/paragon';
import { DataTable } from '@openedx/paragon';

import messages from './messages';
import './LeaderBoardTab.scss';

const LeaderboardTab = () => {
  const { formatMessage } = useIntl();
  const { courseId } = useParams();

  const data = useSelector(
    state => state.models?.leaderboard?.[courseId]
  );

  if (!data) {
    return (
      <div className="leaderboard-loading">
        <Spinner animation="border" variant="primary" />
        <p>{formatMessage(messages['leaderboard.loading'])}</p>
      </div>
    );
  }

  const top10 = data.leaderboard?.top10 ?? [];
  const currentUser = data.currentUser ?? {};
  const isInTop10 = currentUser.isInTop10;

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">
        {formatMessage(messages['leaderboard.title'])}
      </h2>

      {/* Explanation */}
      <Alert variant="light" className="leaderboard-info">
        {formatMessage(messages['leaderboard.description'])}
      </Alert>

      {/* Table */}
      {top10.length === 0 ? (
        <p className="leaderboard-empty">
          {formatMessage(messages['leaderboard.noData'])}
        </p>
      ) : (
        <div className="leaderboard-table-wrapper">
            <DataTable
                columns={[
                    {
                    Header: formatMessage(messages['leaderboard.rank']),
                    accessor: 'rank',
                    },
                    {
                    Header: formatMessage(messages['leaderboard.student']),
                    accessor: 'displayName',
                    Cell: ({ row }) => (
                        <>
                        {row.original.displayName}
                        {row.original.isCurrentUser &&
                            ` ${formatMessage(messages['leaderboard.you'])}`}
                        </>
                    ),
                    },
                    {
                    Header: formatMessage(messages['leaderboard.points']),
                    accessor: 'points',
                    },
                ]}
                data={top10}
                className="leaderboard-table"
                getRowProps={(row) => ({
                    className: row.original.isCurrentUser ? 'current-user-row' : '',
                })}
            />
        </div>
      )}

      {/* User Position */}
      <div className="leaderboard-position">
        <h3>
          {formatMessage(messages['leaderboard.yourPosition'])}
        </h3>

        <div className="position-card">
          <div>
            <strong>
              {formatMessage(messages['leaderboard.rank'])}:
            </strong>{' '}
            {currentUser.rank ?? 'N/A'}
          </div>
          <div>
            <strong>
              {formatMessage(messages['leaderboard.points'])}:
            </strong>{' '}
            {currentUser.points ?? 0}
          </div>
        </div>

        {/* Status Message */}
        {isInTop10 ? (
          <Alert variant="success" className="leaderboard-status">
            {formatMessage(messages['leaderboard.top10Message'])}
          </Alert>
        ) : (
          <Alert variant="warning" className="leaderboard-status">
            {formatMessage(messages['leaderboard.improveMessage'])}
          </Alert>
        )}
      </div>
    </div>
  );
};

export default LeaderboardTab;