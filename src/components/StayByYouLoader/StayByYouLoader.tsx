import './StayByYouLoader.css'

type StayByYouLoaderProps = {
  fullscreen?: boolean
  size?: number
}

export default function StayByYouLoader({
  fullscreen = false,
  size = 120,
}: StayByYouLoaderProps) {
  return (
    <div
      className={`staybyyou-loader-wrapper ${
        fullscreen ? 'staybyyou-loader-wrapper--fullscreen' : ''
      }`}
      role="status"
      aria-label="Chargement"
    >
      <div
        className="staybyyou-loader"
        style={{ width: size, height: size }}
      >
        <img
          src="/staybyyou-bell.png"
          alt=""
          className="staybyyou-loader__layer"
        />
        <img
          src="/staybyyou-wave-1.png"
          alt=""
          className="staybyyou-loader__layer staybyyou-loader__wave staybyyou-loader__wave--1"
        />
        <img
          src="/staybyyou-wave-2.png"
          alt=""
          className="staybyyou-loader__layer staybyyou-loader__wave staybyyou-loader__wave--2"
        />
      </div>
    </div>
  )
}
