import { getConfig, camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export type Role = 'staff' | 'student';

export interface ActiveMasqueradeData {
  courseKey: string;
  role: Role;
  userName: string | null;
  userPartitionId: number | null;
  groupId: number | null;
  groupName: string | null;
}

export interface MasqueradeOption {
  name: string;
  role: Role;
  userName?: string;
  groupId?: number;
  userPartitionId?: number;
}

export interface MasqueradeStatus {
  success: boolean;
  error?: string;
  active: ActiveMasqueradeData;
  available: MasqueradeOption[];
}

export interface Payload {
  role?: Role;
  user_name?: string;
  group_id?: number;
  user_partition_id?: number;
}

export async function getMasqueradeOptions(courseId: string): Promise<MasqueradeStatus> {
  const url = new URL(`${getConfig().LMS_BASE_URL}/courses/${courseId}/masquerade`);
  const { data } = await getAuthenticatedHttpClient().get(url.href, {});
  return camelCaseObject(data);
}

export async function postMasqueradeOptions(courseId: string, payload: Payload): Promise<MasqueradeStatus> {
  const url = new URL(`${getConfig().LMS_BASE_URL}/courses/${courseId}/masquerade`);
  const { data } = await getAuthenticatedHttpClient().post(url.href, payload);
  return camelCaseObject(data);
}

export function reloadAfterMasqueradeChange() {
  const { pathname, search, hash } = global.location;
  const progressPath = pathname.replace(/(\/course\/[^/]+\/progress)\/[^/]+\/?$/, '$1');
  if (progressPath === pathname) {
    global.location.reload();
  } else {
    global.location.assign(`${progressPath}${search}${hash}`);
  }
}
