import { Link } from 'react-router-dom'
import { getGoogleAuthUrl } from 'src/utils/googleOAuth'
import '@vidstack/react/player/styles/default/theme.css'
import '@vidstack/react/player/styles/default/layouts/video.css'
import { MediaPlayer, MediaProvider } from '@vidstack/react'
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default'

const Home = () => {
  const googleOAuthUrl = getGoogleAuthUrl()
  const isAuthenticated = Boolean(localStorage.getItem('access_token'))

  const logOut = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.reload()
  }

  return (
    <div className='h-full bg-slate-200'>
      {isAuthenticated ? (
        <>
          <h2>Video Streaming</h2>
          <video controls>
            <source type='video/mp4' src='' />
          </video>
          <h2>HLS Streaming</h2>
          <MediaPlayer
            title='Sprite Fight'
            src='http://localhost:4000/static/video-hls/9CxWtyt5kF67ajEF18pVp/master.m3u8'
          >
            <MediaProvider />
            <DefaultVideoLayout
              thumbnails='https://image.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/storyboard.vtt'
              icons={defaultLayoutIcons}
            />
          </MediaPlayer>
          <div className='bg-red-700'>Authenticated</div>
          <button type='button' onClick={logOut}>
            Log Out
          </button>
        </>
      ) : (
        <Link to={googleOAuthUrl}>Google Login</Link>
      )}
    </div>
  )
}

export default Home
