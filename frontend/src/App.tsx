import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './component/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminLayout from './component/Admin-Layout'
import Admin from './pages/Admin'
import ToolPage from './pages/ToolPage'
import Profile from './pages/Profile'
import UserManager from './pages/UserManager'
import ToolManager from './pages/ToolManager'
import AddTool from './pages/AddTool'

function App() {
  return(
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="tools/:toolId" element={<ToolPage />} />
            <Route path="*" element={<div>404 Not Found</div>} />
            <Route path="/profile/:username" element={<Profile />} />

          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Admin />} />
            <Route path="users" element={<UserManager />} />
            <Route path="tools" element={<ToolManager />} />
            <Route path="/admin/tools/add" element={<AddTool />} />

          </Route>
        </Routes>

      </BrowserRouter>
    </>

  )
}

export default App
