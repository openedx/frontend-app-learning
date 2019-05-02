import pick from 'lodash.pick';

let config = {
  LMS_BASE_URL: null,
};

let apiClient = null;

function validateConfiguration(newConfig) {
  Object.keys(config).forEach((key) => {
    if (newConfig[key] === undefined) {
      throw new Error(`Service configuration error: ${key} is required.`);
    }
  });
}

export function configureApiService(newConfig, newApiClient) {
  validateConfiguration(newConfig);
  config = pick(newConfig, Object.keys(config));
  apiClient = newApiClient;
}

export async function getLearningSequence() {
  const { data } = await apiClient.get(`${config.LMS_BASE_URL}/api/courses/v1/blocks/?course_id=course-v1%3AedX%2BDemoX%2BDemo_Course&username=staff&depth=all&block_types_filter=sequential&requested_fields=children`, {
  });

  // const transformedResults = data.results.map(({
  //   total_excl_tax, // eslint-disable-line camelcase
  //   lines,
  //   number,
  //   currency,
  //   date_placed, // eslint-disable-line camelcase
  // }) => {
  //   const lineItems = lines.map(({
  //     title,
  //     quantity,
  //     description,
  //   }) => ({
  //     title,
  //     quantity,
  //     description,
  //   }));

  //   return {
  //     datePlaced: date_placed,
  //     total: total_excl_tax,
  //     orderId: number,
  //     currency,
  //     lineItems,
  //     receiptUrl: `${config.ECOMMERCE_RECEIPT_BASE_URL}?order_number=${number}`,
  //   };
  // });

  return {
    learningSequence: data,
  };
}
