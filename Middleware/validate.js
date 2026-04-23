const validate = (schema, source = 'body', options = {}) => (req, res, next) => {
  const isWrappedMode = source === 'all';
  const normalizedBody =
    req.body &&
    typeof req.body === 'object' &&
    !Array.isArray(req.body) &&
    req.body.body &&
    typeof req.body.body === 'object' &&
    !Array.isArray(req.body.body)
      ? req.body.body
      : req.body;

  const input = isWrappedMode
    ? {
        body: normalizedBody || {},
        params: req.params || {},
        query: req.query || {},
      }
    : source === 'body'
      ? normalizedBody || {}
      : source === 'params'
        ? req.params || {}
        : source === 'query'
          ? req.query || {}
          : req.body || {};

  const result = schema.safeParse(input);

  if (!result.success) {
    const hasParamsError =
      source === 'params' ||
      result.error.issues.some((issue) => Array.isArray(issue.path) && issue.path[0] === 'params');

    if (hasParamsError) {
      const msg =
        typeof options.invalidParamsMessage === 'string'
          ? options.invalidParamsMessage
          : 'Invalid user id';
      return res.status(400).json({ success: false, message: msg });
    }

    return res.status(400).json({
      success: false,
      message: 'Validation error',
      data: result.error.flatten(),
    });
  }

  if (isWrappedMode) {
    if (result.data.body !== undefined) req.body = result.data.body;
    if (result.data.params !== undefined) req.params = result.data.params;
    if (result.data.query !== undefined) req.query = result.data.query;
  } else {
    req[source] = result.data;
  }

  next();
};

module.exports = validate;
