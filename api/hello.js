export default function handler(req, res) {
  res.status(200).json({
    method: req.method,
    message: "Backend received your request",
    query: req.query
  });
}
