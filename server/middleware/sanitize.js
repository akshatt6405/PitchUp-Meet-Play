// Express 5-safe replacement for express-mongo-sanitize.
// Recursively strips keys that start with "$" or contain "." (NoSQL-injection
// operators) by mutating objects IN PLACE — it never reassigns req.query,
// which is read-only in Express 5.

const sanitizeInPlace = (obj) => {
  if (!obj || typeof obj !== 'object') return;

  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else {
      sanitizeInPlace(obj[key]); // recurse into nested objects/arrays
    }
  }
};

const mongoSanitize = (req, res, next) => {
  sanitizeInPlace(req.body);
  sanitizeInPlace(req.params);
  sanitizeInPlace(req.query); // mutate contents, do NOT reassign
  next();
};

module.exports = mongoSanitize;
