import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import type { Familia, Alergeno, Producto } from '../../types/database';
import { ArrowLeft, Save } from 'lucide-react';

export default function AdminProductoForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [alergenos, setAlergenos] = useState<Alergeno[]>([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [familiaId, setFamiliaId] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [disponible, setDisponible] = useState(true);
  const [destacado, setDestacado] = useState(false);
  const [selectedAlergenos, setSelectedAlergenos] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [familiasData, alergenosData] = await Promise.all([
          adminApi.getFamiliasAdmin(),
          adminApi.getAlergenosAdmin(),
        ]);
        setFamilias(familiasData);
        setAlergenos(alergenosData);

        if (isEditing && id) {
          const producto = await adminApi.getProductoByIdAdmin(id);
          if (!producto) {
            navigate('/admin/productos');
            return;
          }
          setNombre(producto.nombre);
          setDescripcion(producto.descripcion ?? '');
          setPrecio(String(producto.precio));
          setFamiliaId(producto.familia_id);
          setImagenUrl(producto.imagen_url ?? '');
          setDisponible(producto.disponible);
          setDestacado(producto.destacado);
          setSelectedAlergenos(new Set((producto.alergenos ?? []).map((a) => a.id)));
        } else if (familiasData.length) {
          setFamiliaId(familiasData[0].id);
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        alert('Error al cargar los datos.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate, isEditing]);

  const toggleAlergeno = (alergenoId: string) => {
    const next = new Set(selectedAlergenos);
    if (next.has(alergenoId)) next.delete(alergenoId);
    else next.add(alergenoId);
    setSelectedAlergenos(next);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!familiaId) {
      alert('Debes seleccionar una familia.');
      return;
    }

    setSaving(true);
    try {
      const productoData: Partial<Producto> = {
        nombre,
        descripcion: descripcion || null,
        precio: Number(precio),
        familia_id: familiaId,
        imagen_url: imagenUrl || null,
        disponible,
        destacado,
      };

      if (isEditing && id) {
        await adminApi.updateProducto(id, productoData, Array.from(selectedAlergenos));
      } else {
        await adminApi.createProducto(productoData, Array.from(selectedAlergenos));
      }
      navigate('/admin/productos');
    } catch (error) {
      console.error('Error saving producto:', error);
      alert('Error al guardar el producto.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/productos')} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Información básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nombre *</label>
              <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Precio (€) *</label>
              <input type="number" step="0.01" min="0" required value={precio} onChange={(e) => setPrecio(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Familia *</label>
            <select required value={familiaId} onChange={(e) => setFamiliaId(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white outline-none">
              {familias.map((familia) => <option key={familia.id} value={familia.id}>{familia.nombre}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">URL de la imagen</label>
            <input type="url" value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Estado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
              <input type="checkbox" checked={disponible} onChange={(e) => setDisponible(e.target.checked)} className="w-5 h-5" />
              <div><p className="font-medium text-gray-900">Disponible</p><p className="text-sm text-gray-500">Se muestra en la carta pública.</p></div>
            </label>
            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
              <input type="checkbox" checked={destacado} onChange={(e) => setDestacado(e.target.checked)} className="w-5 h-5" />
              <div><p className="font-medium text-gray-900">Destacado</p><p className="text-sm text-gray-500">Marca el producto como destacado.</p></div>
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Alérgenos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {alergenos.map((alergeno) => {
              const selected = selectedAlergenos.has(alergeno.id);
              return (
                <label key={alergeno.id} className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer text-center gap-2 ${selected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="checkbox" className="sr-only" checked={selected} onChange={() => toggleAlergeno(alergeno.id)} />
                  {alergeno.icono_url && <img src={alergeno.icono_url} alt={alergeno.nombre} className="w-8 h-8 object-contain" />}
                  <span className="text-sm font-medium">{alergeno.nombre}</span>
                </label>
              );
            })}
          </div>
          {!alergenos.length && <p className="text-gray-500 text-sm">No hay alérgenos configurados.</p>}
        </section>

        <div className="pt-6 border-t flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/admin/productos')} className="px-6 py-3 font-medium text-gray-600 bg-gray-100 rounded-lg">Cancelar</button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 font-medium text-white bg-primary rounded-lg disabled:opacity-50" style={{ backgroundColor: 'var(--color-primary)' }}>
            <Save size={20} /> {saving ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
}
