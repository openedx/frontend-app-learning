const defaultType = 'text';

// Parses the search results in a convenient way.
export default function mapSearchResponse(response, searchKeyword) {
  const keywords = searchKeyword.split(' ');

  const {
    took: ms,
    total,
    max_score: maxScore,
    results: rawResults,
  } = response;

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
    let contentHits = 0;

    const content = htmlContent || transcriptEn || '';
    keywords.forEach(word => { contentHits += content.split(word).length - 1; });

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
