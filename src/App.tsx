import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Portada from './pages/Portada';
import Familias from './pages/Familias';
import ListadoPlatos from './pages/ListadoPlatos';
import FichaPlato from './pages/FichaPlato';
import Buscar from './pages/Buscar';
import MiSeleccion from './pages/MiSeleccion';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Portada />} />
          <Route path="familias" element={<Familias />} />
          <Route path="familias/:id" element={<ListadoPlatos />} />
          <Route path="plato/:id" element={<FichaPlato />} />
          <Route path="buscar" element={<Buscar />} />
          <Route path="seleccion" element={<MiSeleccion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;