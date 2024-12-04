import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md space-y-4">
        <h1 className="text-xl font-bold">Hello, Tailwind!</h1>
        <p className="text-gray-500">這是使用 Tailwind CSS 的示例。</p>
      </div>
    </div>
  );
}

export default App
