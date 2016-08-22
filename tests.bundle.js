var context = require.context('./spec', true, /.+\.jsx?$/);
context.keys().forEach(context);
module.exports = context;
