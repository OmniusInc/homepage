import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Omnius株式会社';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          {/* ロゴマーク（グラデーション円） */}
          <div
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background:
                'linear-gradient(135deg, #00CED1 0%, #1E90FF 25%, #6B8DD6 50%, #8B5CF6 75%, #C44AFF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '40px',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                background: 'white',
                borderRadius: '50%',
              }}
            />
          </div>
          {/* Omniusテキスト */}
          <div
            style={{
              fontSize: '120px',
              fontWeight: 'bold',
              color: '#333',
              letterSpacing: '-2px',
            }}
          >
            omnius
          </div>
        </div>
        <div
          style={{
            fontSize: '36px',
            color: '#666',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          全ての英知で 私たちの未来を切り拓く
        </div>
        <div
          style={{
            fontSize: '28px',
            color: '#999',
            marginTop: '20px',
          }}
        >
          AI教育とDX支援で、可能性を最大化
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
