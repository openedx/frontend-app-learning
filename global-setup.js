// Force all tests to run in UTC to prevent tests from being sensitive to host timezone.
module.exports = async () => {
  process.env.TZ = 'UTC';
};
