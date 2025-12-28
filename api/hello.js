export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const body = req.body;

  res.status(200).json({
    message: "Backend received POST data",
    body: body
  });
}
