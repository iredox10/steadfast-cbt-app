import React from 'react'
import { Link } from 'react-router-dom'
import { FaExclamationTriangle, FaHome } from 'react-icons/fa'
import logo from '../../public/assets/logo.webp'

const LoggedStudent = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img
              src={logo}
              className="w-10 h-10 object-contain"
              alt="HUK POLY Logo"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-800">HUK POLY</h1>
              <p className="text-xs text-gray-600">Computer Based Test Portal</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <FaExclamationTriangle className="text-white text-2xl" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-white">Already Logged In</h1>
                <p className="text-yellow-100 mt-1">Session Conflict</p>
              </div>
              
              {/* Card Body */}
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Active Session Detected
                </h2>
                <p className="text-gray-600 mb-6">
                  You are already logged in on another device. For security reasons, 
                  you cannot have multiple active sessions.
                </p>
                <p className="text-gray-600 mb-8">
                  If you believe this is an error, please contact your examination administrator.
                </p>
                
                <Link 
                  to="/" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition shadow-lg"
                >
                  <FaHome className="mr-2" />
                  Return to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} HUK Polytechnic. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LoggedStudent