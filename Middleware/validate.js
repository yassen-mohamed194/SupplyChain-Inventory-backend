const validate = (schema, source = 'body', options = {}) => (req, res, next) => {
  const input =
    source === 'body' ? req.body || {} : source === 'params' ? req.params || {} : req[source];

  const result = schema.safeParse(input);

  if (!result.success) {
    // Keep parity with existing users controller responses:
    // - body validation errors: { success:false, message:'Validation error', data:<flatten> }
    // - params (id) validation errors: { success:false, message:'Invalid user id' }
    if (source === 'params') {
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

  req[source] = result.data;
  next();
};

module.exports = validate;
