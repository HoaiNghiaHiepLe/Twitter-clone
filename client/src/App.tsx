import { Fragment, useEffect } from 'react'
import useRouteElement from './routes'
import axios from 'axios'

function App() {
  const { VITE_API_URL } = import.meta.env

  const controller = new AbortController()

  const access_token = localStorage.getItem('access_token')
  const refresh_token = localStorage.getItem('refresh_token')

  const handleGetMe = () => {
    axios
      .get(`users/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        },
        baseURL: VITE_API_URL,
        signal: controller.signal
      })
      .then((res) => {
        localStorage.setItem('profile', JSON.stringify(res.data.result))
      })
  }

  useEffect(() => {
    if (access_token && refresh_token) {
      handleGetMe()
    }

    return () => {}
  }, [access_token, refresh_token, controller.signal])

  const routeElement = useRouteElement()
  return <Fragment>{routeElement}</Fragment>
}

export default App
