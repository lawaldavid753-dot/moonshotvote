const { ImageResponse } = require('@vercel/og');
const React = require('react');

module.exports = async function handler(req, res) {
  try {
    const ca = req.query.ca || '';

    let tokenName = 'Token';
    let tokenTicker = 'TKN';
    let tokenImage = '';

    if (ca) {
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
          tokenImage = (best.info && best.info.imageUrl) ? best.info.imageUrl : '';
        }
      }
    }

    const imageResponse = new ImageResponse(
      React.createElement('div', {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0d0a1a',
          fontFamily: 'sans-serif',
          position: 'relative',
        }
      },
        // Background gradient top
        React.createElement('div', {
          style: {
            position: 'absolute',
            top: '-10%',
            left: '10%',
            width: '80%',
            height: '60%',
            background: 'radial-gradient(ellipse at center, rgba(100, 20, 180, 0.4) 0%, transparent 60%)',
          }
        }),
        // Background gradient bottom-right
        React.createElement('div', {
          style: {
            position: 'absolute',
            bottom: '0',
            right: '10%',
            width: '60%',
            height: '50%',
            background: 'radial-gradient(ellipse at center, rgba(246, 49, 252, 0.2) 0%, transparent 50%)',
          }
        }),
        // Moonshot logo text
        React.createElement('div', {
          style: {
            position: 'absolute',
            top: '40px',
            left: '50px',
            display: 'flex',
            alignItems: 'center',
            color: '#ffffff',
            fontSize: '28px',
            fontWeight: 'bold',
          }
        }, '🚀 Moonshot'),
        // "Powered by Moonshot" badge
        React.createElement('div', {
          style: {
            position: 'absolute',
            top: '46px',
            right: '50px',
            display: 'flex',
            alignItems: 'center',
            color: '#a8a2b2',
            fontSize: '16px',
            background: 'rgba(255,255,255,0.06)',
            padding: '6px 16px',
            borderRadius: '20px',
            border: '1px solid #2a2d36',
          }
        }, 'Powered by Moonshot'),
        // Main Card
        React.createElement('div', {
          style: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#15171d',
            border: '1px solid #2a2d36',
            borderRadius: '24px',
            padding: '48px',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)',
            maxWidth: '1000px',
            width: '88%',
          }
        },
          // Left side: Token Image
          React.createElement('div', {
            style: { display: 'flex', marginRight: '48px', flexShrink: '0' }
          },
            tokenImage
              ? React.createElement('img', {
                  src: tokenImage,
                  width: '180',
                  height: '180',
                  style: { borderRadius: '50%', border: '4px solid #2a2d36', objectFit: 'cover' }
                })
              : React.createElement('div', {
                  style: {
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    backgroundColor: '#1e2129',
                    border: '4px solid #2a2d36',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D4D3E8',
                    fontSize: '64px',
                  }
                }, '?')
          ),
          // Right side: Token Details
          React.createElement('div', {
            style: { display: 'flex', flexDirection: 'column', flex: '1' }
          },
            React.createElement('div', {
              style: {
                color: '#f631fc',
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '8px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }
            }, 'VOTE'),
            React.createElement('div', {
              style: {
                color: '#ffffff',
                fontSize: '42px',
                fontWeight: 'bold',
                marginBottom: '8px',
                lineHeight: '1.1',
              }
            }, `${tokenName}`),
            React.createElement('div', {
              style: {
                color: '#a8a2b2',
                fontSize: '22px',
                marginBottom: '20px',
              }
            }, `$${tokenTicker}`),
            React.createElement('div', {
              style: {
                color: '#D4D3E8',
                fontSize: '20px',
                marginBottom: '24px',
                lineHeight: '1.4',
              }
            }, 'Vote the next meme coin to list on Moonshot'),
            // Vote button
            React.createElement('div', {
              style: {
                display: 'flex',
                flexDirection: 'row',
              }
            },
              React.createElement('div', {
                style: {
                  background: 'linear-gradient(135deg, #f631fc, #d431e0)',
                  padding: '14px 36px',
                  borderRadius: '14px',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold',
                }
              }, '🚀 Vote to list')
            )
          )
        ),
        // Bottom bar
        React.createElement('div', {
          style: {
            position: 'absolute',
            bottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            color: '#6b6578',
            fontSize: '14px',
          }
        },
          React.createElement('span', null, '🔒 No funds moved'),
          React.createElement('span', null, '📝 Pure vote signature'),
          React.createElement('span', null, '⭐ Earns 1000 XP')
        )
      ),
      {
        width: 1200,
        height: 630,
      }
    );

    // Get the image buffer from the ImageResponse
    const buffer = await imageResponse.arrayBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.send(Buffer.from(buffer));

  } catch (e) {
    console.error('OG Image generation error:', e);
    // Return a simple fallback SVG
    const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0d0a1a"/>
      <text x="600" y="280" fill="#f631fc" font-size="48" text-anchor="middle" font-family="sans-serif" font-weight="bold">VOTE</text>
      <text x="600" y="350" fill="#ffffff" font-size="36" text-anchor="middle" font-family="sans-serif">Vote the next meme coin to list</text>
      <text x="600" y="400" fill="#a8a2b2" font-size="24" text-anchor="middle" font-family="sans-serif">Powered by Moonshot</text>
    </svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.send(svg);
  }
};
