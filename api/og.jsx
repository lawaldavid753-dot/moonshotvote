import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ca = searchParams.get('ca');

    let tokenName = 'Token';
    let tokenTicker = 'TKN';
    let tokenImage = '';

    if (ca) {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ca}`);
      if (res.ok) {
        const data = await res.json();
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

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0d0a1a',
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Background gradient effects */}
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              left: '50%',
              width: '80%',
              height: '60%',
              background: 'radial-gradient(ellipse at center, rgba(100, 20, 180, 0.4) 0%, transparent 60%)',
              transform: 'translateX(-50%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              right: '10%',
              width: '60%',
              height: '50%',
              background: 'radial-gradient(ellipse at center, rgba(246, 49, 252, 0.2) 0%, transparent 50%)',
            }}
          />
          
          {/* Main Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#15171d',
              border: '1px solid #2a2d36',
              borderRadius: '24px',
              padding: '40px',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)',
              zIndex: 10,
              maxWidth: '900px',
              width: '90%',
            }}
          >
            {/* Left side: Token Image */}
            <div style={{ display: 'flex', marginRight: '40px' }}>
              {tokenImage ? (
                <img
                  src={tokenImage}
                  width="200"
                  height="200"
                  style={{ borderRadius: '50%', border: '4px solid #2a2d36', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    backgroundColor: '#1e2129',
                    border: '4px solid #2a2d36',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D4D3E8',
                    fontSize: '48px',
                  }}
                >
                  ?
                </div>
              )}
            </div>

            {/* Right side: Token Details */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#f631fc', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '0.1em' }}>
                VOTE
              </span>
              <span style={{ color: '#ffffff', fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>
                {tokenName} ({tokenTicker})
              </span>
              <span style={{ color: '#D4D3E8', fontSize: '32px', marginBottom: '24px' }}>
                Vote the next meme coin to list
              </span>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #f631fc, #d431e0)',
                    padding: '16px 32px',
                    borderRadius: '16px',
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: 'bold',
                  }}
                >
                  Vote to list
                </div>
              </div>
            </div>
          </div>
          
          {/* Moonshot Logo Text */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              display: 'flex',
              alignItems: 'center',
              color: '#ffffff',
              fontSize: '32px',
              fontWeight: 'bold',
            }}
          >
            Moonshot
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error(e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
