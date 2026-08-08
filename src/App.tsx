import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Portada from './pages/Portada';
import Familias from './pages/Familias';
import ListadoPlatos from './pages/ListadoPlatos';
import FichaPlato from './pages/FichaPlato';
import Buscar from './pages/Buscar';
import MiSeleccion from './pages/MiSeleccion';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/admin/Login';
import AdminProductos from './pages/admin/AdminProductos';
import AdminProductoForm from './pages/admin/AdminProductoForm';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Portada />} />
          <Route path="familias" element={<Familias />} />
          <Route path="familias/:id" element={<ListadoPlatos />} />
          <Route path="plato/:id" element={<FichaPlato />} />
          <Route path="buscar" element={<Buscar />} />
          <Route path="seleccion" element={<MiSeleccion />} />
        </Route>

        <Route path="/admin/login" element={<Login />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminProductos />} />
          <Route path="productos" element={<AdminProductos />} />
          <Route path="productos/nuevo" element={<AdminProductoForm />} />
          <Route path="productos/:id/editar" element={<AdminProductoForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;