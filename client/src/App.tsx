import { Fragment } from 'react'
import useRouteElement from './routes'

function App() {
  const routeElement = useRouteElement()
  return <Fragment>{routeElement}</Fragment>
}

export default App
