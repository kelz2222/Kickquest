export default async function handler(req, res) {
  const { league } = req.query;
  const codeMap = { EPL: "PL", UCL: "CL", LIGA: "PD", BUN: "BL1", SA: "SA" };
  const code = codeMap[league];
  if (!code) return res.status(400).json({ error: "Invalid league" });

  const key = process.env.FOOTBALLDATA_KEY;
  try {
    const r = await fetch(`https://api.football-data.org/v4/competitions/${code}/standings`, {
      headers: key ? { "X-Auth-Token": key } : {},
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: "Fetch failed" });
  }
}
