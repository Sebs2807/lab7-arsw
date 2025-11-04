import { NavLink, Route, Routes } from 'react-router-dom'
import BlueprintsPage from './pages/BlueprintsPage.jsx'
import BlueprintDetailPage from './pages/BlueprintDetailPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <div className="container">
      <header>
        <h1>Blueprints en React</h1>
        <nav>
          <NavLink to="/blueprints">Blueprints</NavLink>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/blueprints" element={<BlueprintsPage />} />
        <Route path="/blueprints/:author/:name" element={<BlueprintDetailPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}