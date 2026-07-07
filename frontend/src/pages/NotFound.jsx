import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page">
      <h1>404</h1>
      <p>Stranica ne postoji.</p>
      <Link to="/">Vrati se na početnu</Link>
    </div>
  )
}
