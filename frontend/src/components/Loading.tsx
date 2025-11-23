import VOLLEYBALL_IMAGE from '@/assets/volleyball.png'

export default function Loading() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <img
        style={{ width: '100px', height: '100px' }}
        className="rotate"
        src={VOLLEYBALL_IMAGE}
        alt="Loading..."
      />
    </div>
  )
}
