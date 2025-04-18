import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ChildComp from './ChildComp'
import AngularMicroservice from './AngularC'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     {/* <ChildComp/> */}
     <AngularMicroservice/>
    </>
  )
}

export default App
