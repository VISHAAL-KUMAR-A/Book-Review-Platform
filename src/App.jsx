import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import axios from "axios"

// Pages
import Home from './pages/Home'
import BookList from './pages/BookList'
import BookDetails from './pages/BookDetails'
import UserProfile from './pages/UserProfile'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {
  const [user, setUser] = useState(null)

  // Normalize user object on initial load and when it changes
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'))
    if (storedUser) {
      // Normalize the user object structure
      const normalizedUser = {
        _id: storedUser.user ? storedUser.user._id : storedUser._id,
        username: storedUser.user ? storedUser.user.username : storedUser.username,
        email: storedUser.user ? storedUser.user.email : storedUser.email,
        role: storedUser.user ? storedUser.user.role : storedUser.role,
        token: storedUser.token
      }
      setUser(normalizedUser)
    }
  }, [])

  // Custom setter for user that normalizes the structure
  const handleSetUser = (userData) => {
    if (userData) {
      // Normalize the user object structure
      const normalizedUser = {
        _id: userData.user ? userData.user._id : userData._id,
        username: userData.user ? userData.user.username : userData.username,
        email: userData.user ? userData.user.email : userData.email,
        role: userData.user ? userData.user.role : userData.role,
        token: userData.token
      }
      setUser(normalizedUser)
      localStorage.setItem('user', JSON.stringify(normalizedUser))
    } else {
      setUser(null)
    }
  }

  const handleLogout = () => {
    handleSetUser(null)
    localStorage.removeItem('user')
  }

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<BookList />} />
            <Route path="/books/google/:id" element={<BookDetails user={user} source="google" />} />
            <Route path="/books/local/:id" element={<BookDetails user={user} source="local" />} />
            <Route path="/books/:id" element={<BookDetails user={user} />} />
            <Route path="/profile" element={<UserProfile user={user} />} />
            <Route path="/login" element={<Login setUser={handleSetUser} />} />
            <Route path="/register" element={<Register setUser={handleSetUser} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
