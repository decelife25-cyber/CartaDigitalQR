import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Portada from './pages/Portada';
import Familias from './pages/Familias';
import ListadoPlatos from './pages/ListadoPlatos';
import FichaPlato from './pages/FichaPlato';
import Buscador from './pages/Buscador';
import MiSeleccion from './pages/MiSeleccion';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/admin/Login';
import HomePrivado from './pages/admin/HomePrivado';
import AdminFamilias from './pages/admin/AdminFamilias';
import AdminProductos from './pages/admin/AdminProductos';
import AdminProductoForm from './pages/admin/AdminProductoForm';
import AdminConfiguracion from './pages/admin/AdminConfiguracion';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Portada />} />
        <Route path="/familias" element={<Familias />} />
        <Route path="/familia/:id" element={<ListadoPlatos />} />
        <Route path="/producto/:id" element={<FichaPlato />} />
        <Route path="/buscar" element={<Buscador />} />
        <Route path="/seleccion" element={<MiSeleccion />} />

        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<HomePrivado />} />
          <Route path="familias" element={<AdminFamilias />} />
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
