import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Portada from './pages/Portada';
import Familias from './pages/Familias';
import ListadoPlatos from './pages/ListadoPlatos';
import FichaPlato from './pages/FichaPlato';
import MiSeleccion from './pages/MiSeleccion';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/admin/Login';
import HomePrivado from './pages/admin/HomePrivado';
import AdminFamilias from './pages/admin/AdminFamilias';
import AdminFamiliaForm from './pages/admin/AdminFamiliaForm';
import AdminProductos from './pages/admin/AdminProductos';
import AdminProductoForm from './pages/admin/AdminProductoForm';
import AdminConfiguracion from './pages/admin/AdminConfiguracion';

function App() {
  // Vite defines the public base for each deployment target. For the
  // Cloudflare production build this is /carta-camborio/, so React Router
  // must use the same prefix. Local development keeps basename undefined.
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Portada />} />
        <Route path="/familias" element={<Familias />} />
        <Route path="/familias/buscar" element={<ListadoPlatos />} />
        <Route path="/familias/:id" element={<ListadoPlatos />} />
        <Route path="/sugerencias" element={<ListadoPlatos />} />
        <Route path="/plato/:id" element={<FichaPlato />} />
        <Route path="/buscar" element={<Navigate to="/familias?buscar=1" replace />} />
        <Route path="/seleccion" element={<MiSeleccion />} />

        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<HomePrivado />} />
          <Route path="familias" element={<AdminFamilias />} />
          <Route path="familias/nuevo" element={<AdminFamiliaForm />} />
          <Route path="familias/:id/editar" element={<AdminFamiliaForm />} />
          <Route path="productos" element={<AdminProductos />} />
          <Route path="productos/nuevo" element={<AdminProductoForm />} />
          <Route path="productos/:id/editar" element={<AdminProductoForm />} />
          <Route path="configuracion" element={<AdminConfiguracion />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
