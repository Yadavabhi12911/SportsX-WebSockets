export const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body)
    next()
  } catch (error) {
    const details = error?.issues?.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }))
    res.status(400).json({ message: 'Validation failed', details })
  }
}
