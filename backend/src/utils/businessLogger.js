const logBusinessEvent = (event, details = {}) => {
  console.log(JSON.stringify({
    type: 'business_event',
    event,
    at: new Date().toISOString(),
    ...details,
  }));
};

module.exports = {
  logBusinessEvent,
};
