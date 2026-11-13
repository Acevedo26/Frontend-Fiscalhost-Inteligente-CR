import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { Login } from './features/auth/pages/Login';
import { Registro } from './features/auth/pages/Registro';
import { Dashboard } from './features/dashboard/pages/Dashboard';
import { Ingresos } from './features/finanzas/pages/Ingresos';
import { Impuestos } from './features/obligaciones/pages/Impuestos';
import { Alertas } from './features/soporte/pages/Alertas';
import { Reportes } from './features/documentos/pages/Reportes';
import { Simulador } from './features/simulador/pages/Simulador';
import { Help } from './features/soporte/pages/Help';
import { Configuracion } from './features/configuracion/pages/Configuracion';
import { Comprobantes } from './features/documentos/pages/Comprobantes';
import { Autoliquidacion } from './features/obligaciones/pages/Autoliquidacion';
import { Mora } from './features/finanzas/pages/Mora';
import './styles/reset.css';
import './styles/variables.css';
import './styles/global.css';
import './styles/alerts.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;
