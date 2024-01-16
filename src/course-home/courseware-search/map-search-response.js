const Joi = require('joi');

const endpointSchema = Joi.object({
  took: Joi.number().required(),
  total: Joi.number().required(),
  maxScore: Joi.number().allow(null),
  results: Joi.array().items(Joi.object({
    id: Joi.string(),
    contentType: Joi.string(),
    location: Joi.array().items(Joi.string()),
    url: Joi.string(),
    content: Joi.object({
      displayName: Joi.string(),
      htmlContent: Joi.string(),
      transcriptEn: Joi.string(),
    }),
  }).unknown(true)).strict(),
}).unknown(true).strict();

const defaultType = 'text';

// Parses the search results in a convenient way.
export default function mapSearchResponse(response, searchKeywords = '') {
  const { error, value: data } = endpointSchema.validate(response);

  if (error) {
    throw new Error('Error in server response:', error);
  }

  const keywords = searchKeywords ? searchKeywords.toLowerCase().split(' ') : [];

  const {
    took: ms,
    total,
    maxScore,
    results: rawResults,
  } = data;

  const results = rawResults.map(result => {
    const {
      score,
      data: {
        id,
        content: {
          displayName,
          htmlContent,
          transcriptEn,
        },
        contentType,
        location,
        url,
      },
    } = result;

    const type = contentType?.toLowerCase() || defaultType;

    const content = htmlContent || transcriptEn || '';
    const searchContent = content.toLowerCase();
    let contentHits = 0;
    if (keywords.length) {
      keywords.forEach(word => {
        contentHits += searchContent ? searchContent.toLowerCase().split(word).length - 1 : 0;
      });
    }

    const title = displayName || contentType;

    return {
      id,
      title,
      type,
      location,
      url,
      contentHits,
      score,
    };
  });

  const filters = rawResults.reduce((list, result) => {
    const label = result?.data?.contentType;

    if (!label) { return list; }

    const key = label.toLowerCase();

    const index = list.findIndex(i => i.key === key);

    if (index === -1) {
      return [
        ...list,
        {
          key,
          label,
          count: 1,
        },
      ];
    }

    const newItem = { ...list[index] };
    newItem.count++;

    const newList = list.slice(0);
    newList[index] = newItem;

    return newList;
  }, []);

  filters.sort((a, b) => (a.key > b.key ? 1 : -1));

  return {
    results,
    filters,
    total,
    maxScore,
    ms,
  };
}
