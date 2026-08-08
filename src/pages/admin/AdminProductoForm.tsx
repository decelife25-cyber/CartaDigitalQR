import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import type { Familia, Alergeno, Producto } from '../../types/database';
import { ArrowLeft, Save } from 'lucide-react';

export default function AdminProductoForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [familias, setFamilias] = useState<Familia[]>([]);
  const [alergenos, setAlergenos] = useState<Alergeno[]>([]);
  const [todosProductos, setTodosProductos] = useState<Producto[]>([]);

  // Form State
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [familiaId, setFamiliaId] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [activo, setActivo] = useState(true);
  const [agotado, setAgotado] = useState(false);
  const [selectedAlergenos, setSelectedAlergenos] = useState<Set<string>>(new Set());
  const [selectedSugerencias, setSelectedSugerencias] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [fData, aData, pData] = await Promise.all([
          adminApi.getFamiliasAdmin(),
          adminApi.getAlergenosAdmin(),
          adminApi.getProductosAdmin()
        ]);

        setFamilias(fData);
        setAlergenos(aData);
        setTodosProductos(pData);

        if (isEditing) {
          const producto = await adminApi.getProductoByIdAdmin(id);
          if (producto) {
            setNombre(producto.nombre);
            setDescripcion(producto.descripcion || '');
            setPrecio(producto.precio.toString());
            setFamiliaId(producto.familia_id);
            setFotoUrl(producto.foto_url || '');
            setActivo(producto.activo);
            setAgotado(producto.agotado);

            if (producto.alergenos) {
              setSelectedAlergenos(new Set(producto.alergenos.map(a => a.id)));
            }
            if (producto.sugerencias) {
              setSelectedSugerencias(new Set(producto.sugerencias.map(s => s.id)));
            }
          } else {
            navigate('/admin/productos');
          }
        } else if (fData.length > 0) {
          setFamiliaId(fData[0].id);
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        alert('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familiaId) {
      alert('Debes seleccionar una familia.');
      return;
    }

    setSaving(true);
    try {
      const productoData = {
        nombre,
        descripcion: descripcion || null,
        precio: parseFloat(precio),
        familia_id: familiaId,
        foto_url: fotoUrl || null,
        activo,
        agotado,
      };

      if (isEditing) {
        await adminApi.updateProducto(id, productoData, Array.from(selectedAlergenos), Array.from(selectedSugerencias));
      } else {
        await adminApi.createProducto(productoData, Array.from(selectedAlergenos), Array.from(selectedSugerencias));
      }
      navigate('/admin/productos');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error al guardar el producto.');
    } finally {
      setSaving(false);
    }
  };

  const toggleAlergeno = (aId: string) => {
    const next = new Set(selectedAlergenos);
    if (next.has(aId)) next.delete(aId);
    else next.add(aId);
    setSelectedAlergenos(next);
  };

  const toggleSugerencia = (pId: string) => {
    const next = new Set(selectedSugerencias);
    if (next.has(pId)) next.delete(pId);
    else next.add(pId);
    setSelectedSugerencias(next);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/productos')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">

        {/* Información Básica */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Información Básica</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nombre *</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Precio (€) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={precio}
                onChange={e => setPrecio(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              rows={3}
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Familia (Categoría) *</label>
            <select
              value={familiaId}
              onChange={e => setFamiliaId(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
            >
              {familias.map(f => (
                <option key={f.id} value={f.id}>{f.nombre}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">URL de la Foto</label>
            <input
              type="url"
              value={fotoUrl}
              onChange={e => setFotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500">Actualmente el sistema soporta URLs externas para las imágenes.</p>
          </div>
        </section>

        {/* Estado y Disponibilidad */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Estado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={activo}
                onChange={e => setActivo(e.target.checked)}
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
              <div>
                <p className="font-medium text-gray-900">Producto Visible</p>
                <p className="text-sm text-gray-500">El producto se mostrará en la carta pública.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={!agotado}
                onChange={e => setAgotado(!e.target.checked)}
                className="w-5 h-5 text-primary rounded focus:ring-primary"
              />
              <div>
                <p className="font-medium text-gray-900">Disponible (En Stock)</p>
                <p className="text-sm text-gray-500">Desmarca si el producto está agotado temporalmente.</p>
              </div>
            </label>
          </div>
        </section>

        {/* Alérgenos */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Alérgenos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {alergenos.map(alergeno => {
              const isSelected = selectedAlergenos.has(alergeno.id);
              return (
                <label
                  key={alergeno.id}
                  className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors text-center gap-2 ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}
                  style={isSelected ? { borderColor: 'var(--color-primary)' } : {}}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isSelected}
                    onChange={() => toggleAlergeno(alergeno.id)}
                  />
                  {alergeno.icono && (
                    <img src={alergeno.icono} alt={alergeno.nombre} className="w-8 h-8 object-contain" />
                  )}
                  <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                    {alergeno.nombre}
                  </span>
                </label>
              );
            })}
          </div>
          {alergenos.length === 0 && <p className="text-gray-500 text-sm">No hay alérgenos configurados en el sistema.</p>}
        </section>

        {/* Sugerencias */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Sugerencias (Venta cruzada)</h2>
          <p className="text-sm text-gray-500 mb-2">Selecciona otros productos para sugerir junto a este plato.</p>

          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
            {todosProductos.filter(p => p.id !== id).map(prod => (
              <label key={prod.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSugerencias.has(prod.id)}
                  onChange={() => toggleSugerencia(prod.id)}
                  className="w-5 h-5 text-primary rounded focus:ring-primary"
                />
                <span className="font-medium text-gray-700">{prod.nombre}</span>
                <span className="text-gray-400 text-sm ml-auto">{prod.precio.toFixed(2)}€</span>
              </label>
            ))}
            {todosProductos.length <= 1 && (
              <div className="p-4 text-center text-gray-500 text-sm">No hay otros productos para sugerir.</div>
            )}
          </div>
        </section>

        {/* Submit */}
        <div className="pt-6 border-t flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/productos')}
            className="px-6 py-3 font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 font-medium text-white bg-primary hover:opacity-90 rounded-lg transition-opacity disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Save size={20} />
            {saving ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>

      </form>
    </div>
  );
}
