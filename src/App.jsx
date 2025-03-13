import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./assets/Database/authcontext";
import ProtectedRoute from "./assets/Components/ProtectedRoute"; 
import Login from './assets/Views/Login'
import Encabezado from "./assets/Components/Encabezado";
import Inicio from "./assets/Views/Inicio";

import "./App.css";

function App() {

  return (
    <>
      <AuthProvider>
        <Router>
          <div className="App">
            <Encabezado />
            <main>
              <Routes>
                
                <Route path="/" element={<Login />} />
                <Route path="/inicio" element={<ProtectedRoute element={<Inicio />} />} />

              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </>
  )
}

export default App

