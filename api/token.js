const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  const { ca } = req.query;
  
  if (!ca) {
    const indexPath = path.join(process.cwd(), 'index.html');
    const html = fs.readFileSync(indexPath, 'utf-8');
    return res.setHeader('Content-Type', 'text/html').send(html);
  }

  try {
    let title = "Vote to list on Moonshot";
    let desc = "Vote YES to earn XP. Help prioritize this token for potential listing in the Moonshot app.";
    let tokenName = "";
    let tokenTicker = "";

    // Fetch token data from DexScreener
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ca}`);
    if (response.ok) {
      const data = await response.json();
      if (data.pairs && data.pairs.length > 0) {
        let best = data.pairs[0];
        for (const p of data.pairs) {
          if (p.baseToken && p.baseToken.address === ca) {
            if (p.volume && best.volume && p.volume.h24 > best.volume.h24) best = p;
          }
        }
        tokenName = best.baseToken.name || 'Token';
        tokenTicker = best.baseToken.symbol || 'TKN';
        title = `Vote ${tokenName} to list on Moonshot`;
        desc = `Vote YES to earn XP. Help prioritize ${tokenTicker} for potential listing in the Moonshot app.`;
      }
    }

    // Read the static index.html
    const indexPath = path.join(process.cwd(), 'index.html');
    let html = fs.readFileSync(indexPath, 'utf-8');

    // Generate dynamic OG Image URL
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
    const ogImageUrl = `${protocol}://${host}/api/og?ca=${ca}`;

    // Replace Meta Tags
    html = html.replace(/<meta content="[^"]*?"\s*property="og:title"/g, `<meta content="${title}" property="og:title"`);
    html = html.replace(/<meta content="[^"]*?"\s*property="og:description"/g, `<meta content="${desc}" property="og:description"`);
    html = html.replace(/<meta content="[^"]*?"\s*property="og:image"/g, `<meta content="${ogImageUrl}" property="og:image"`);

    html = html.replace(/<meta content="[^"]*?"\s*name="twitter:title"/g, `<meta content="${title}" name="twitter:title"`);
    html = html.replace(/<meta content="[^"]*?"\s*name="twitter:description"/g, `<meta content="${desc}" name="twitter:description"`);
    html = html.replace(/<meta content="[^"]*?"\s*name="twitter:image"/g, `<meta content="${ogImageUrl}" name="twitter:image"`);

    return res.setHeader('Content-Type', 'text/html').send(html);

  } catch (e) {
    console.error("Error generating token preview:", e);
    // Fallback to default index.html on error
    const indexPath = path.join(process.cwd(), 'index.html');
    const html = fs.readFileSync(indexPath, 'utf-8');
    return res.setHeader('Content-Type', 'text/html').send(html);
  }
};
