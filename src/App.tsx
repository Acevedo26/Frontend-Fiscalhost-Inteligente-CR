import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { Login } from './pages/Login';
import { Registro } from './pages/Registro';
import { Dashboard } from './pages/Dashboard';
import { Ingresos } from './pages/Ingresos';
import { Impuestos } from './pages/Impuestos';
import { Alertas } from './pages/Alertas';
import { Reportes } from './pages/Reportes';
import { Simulador } from './pages/Simulador';
import { Help } from './pages/Help';
import { Configuracion } from './pages/Configuracion';
import { Comprobantes } from './pages/Comprobantes';
import { Autoliquidacion } from './pages/Autoliquidacion';
import { Mora } from './pages/Mora';
import './styles/reset.css';
import './styles/variables.css';
import './styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registro />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ingresos" element={<Ingresos />} />
          <Route path="/impuestos" element={<Impuestos />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/simulador" element={<Simulador />} />
          <Route path="/help" element={<Help />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/comprobantes" element={<Comprobantes />} />
          <Route path="/autoliquidacion" element={<Autoliquidacion />} />
          <Route path="/mora" element={<Mora />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
