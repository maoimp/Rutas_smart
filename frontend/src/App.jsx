
import { useEffect, useState } from "react";
import api from "./services/api";
import "./App.css";

function App() {
  const [seccion, setSeccion] = useState("inicio");
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [clienteForm, setClienteForm] = useState({
    nombre: "",
    telefono: "",
    correo: ""
  });

  const [pedidoForm, setPedidoForm] = useState({
    cliente_id: "",
    direccion_entrega: "",
    descripcion: "",
    fecha_entrega: "",
    observaciones: ""
  });

  const [clienteEditando, setClienteEditando] = useState(null);
  const [pedidoEditando, setPedidoEditando] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    setError("");

    try {
      const [respuestaClientes, respuestaPedidos] = await Promise.all([
        api.get("/clientes"),
        api.get("/pedidos")
      ]);

      setClientes(
        Array.isArray(respuestaClientes.data)
          ? respuestaClientes.data
          : respuestaClientes.data.clientes || []
      );

      setPedidos(
        Array.isArray(respuestaPedidos.data)
          ? respuestaPedidos.data
          : respuestaPedidos.data.pedidos || []
      );
    } catch (err) {
      console.error(err);
      setError("No fue posible cargar la información. Verifica que el backend esté funcionando.");
    } finally {
      setCargando(false);
    }
  }

  function mostrarMensaje(texto) {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 3500);
  }

  async function guardarCliente(e) {
    e.preventDefault();
    setError("");

    try {
      if (clienteEditando) {
        await api.put(`/clientes/${clienteEditando}`, clienteForm);
        mostrarMensaje("Cliente actualizado correctamente.");
      } else {
        await api.post("/clientes", clienteForm);
        mostrarMensaje("Cliente registrado correctamente.");
      }

      setClienteForm({ nombre: "", telefono: "", correo: "" });
      setClienteEditando(null);
      await cargarDatos();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.mensaje || "No se pudo guardar el cliente.");
    }
  }

  function prepararEdicionCliente(cliente) {
    setClienteEditando(cliente.id);
    setClienteForm({
      nombre: cliente.nombre || "",
      telefono: cliente.telefono || "",
      correo: cliente.correo || ""
    });
    setSeccion("clientes");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function eliminarCliente(id) {
    if (!window.confirm("¿Deseas eliminar este cliente?")) return;

    try {
      await api.delete(`/clientes/${id}`);
      mostrarMensaje("Cliente eliminado correctamente.");
      await cargarDatos();
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
        "No se pudo eliminar. Comprueba si el cliente tiene pedidos asociados."
      );
    }
  }

  async function guardarPedido(e) {
    e.preventDefault();
    setError("");

    const datos = {
      ...pedidoForm,
      cliente_id: Number(pedidoForm.cliente_id)
    };

    try {
      if (pedidoEditando) {
        await api.put(`/pedidos/${pedidoEditando}`, {
          ...datos,
          estado: pedidoForm.estado || "pendiente"
        });
        mostrarMensaje("Pedido actualizado correctamente.");
      } else {
        await api.post("/pedidos", datos);
        mostrarMensaje("Pedido registrado correctamente.");
      }

      setPedidoForm({
        cliente_id: "",
        direccion_entrega: "",
        descripcion: "",
        fecha_entrega: "",
        observaciones: ""
      });
      setPedidoEditando(null);
      await cargarDatos();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.mensaje || "No se pudo guardar el pedido.");
    }
  }

  function prepararEdicionPedido(pedido) {
    setPedidoEditando(pedido.id);
    setPedidoForm({
      cliente_id: pedido.cliente_id || "",
      direccion_entrega: pedido.direccion_entrega || "",
      descripcion: pedido.descripcion || "",
      fecha_entrega: pedido.fecha_entrega
        ? pedido.fecha_entrega.slice(0, 16)
        : "",
      observaciones: pedido.observaciones || "",
      estado: pedido.estado || "pendiente"
    });
    setSeccion("pedidos");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function eliminarPedido(id) {
    if (!window.confirm("¿Deseas eliminar este pedido?")) return;

    try {
      await api.delete(`/pedidos/${id}`);
      mostrarMensaje("Pedido eliminado correctamente.");
      await cargarDatos();
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo eliminar el pedido.");
    }
  }

  const pendientes = pedidos.filter(p => p.estado === "pendiente").length;
  const enRuta = pedidos.filter(p => p.estado === "en_ruta").length;
  const entregados = pedidos.filter(p => p.estado === "entregado").length;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">R</div>
          <div>
            <h2>RutaSmart</h2>
            <span>Gestión logística</span>
          </div>
        </div>

        <p className="menu-label">MENÚ PRINCIPAL</p>

        <button
          className={seccion === "inicio" ? "nav-item active" : "nav-item"}
          onClick={() => setSeccion("inicio")}
        >
          <span>▦</span> Panel principal
        </button>

        <button
          className={seccion === "clientes" ? "nav-item active" : "nav-item"}
          onClick={() => setSeccion("clientes")}
        >
          <span>♙</span> Clientes
        </button>

        <button
          className={seccion === "pedidos" ? "nav-item active" : "nav-item"}
          onClick={() => setSeccion("pedidos")}
        >
          <span>▤</span> Pedidos
        </button>

        <div className="sidebar-footer">
          <span className="status-dot"></span>
          Sistema conectado
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="breadcrumb">RutaSmart / </span>
            <strong>
              {seccion === "inicio" ? "Panel principal" :
               seccion === "clientes" ? "Gestión de clientes" : "Gestión de pedidos"}
            </strong>
          </div>
          <div className="user-info">
            <div className="user-avatar">RS</div>
            <span>Administrador</span>
          </div>
        </header>

        <section className="page-content">
          {mensaje && <div className="alert success">{mensaje}</div>}
          {error && <div className="alert error">{error}</div>}

          {seccion === "inicio" && (
            <>
              <div className="welcome">
                <div>
                  <span className="eyebrow">CENTRO DE OPERACIONES</span>
                  <h1>Bienvenido a RutaSmart</h1>
                  <p>Administra tus clientes y controla el estado de tus entregas.</p>
                </div>
                <div className="welcome-icon">🚚</div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-icon blue">♙</span>
                  <p>Total de clientes</p>
                  <h2>{clientes.length}</h2>
                  <small>Clientes registrados</small>
                </div>

                <div className="stat-card">
                  <span className="stat-icon orange">▤</span>
                  <p>Total de pedidos</p>
                  <h2>{pedidos.length}</h2>
                  <small>Pedidos registrados</small>
                </div>

                <div className="stat-card">
                  <span className="stat-icon yellow">◷</span>
                  <p>Pendientes</p>
                  <h2>{pendientes}</h2>
                  <small>Por gestionar</small>
                </div>

                <div className="stat-card">
                  <span className="stat-icon green">✓</span>
                  <p>Entregados</p>
                  <h2>{entregados}</h2>
                  <small>Pedidos completados</small>
                </div>
              </div>

              <div className="content-card">
                <div className="section-heading">
                  <div>
                    <h2>Actividad de pedidos</h2>
                    <p>Resumen del estado actual de las entregas.</p>
                  </div>
                  <button className="secondary-button" onClick={cargarDatos}>
                    ↻ Actualizar
                  </button>
                </div>

                <div className="progress-list">
                  <div>
                    <span>En ruta</span>
                    <strong>{enRuta}</strong>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill blue-fill"
                      style={{ width: `${pedidos.length ? enRuta / pedidos.length * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div>
                    <span>Pendientes</span>
                    <strong>{pendientes}</strong>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill orange-fill"
                      style={{ width: `${pedidos.length ? pendientes / pedidos.length * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div>
                    <span>Entregados</span>
                    <strong>{entregados}</strong>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill green-fill"
                      style={{ width: `${pedidos.length ? entregados / pedidos.length * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="quick-actions">
                <button onClick={() => setSeccion("clientes")}>＋ Registrar cliente</button>
                <button onClick={() => setSeccion("pedidos")}>＋ Registrar pedido</button>
              </div>
            </>
          )}

          {seccion === "clientes" && (
            <>
              <div className="page-heading">
                <div>
                  <h1>Clientes</h1>
                  <p>Registra y administra la información de tus clientes.</p>
                </div>
                <span className="record-count">{clientes.length} registros</span>
              </div>

              <div className="content-card">
                <h2>{clienteEditando ? "Editar cliente" : "Registrar nuevo cliente"}</h2>
                <form className="form-grid" onSubmit={guardarCliente}>
                  <label>
                    Nombre completo
                    <input
                      value={clienteForm.nombre}
                      onChange={e => setClienteForm({...clienteForm, nombre: e.target.value})}
                      placeholder="Nombre del cliente"
                      required
                    />
                  </label>

                  <label>
                    Teléfono
                    <input
                      value={clienteForm.telefono}
                      onChange={e => setClienteForm({...clienteForm, telefono: e.target.value})}
                      placeholder="Número de contacto"
                      required
                    />
                  </label>

                  <label className="full-field">
                    Correo electrónico
                    <input
                      type="email"
                      value={clienteForm.correo}
                      onChange={e => setClienteForm({...clienteForm, correo: e.target.value})}
                      placeholder="correo@ejemplo.com"
                    />
                  </label>

                  <div className="form-actions full-field">
                    <button className="primary-button" type="submit">
                      {clienteEditando ? "Guardar cambios" : "Registrar cliente"}
                    </button>
                    {clienteEditando && (
                      <button type="button" className="secondary-button" onClick={() => {
                        setClienteEditando(null);
                        setClienteForm({nombre:"", telefono:"", correo:""});
                      }}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="content-card">
                <div className="section-heading">
                  <div>
                    <h2>Directorio de clientes</h2>
                    <p>Información almacenada en PostgreSQL.</p>
                  </div>
                  <button className="secondary-button" onClick={cargarDatos}>↻ Actualizar</button>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Teléfono</th>
                        <th>Correo</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientes.map(cliente => (
                        <tr key={cliente.id}>
                          <td>#{cliente.id}</td>
                          <td><strong>{cliente.nombre}</strong></td>
                          <td>{cliente.telefono}</td>
                          <td>{cliente.correo || "—"}</td>
                          <td className="actions">
                            <button onClick={() => prepararEdicionCliente(cliente)}>Editar</button>
                            <button className="delete-button" onClick={() => eliminarCliente(cliente.id)}>Eliminar</button>
                          </td>
                        </tr>
                      ))}
                      {clientes.length === 0 && (
                        <tr><td colSpan="5" className="empty-state">No hay clientes registrados.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {seccion === "pedidos" && (
            <>
              <div className="page-heading">
                <div>
                  <h1>Pedidos</h1>
                  <p>Administra las solicitudes y sus datos de entrega.</p>
                </div>
                <span className="record-count">{pedidos.length} registros</span>
              </div>

              <div className="content-card">
                <h2>{pedidoEditando ? "Editar pedido" : "Registrar nuevo pedido"}</h2>
                <form className="form-grid" onSubmit={guardarPedido}>
                  <label>
                    Cliente
                    <select
                      value={pedidoForm.cliente_id}
                      onChange={e => setPedidoForm({...pedidoForm, cliente_id: e.target.value})}
                      required
                    >
                      <option value="">Selecciona un cliente</option>
                      {clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Fecha de entrega
                    <input
                      type="datetime-local"
                      value={pedidoForm.fecha_entrega}
                      onChange={e => setPedidoForm({...pedidoForm, fecha_entrega: e.target.value})}
                      required
                    />
                  </label>

                  <label className="full-field">
                    Dirección de entrega
                    <input
                      value={pedidoForm.direccion_entrega}
                      onChange={e => setPedidoForm({...pedidoForm, direccion_entrega: e.target.value})}
                      placeholder="Dirección completa"
                      required
                    />
                  </label>

                  <label className="full-field">
                    Descripción del pedido
                    <textarea
                      value={pedidoForm.descripcion}
                      onChange={e => setPedidoForm({...pedidoForm, descripcion: e.target.value})}
                      placeholder="Describe los productos o elementos del pedido"
                      required
                    />
                  </label>

                  <label className="full-field">
                    Observaciones
                    <textarea
                      value={pedidoForm.observaciones}
                      onChange={e => setPedidoForm({...pedidoForm, observaciones: e.target.value})}
                      placeholder="Información adicional (opcional)"
                    />
                  </label>

                  {pedidoEditando && (
                    <label>
                      Estado
                      <select
                        value={pedidoForm.estado || "pendiente"}
                        onChange={e => setPedidoForm({...pedidoForm, estado: e.target.value})}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="asignado">Asignado</option>
                        <option value="en_ruta">En ruta</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                        <option value="novedad">Novedad</option>
                      </select>
                    </label>
                  )}

                  <div className="form-actions full-field">
                    <button className="primary-button" type="submit">
                      {pedidoEditando ? "Guardar cambios" : "Registrar pedido"}
                    </button>
                    {pedidoEditando && (
                      <button type="button" className="secondary-button" onClick={() => {
                        setPedidoEditando(null);
                        setPedidoForm({cliente_id:"", direccion_entrega:"", descripcion:"", fecha_entrega:"", observaciones:""});
                      }}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="content-card">
                <div className="section-heading">
                  <div>
                    <h2>Listado de pedidos</h2>
                    <p>Seguimiento de los pedidos registrados.</p>
                  </div>
                  <button className="secondary-button" onClick={cargarDatos}>↻ Actualizar</button>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Dirección</th>
                        <th>Fecha de entrega</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidos.map(pedido => (
                        <tr key={pedido.id}>
                          <td>#{pedido.id}</td>
                          <td><strong>{pedido.cliente || pedido.nombre_cliente || `Cliente ${pedido.cliente_id}`}</strong></td>
                          <td>{pedido.direccion_entrega}</td>
                          <td>{pedido.fecha_entrega ? new Date(pedido.fecha_entrega).toLocaleString() : "—"}</td>
                          <td><span className={`status-badge ${pedido.estado}`}>{(pedido.estado || "").replace("_", " ")}</span></td>
                          <td className="actions">
                            <button onClick={() => prepararEdicionPedido(pedido)}>Editar</button>
                            <button className="delete-button" onClick={() => eliminarPedido(pedido.id)}>Eliminar</button>
                          </td>
                        </tr>
                      ))}
                      {pedidos.length === 0 && (
                        <tr><td colSpan="6" className="empty-state">No hay pedidos registrados.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {cargando && <p className="loading-text">Actualizando información...</p>}
        </section>
      </main>
    </div>
  );
}

export default App;
