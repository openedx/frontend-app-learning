import React from 'react';
import MockAdapter from 'axios-mock-adapter';
import { QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { Factory } from 'rosie';
import {
  render, screen, fireEvent, initializeTestStore, waitFor, authenticatedUser, logUnhandledRequests,
  createTestQueryClient, getTestStoreIds,
} from '../../../setupTest';
import { sequenceMetadataQuery } from '../../data/apiHooks';
import { coursewareQueryKeys } from '../../data/queryKeys';
import { BookmarkButton } from './index';
import { getBookmarksBaseUrl } from './data/api';

describe('Bookmark Button', () => {
  let axiosMock;
  let queryClient;
  let sequenceId;
  const courseMetadata = Factory.build('courseMetadata');
  const mockData = {
    isProcessing: false,
  };
  const nonBookmarkedUnitBlock = Factory.build(
    'block',
    { type: 'vertical' },
    { courseId: courseMetadata.id },
  );
  const bookmarkedUnitBlock = Factory.build(
    'block',
    { type: 'vertical', bookmarked: true },
    { courseId: courseMetadata.id },
  );
  const unitBlocks = [nonBookmarkedUnitBlock, bookmarkedUnitBlock];

  const cachedUnit = (unitId) => (
    queryClient.getQueryData(coursewareQueryKeys.sequence(sequenceId, false)).units.find((unit) => unit.id === unitId)
  );

  const renderButton = (props = {}) => render(
    <QueryClientProvider client={queryClient}>
      <BookmarkButton {...mockData} sequenceId={sequenceId} {...props} />
    </QueryClientProvider>,
    { wrapWithRouter: true },
  );

  beforeEach(async () => {
    const store = await initializeTestStore({ courseMetadata, unitBlocks });
    ({ sequenceId } = getTestStoreIds(store));
    mockData.unitId = nonBookmarkedUnitBlock.id;
    queryClient = createTestQueryClient();
    await queryClient.fetchQuery(sequenceMetadataQuery(sequenceId, false));

    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    const bookmarkUrl = getBookmarksBaseUrl();

    axiosMock.onPost(bookmarkUrl).reply(200, { });

    const bookmarkDeleteUrlRegExp = new RegExp(`${bookmarkUrl}*,*`);
    axiosMock.onDelete(bookmarkDeleteUrlRegExp).reply(200, { });
    logUnhandledRequests(axiosMock);
  });

  it('handles adding bookmark', async () => {
    renderButton();

    const button = screen.getByRole('button', { name: 'Bookmark this page' });
    expect(button).not.toHaveClass('disabled');

    fireEvent.click(button);
    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    expect(axiosMock.history.post[0].data).toEqual(JSON.stringify({ usage_id: nonBookmarkedUnitBlock.id }));
    expect(cachedUnit(nonBookmarkedUnitBlock.id).bookmarked).toBeTruthy();
  });

  it('does not handle adding bookmark when processing', async () => {
    renderButton({ isProcessing: true });

    const button = screen.getByRole('button', { name: 'Bookmark this page' });
    expect(button).toHaveClass('disabled');

    fireEvent.click(button);
    // HACK: We don't have a function we could reliably await here, so this test relies on the timeout of `waitFor`.
    await expect(waitFor(
      () => expect(axiosMock.history.post).toHaveLength(1),
      { timeout: 100 },
    )).rejects.toThrowError(/expect.*toHaveLength.*/);
    expect(cachedUnit(nonBookmarkedUnitBlock.id).bookmarked).toBeFalsy();
  });

  it('handles removing bookmark', async () => {
    renderButton({ unitId: bookmarkedUnitBlock.id, isBookmarked: true });
    const button = screen.getByRole('button', { name: 'Bookmarked' });

    fireEvent.click(button);
    await waitFor(() => expect(axiosMock.history.delete).toHaveLength(1));
    expect(axiosMock.history.delete[0].url).toContain(`${authenticatedUser.username},${bookmarkedUnitBlock.id}`);
    expect(cachedUnit(bookmarkedUnitBlock.id).bookmarked).toBeFalsy();
  });

  it('does not handle removing bookmark when processing', async () => {
    renderButton({ unitId: bookmarkedUnitBlock.id, isBookmarked: true, isProcessing: true });

    const button = screen.getByRole('button', { name: 'Bookmarked' });
    expect(button).toHaveClass('disabled');

    fireEvent.click(button);
    // HACK: We don't have a function we could reliably await here, so this test relies on the timeout of `waitFor`.
    await expect(waitFor(
      () => expect(axiosMock.history.delete).toHaveLength(1),
      { timeout: 100 },
    )).rejects.toThrowError(/expect.*toHaveLength.*/);
    expect(cachedUnit(bookmarkedUnitBlock.id).bookmarked).toBeTruthy();
  });
});
