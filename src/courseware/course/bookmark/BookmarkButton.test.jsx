import React from 'react';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';
import { Factory } from 'rosie';
import {
  render, screen, fireEvent, initializeTestStore, waitFor, authenticatedUser, logUnhandledRequests,
} from '../../../setupTest';
import { BookmarkButton } from './index';

describe('Bookmark Button', () => {
  let axiosMock;
  let store;
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

  beforeEach(async () => {
    store = await initializeTestStore({ courseMetadata, unitBlocks });
    mockData.unitId = nonBookmarkedUnitBlock.id;

    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    const bookmarkUrl = `${getConfig().LMS_BASE_URL}/api/bookmarks/v1/bookmarks/`;
    axiosMock.onPost(bookmarkUrl).reply(200, { });

    const bookmarkDeleteUrlRegExp = new RegExp(`${bookmarkUrl}*,*`);
    axiosMock.onDelete(bookmarkDeleteUrlRegExp).reply(200, { });
    logUnhandledRequests(axiosMock);
  });

  it('handles adding bookmark', async () => {
    render(<BookmarkButton {...mockData} />);

    const button = screen.getByRole('button', { name: 'Bookmark this page' });
    expect(button).not.toHaveClass('disabled');

    fireEvent.click(button);
    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    expect(axiosMock.history.post[0].data).toEqual(JSON.stringify({ usage_id: nonBookmarkedUnitBlock.id }));
    expect(store.getState().models.units[nonBookmarkedUnitBlock.id].bookmarked).toBeTruthy();
  });

  it('does not handle adding bookmark when processing', async () => {
    render(<BookmarkButton {...mockData} isProcessing />);

    const button = screen.getByRole('button', { name: 'Bookmark this page' });
    expect(button).toHaveClass('disabled');

    fireEvent.click(button);
    // HACK: We don't have a function we could reliably await here, so this test relies on the timeout of `waitFor`.
    await expect(waitFor(
      () => expect(axiosMock.history.post).toHaveLength(1),
      { timeout: 100 },
    )).rejects.toThrowError(/expect.*toHaveLength.*/);
    expect(store.getState().models.units[nonBookmarkedUnitBlock.id].bookmarked).toBeFalsy();
  });

  it('handles removing bookmark', async () => {
    render(<BookmarkButton {...mockData} unitId={bookmarkedUnitBlock.id} isBookmarked />);
    const button = screen.getByRole('button', { name: 'Bookmarked' });

    fireEvent.click(button);
    await waitFor(() => expect(axiosMock.history.delete).toHaveLength(1));
    expect(axiosMock.history.delete[0].url).toContain(`${authenticatedUser.username},${bookmarkedUnitBlock.id}`);
    expect(store.getState().models.units[bookmarkedUnitBlock.id].bookmarked).toBeFalsy();
  });

  it('does not handle removing bookmark when processing', async () => {
    render(<BookmarkButton {...mockData} unitId={bookmarkedUnitBlock.id} isBookmarked isProcessing />);

    const button = screen.getByRole('button', { name: 'Bookmarked' });
    expect(button).toHaveClass('disabled');

    fireEvent.click(button);
    // HACK: We don't have a function we could reliably await here, so this test relies on the timeout of `waitFor`.
    await expect(waitFor(
      () => expect(axiosMock.history.delete).toHaveLength(1),
      { timeout: 100 },
    )).rejects.toThrowError(/expect.*toHaveLength.*/);
    expect(store.getState().models.units[bookmarkedUnitBlock.id].bookmarked).toBeTruthy();
  });
});
