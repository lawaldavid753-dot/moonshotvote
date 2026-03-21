const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const CA = process.argv[2];
if (!CA) {
  console.log('❌ Please provide a contract address. Example: node generate_preview.js 9QSjVAg5rDfBZPhvKwZcB63St3r6bqohP3Adurkjpump');
  process.exit(1);
}

const DEX_API = `https://api.dexscreener.com/latest/dex/tokens/${CA}`;

console.log(`🔍 Fetching data for ${CA}...`);

https.get(DEX_API, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (!parsed.pairs || !parsed.pairs.length) {
        console.log('❌ Token not found on DexScreener.');
        return;
      }
      
      let best = parsed.pairs[0];
      for (const p of parsed.pairs) {
        if (p.baseToken && p.baseToken.address === CA) {
          if (p.volume && best.volume && p.volume.h24 > best.volume.h24) best = p;
        }
      }
      
      const tokenName = best.baseToken.name || 'Token';
      const tokenTicker = best.baseToken.symbol || 'TKN';
      const tokenImage = (best.info && best.info.imageUrl) ? best.info.imageUrl : '';
      
      console.log(`✅ Found token: ${tokenName} (${tokenTicker})`);
      
      // Update index.html
      const indexPath = path.join(__dirname, 'index.html');
      let html = fs.readFileSync(indexPath, 'utf-8');
      
      const title = `Vote ${tokenName} to list on Moonshot`;
      const desc = `Vote YES to earn XP. Help prioritize ${tokenTicker} for potential listing in the Moonshot app.`;
      
      // Use regex to replace meta tags
      html = html.replace(/<meta content=".*?" property="og:title"/g, `<meta content="${title}" property="og:title"`);
      html = html.replace(/<meta content=".*?" property="og:description"/g, `<meta content="${desc}" property="og:description"`);
      if (tokenImage) {
        html = html.replace(/<meta content=".*?" property="og:image"/g, `<meta content="${tokenImage}" property="og:image"`);
      }
      
      html = html.replace(/<meta content=".*?" name="twitter:title"/g, `<meta content="${title}" name="twitter:title"`);
      html = html.replace(/<meta content=".*?" name="twitter:description"/g, `<meta content="${desc}" name="twitter:description"`);
      if (tokenImage) {
        html = html.replace(/<meta content=".*?" name="twitter:image"/g, `<meta content="${tokenImage}" name="twitter:image"`);
      }
      
      // Update hardcoded token URL default
      html = html.replace(/window\.location\.href = base \+ '\/\#\/' \+ val;/g, `window.location.href = base + '/#/' + val;`);
      
      fs.writeFileSync(indexPath, html);
      console.log(`✅ index.html updated with Social Meta Tags for ${tokenTicker}.`);
      
      // Instructions for Puppeteer screenshot
      console.log('\n📸 To generate a high-quality site_preview.png, you can run a Puppeteer script or manually screenshot the page.');
      console.log('The social media embed tags in index.html have now been fully updated to feature the token dynamically!');

    } catch (e) {
      console.log('❌ Error parsing DexScreener response:', e);
    }
  });
}).on('error', e => console.log('❌ Request error:', e));
