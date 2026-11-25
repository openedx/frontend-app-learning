import type { User } from '@openedx/frontend-base';

export const authenticatedUser: User = {
  userId: 123,
  username: 'MockUser',
  name: 'Mock User',
  email: 'mock@example.com',
  avatar: 'https://example.com/avatar.jpg',
  roles: [],
  administrator: false,
};
