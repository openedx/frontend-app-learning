function daycmp(a, b) {
  if (a.getFullYear() < b.getFullYear()) { return -1; }
  if (a.getFullYear() > b.getFullYear()) { return 1; }
  if (a.getMonth() < b.getMonth()) { return -1; }
  if (a.getMonth() > b.getMonth()) { return 1; }
  if (a.getDate() < b.getDate()) { return -1; }
  if (a.getDate() > b.getDate()) { return 1; }
  return 0;
}

// item is a date block returned from the API
function isLearnerAssignment(item) {
  return item.learnerHasAccess && item.dateType === 'assignment-due-date';
}

export { daycmp, isLearnerAssignment };
