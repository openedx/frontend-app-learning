import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import {
  getAuthenticatedHttpClient,
  getAuthenticatedUser,
} from '@edx/frontend-platform/auth';

import { updateModel } from '../../generic/model-store';

function recordStreakCelebration(org, courseId) {
  // Tell our analytics
  const { administrator } = getAuthenticatedUser();
  sendTrackEvent('edx.ui.lms.celebration.streak.opened', {
    org_key: org,
    courserun_key: courseId,
    is_staff: administrator,
  });
}

function recordModalClosing(celebrations, org, courseId, dispatch) {
  // Ensure we only celebrate each streak once
  dispatch(updateModel({
    modelType: 'courseHomeMeta',
    model: {
      id: courseId,
      celebrations: { ...celebrations, streakLengthToCelebrate: null },
    },
  }));
}

async function calculateVoucherDiscountPercentage(voucher, sku, username) {
  const urlBase = `${getConfig().ECOMMERCE_BASE_URL}/api/v2/baskets/calculate`;
  const url = `${urlBase}/?code=${voucher}&sku=${sku}&username=${username}`;

  const result = await getAuthenticatedHttpClient().get(url);
  const { totalInclTax, totalInclTaxExclDiscounts } = camelCaseObject(result).data;

  if (totalInclTaxExclDiscounts && totalInclTax !== totalInclTaxExclDiscounts) {
    // Just store the percent (rather than using these values directly), because ecommerce doesn't give us
    // the currency symbol to use, so we want to use the symbol that LMS gives us. And I don't want to assume
    // ecommerce's currency is the same as the LMS. So we'll keep using the values in verifiedMode, just
    // multiplied by the calculated percentage.
    return 1 - totalInclTax / totalInclTaxExclDiscounts;
  }

  return 0;
}

async function getDiscountCodePercentage(code, courseId) {
  const params = new URLSearchParams();
  params.append('code', code);
  params.append('course_run_key', courseId);
  const url = `${getConfig().DISCOUNT_CODE_INFO_URL}?${params.toString()}`;

  const result = await getAuthenticatedHttpClient().get(url);
  const { isApplicable, discountPercentage } = camelCaseObject(result).data;

  return isApplicable ? +discountPercentage : 0;
}

export {
  calculateVoucherDiscountPercentage,
  getDiscountCodePercentage,
  recordModalClosing,
  recordStreakCelebration,
};
