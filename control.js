// ==========================================================================
// CONFIGURACIÓN DE CRITERIOS DE ACCESO REQUERIDOS
// ==========================================================================
const CORREO_ADMIN_FIJO = "admin@copaci.com";
const CORREO_COPACI_FIJA = "comite@copaci.com";
const CLAVE_ADMIN_FIJA = "admin123";
const CLAVE_COPACI_FIJA = "copaci2026";

class SistemaAutenticacion {
    constructor() {
        this.usuarioActivo = null;
        this.rolActivo = null;
        const vecinosGuardados = localStorage.getItem('vecinos_registrados');
        this.vecinos = vecinosGuardados ? JSON.parse(vecinosGuardados) : [];
    }

    registrarVecino(nombre, direccion, correo, contrasena) {
        const existe = this.vecinos.find(v => v.correo === correo);
        if (existe) return { error: true, mensaje: "Este correo ya está registrado." };

        const nuevoVecino = { nombre, direccion, correo, contrasena };
        this.vecinos.push(nuevoVecino);
        localStorage.setItem('vecinos_registrados', JSON.stringify(this.vecinos));
        return { error: false, mensaje: "Registro exitoso." };
    }

    evaluarAcceso(correo, contrasena) {
        if (correo === CORREO_ADMIN_FIJO && contrasena === CLAVE_ADMIN_FIJA) {
            this.usuarioActivo = { nombre: "Administrador General", id: "ADMIN-01", direccion: "Oficina Central COPACI" };
            this.rolActivo = "admin";
        } else if (correo === CORREO_COPACI_FIJA && contrasena === CLAVE_COPACI_FIJA) {
            this.usuarioActivo = { nombre: "Mesa Directiva COPACI", id: "COPACI-01", direccion: "Módulo Vecinal" };
            this.rolActivo = "copaci";
        } else {
            const vecino = this.vecinos.find(v => v.correo === correo && v.contrasena === contrasena);
            if (vecino) {
                this.usuarioActivo = { nombre: vecino.nombre, id: `CIUD-${correo.slice(0,3).toUpperCase()}`, direccion: vecino.direccion };
                this.rolActivo = "ciudadano";
            } else {
                this.rolActivo = null;
                return null;
            }
        }
        
        document.getElementById('sesion-status').innerText = `${this.usuarioActivo.nombre} (${this.rolActivo.toUpperCase()})`;
        return this.rolActivo;
    }
}
class SistemaSolicitudes {
    constructor() {
        const datosGuardados = localStorage.getItem('solicitudes_copaci');
        this.solicitudes = datosGuardados ? JSON.parse(datosGuardados) : [];
    }

    crearSolicitud(usuario, tipo, descripcion, direccion, detallesAdicionales = "") {
        const nuevaSolicitud = {
            idSolicitud: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
            usuarioId: usuario.id,
            ciudadano: usuario.nombre,
            tipo: tipo,
            descripcion: `${descripcion} ${detallesAdicionales ? '['+detallesAdicionales+']' : ''}`,
            direccion: direccion,
            estado: "Pendiente",
            fecha: new Date().toLocaleDateString()
        };
        this.solicitudes.push(nuevaSolicitud);
        localStorage.setItem('solicitudes_copaci', JSON.stringify(this.solicitudes));
        return nuevaSolicitud;
    }

    cambiarEstado(id) {
        const reporte = this.solicitudes.find(s => s.idSolicitud === id);
        if (reporte) {
            reporte.estado = reporte.estado === "Pendiente" ? "Atendido" : "Pendiente";
            localStorage.setItem('solicitudes_copaci', JSON.stringify(this.solicitudes));
        }
    }
}

const auth = new SistemaAutenticacion();
const operaciones = new SistemaSolicitudes();
// ==========================================================================
// CONTROLADORES DE INTERFAZ GRÁFICA (UI EVENT HANDLERS)
// ==========================================================================
function abrirModalLogin() { document.getElementById('modalLogin').classList.add('active'); }
function cerrarModalLogin() { document.getElementById('modalLogin').classList.remove('active'); document.getElementById('formLogin').reset(); }

function abrirModalRegistro() { document.getElementById('modalRegistro').classList.add('active'); }
function cerrarModalRegistro() { document.getElementById('modalRegistro').classList.remove('active'); document.getElementById('formRegistro').reset(); }

function abrirModalReporte() { 
    document.getElementById('modalReporte').classList.add('active'); 
    adaptarFormularioReporte();
}
function cerrarModalReporte() { document.getElementById('modalReporte').classList.remove('active'); document.getElementById('formSolicitud').reset(); }

function adaptarFormularioReporte() {
    const tipo = document.getElementById('tipoReporte').value;
    const grupoGravedad = document.getElementById('grupo-gravedad');
    const grupoEntreCalles = document.getElementById('grupo-entre-calles');
    
    if (tipo === "Bacheo") {
        if(grupoGravedad) grupoGravedad.classList.remove('hidden');
        if(grupoEntreCalles) grupoEntreCalles.classList.add('hidden');
    } else if (tipo === "Luminaria") {
        if(grupoGravedad) grupoGravedad.classList.add('hidden');
        if(grupoEntreCalles) grupoEntreCalles.classList.remove('hidden');
    } else {
        if(grupoGravedad) grupoGravedad.classList.add('hidden');
        if(grupoEntreCalles) grupoEntreCalles.classList.add('hidden');
    }
}

