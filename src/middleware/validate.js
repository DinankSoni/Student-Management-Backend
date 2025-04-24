const validate = (schema) => (req, res, next) => {
  // Validate request body using schema
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = validate;
