import VOLLEYBALL_IMAGE from '@/assets/volleyball.png'

export default function Loading() {
  return (
    <div className="w-full grow flex justify-center items-center">
      <img
        className="w-[100px] h-[100px] rotate dark:filter-[invert(1)]"
        src={VOLLEYBALL_IMAGE}
        alt="Loading..."
      />
    </div>
  )
}