function alternarVisibilidadPassword(idInput, boton) {
    const inputContrasena = document.getElementById(idInput);
    if (inputContrasena.type === "password") {
        inputContrasena.type = "text";
        boton.innerHTML = `
            <svg class="ojo-icono" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        `;
    } else {
        inputContrasena.type = "password";
        boton.innerHTML = `
            <svg class="ojo-icono" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
    }
}

function abrirModalConstancia() {
    document.getElementById('modalConstancia').classList.add('active');
    document.getElementById('constCalle').value = auth.usuarioActivo.direccion;
}

function cerrarModalConstanciaForm() {
    document.getElementById('modalConstancia').classList.remove('active');
    document.getElementById('formConstancia').reset();
}

function procesarFormularioConstancia(event) {
    event.preventDefault();
    const calleModificada = document.getElementById('constCalle').value;
    const motivoSeleccionado = document.getElementById('constMotivo').value;
    
    const folioUnico = `CONST-${Math.floor(10000 + Math.random() * 90000)}`;
    const fechaActual = new Date().toLocaleDateString();
    
    document.getElementById('comp-folio').innerText = folioUnico;
    document.getElementById('comp-nombre').innerText = auth.usuarioActivo.nombre;
    document.getElementById('comp-direccion').innerText = calleModificada;
    document.getElementById('comp-fecha').innerText = fechaActual;
    document.getElementById('comp-motivo').innerText = motivoSeleccionado;
    
    operaciones.crearSolicitud(auth.usuarioActivo, "Constancia Residencial", `Trámite de Constancia Domiciliaria. Motivo: ${motivoSeleccionado}`, calleModificada);
    
    cerrarModalConstanciaForm();
    document.getElementById('contenedor-comprobante').classList.remove('hidden');
    filtrarYMostrarTabla();
    alert("¡Comprobante de Constancia generado con éxito!");
}

function procesarRegistro(event) {
    event.preventDefault();
    const nombre = document.getElementById('regNombre').value;
    const direccion = document.getElementById('regDireccion').value;
    const correo = document.getElementById('regCorreo').value;
    const contrasena = document.getElementById('regContrasena').value;

    const resultado = auth.registrarVecino(nombre, direccion, correo, contrasena);
    alert(resultado.mensaje);
    if (!resultado.error) cerrarModalRegistro();
}

function procesarLogin(event) {
    event.preventDefault();
    const usuario = document.getElementById('loginUsuario').value;
    const clave = document.getElementById('loginContrasena').value;
    const rol = auth.evaluarAcceso(usuario, clave);
    
    if (rol) {
        configurarVistaPorRol(rol);
        cerrarModalLogin();
    } else {
        alert("Credenciales incorrectas.");
    }
}

function configurarVistaPorRol(rol) {
    document.getElementById('contenedor-servicios').classList.remove('hidden');
    document.getElementById('contenedor-tabla').classList.remove('hidden');
    document.getElementById('zona-login-principal').classList.add('hidden');
    document.getElementById('navegacion-principal').classList.remove('hidden');
    
    const tituloTabla = document.getElementById('titulo-tabla-dinamico');
    if (rol === "ciudadano") {
        tituloTabla.innerText = "Mis Reportes y Trámites Enviados";
    } else {
        tituloTabla.innerText = (rol === "admin") ? "Panel de Gestión Administrativa (Gubernamental)" : "Monitor de Seguimiento - Comité COPACI";
    }
    filtrarYMostrarTabla();
}

function procesarFormulario(event) {
    event.preventDefault();
    const tipo = document.getElementById('tipoReporte').value;
    const descripcion = document.getElementById('descReporte').value;
    const direccion = document.getElementById('dirReporte').value;
    
    let detallesExtra = "";
    if (tipo === "Bacheo") {
        detallesExtra = "Gravedad: " + document.getElementById('gravedadBacheo').value;
    } else if (tipo === "Luminaria") {
        detallesExtra = "Entre calles: " + document.getElementById('entreCalles').value;
    }

    operaciones.crearSolicitud(auth.usuarioActivo, tipo, descripcion, direccion, detallesExtra);
    filtrarYMostrarTabla();
    cerrarModalReporte();
}

function administrarEstado(idFolio) {
    operaciones.cambiarEstado(idFolio);
    filtrarYMostrarTabla();
}

function filtrarYMostrarTabla() {
    const filter = document.getElementById('filtroEstado').value;
    const tbody = document.getElementById('tabla-solicitudes-body');
    if (!tbody) return;
    tbody.innerHTML = "";

    document.querySelectorAll('.col-gestion-admin').forEach(col => {
        col.style.display = (auth.rolActivo === "ciudadano") ? "none" : "table-cell";
    });

    operaciones.solicitudes.forEach(reporte => {
        if (auth.rolActivo === "ciudadano" && reporte.usuarioId !== auth.usuarioActivo.id) return;
        if (filter !== "Todos" && reporte.estado !== filter) return;

        const claseBadge = reporte.estado === "Pendiente" ? "badge-pendiente" : "badge-atendido";
        const textoBoton = reporte.estado === "Pendiente" ? "Resolver" : "Reabrir";
        const fila = document.createElement('tr');
        
        let celdaAccion = auth.rolActivo !== "ciudadano" 
            ? `<td><button class="btn-action" onclick="administrarEstado('${reporte.idSolicitud}')">${textoBoton}</button></td>` 
            : `<td style="display:none;"></td>`;

        fila.innerHTML = `
            <td><strong>${reporte.idSolicitud}</strong></td>
            <td>${reporte.ciudadano}</td>
            <td>${reporte.tipo}</td>
            <td>${reporte.descripcion}</td>
            <td>${reporte.direccion}</td>
            <td><span class="badge ${claseBadge}">${reporte.estado}</span></td>
            <td>${reporte.fecha}</td>
            ${celdaAccion}
        `;
        tbody.appendChild(fila);
    });
      }
