// dashboard_candidato.js
console.log('Dashboard script cargado');

const API_URL = 'http://127.0.0.1:8000/api';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando dashboard...');
    
    // Verificar si el usuario está logueado
    const usuarioLogueado = sessionStorage.getItem('usuario_logueado');
    const usuarioEmail = sessionStorage.getItem('usuario_email');
    
    if (!usuarioLogueado) {
        console.log('Usuario no logueado, redirigiendo...');
        window.location.href = './login_candidato.html';
        return;
    }

    // Elementos del DOM
    const nombreUsuarioSpan = document.getElementById('nombreUsuario');
    const bannerNombre = document.querySelector('.banner-bienvenida h1');
    const btnLogout = document.getElementById('btnLogout');
    const ofertasGrid = document.getElementById('ofertasGrid');
    const postulacionesLista = document.getElementById('postulacionesLista');
    const formBuscador = document.querySelector('.buscador-formulario');
    
    // Cargar nombre del usuario del sessionStorage o usar uno por defecto
    const nombreUsuario = sessionStorage.getItem('usuario_nombre') || 'Usuario';
    if (nombreUsuarioSpan) {
        nombreUsuarioSpan.textContent = nombreUsuario;
    }
    if (bannerNombre) {
        bannerNombre.textContent = `¡Bienvenido, ${nombreUsuario}! 👋`;
    }
    
    // Inicializar avatar con iniciales
    const usuarioAvatar = document.querySelector('.usuario-avatar');
    if (usuarioAvatar && nombreUsuario) {
        const iniciales = nombreUsuario.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        usuarioAvatar.textContent = iniciales;
    }

    // Cargar datos iniciales
    cargarTodasOfertas();
    cargarEstadisticas();
    cargarPostulaciones();

    // Evento de logout
    if (btnLogout) {
        btnLogout.addEventListener('click', function() {
            if (confirm('¿Estás seguro que querés cerrar sesión?')) {
                sessionStorage.clear();
                mostrarNotificacion('Sesión cerrada exitosamente', 'success');
                setTimeout(() => {
                    window.location.href = './login_candidato.html';
                }, 1000);
            }
        });
    }

    // Buscador de ofertas
    if (formBuscador) {
        formBuscador.addEventListener('submit', function(e) {
            e.preventDefault();
            buscarOfertas();
        });
    }

    // Función para cargar todas las ofertas
    async function cargarTodasOfertas() {
        try {
            console.log('Cargando todas las ofertas...');
            const response = await fetch(`${API_URL}/ofertas/todas`);
            
            if (!response.ok) {
                throw new Error('Error al cargar ofertas');
            }

            const ofertas = await response.json();
            console.log('Ofertas recibidas:', ofertas);
            
            mostrarOfertas(ofertas);
        } catch (error) {
            console.error('Error al cargar ofertas:', error);
            ofertasGrid.innerHTML = `
                <div class="mensaje-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error al cargar las ofertas. Intentá nuevamente.</p>
                </div>
            `;
        }
    }

    // Función para mostrar ofertas en el grid
    function mostrarOfertas(ofertas) {
        if (!ofertas || ofertas.length === 0) {
            ofertasGrid.innerHTML = `
                <div class="mensaje-vacio">
                    <i class="fas fa-briefcase"></i>
                    <p>No hay ofertas disponibles en este momento.</p>
                </div>
            `;
            return;
        }

        ofertasGrid.innerHTML = ofertas.slice(0, 6).map(oferta => `
            <div class="oferta-card" data-id-oferta="${oferta.id_oferta}">
                <p class="oferta-empresa">${oferta.nombre_empresa || 'Empresa'}</p>
                <h3 class="oferta-titulo">${oferta.nombre_puesto}</h3>
                <div class="oferta-detalles">
                    <span class="oferta-detalle">
                        <i class="fas fa-map-marker-alt"></i>
                        ${oferta.ubicacion || 'No especificado'}
                    </span>
                    <span class="oferta-detalle">
                        <i class="fas fa-clock"></i>
                        ${oferta.jornada || 'Full-time'}
                    </span>
                    <span class="oferta-detalle">
                        <i class="fas fa-calendar"></i>
                        Hace ${calcularDiasPublicacion(oferta.fecha_publicacion)}
                    </span>
                </div>
                ${oferta.rango_salarial_min && oferta.rango_salarial_max ? `
                    <p class="oferta-salario">$${formatearNumero(oferta.rango_salarial_min)} - $${formatearNumero(oferta.rango_salarial_max)}</p>
                ` : '<p class="oferta-salario">Salario a convenir</p>'}
                <button class="btn-postular" data-id-oferta="${oferta.id_oferta}">
                    Postularme
                </button>
            </div>
        `).join('');

        // Agregar eventos a botones de postulación
        document.querySelectorAll('.btn-postular').forEach(btn => {
            btn.addEventListener('click', function() {
                const idOferta = this.getAttribute('data-id-oferta');
                abrirModalPostulacion(idOferta);
            });
        });
    }

    // Función para buscar ofertas con filtros
    async function buscarOfertas() {
        const busqueda = document.getElementById('inputBusqueda').value;
        const ubicacion = document.getElementById('filtroUbicacion').value;
        const jornada = document.getElementById('filtroJornada').value;

        try {
            const response = await fetch(`${API_URL}/ofertas/todas`);
            const todasOfertas = await response.json();

            // Filtrar ofertas
            const ofertasFiltradas = todasOfertas.filter(oferta => {
                const matchBusqueda = !busqueda || 
                    oferta.nombre_puesto.toLowerCase().includes(busqueda.toLowerCase()) ||
                    (oferta.nombre_empresa && oferta.nombre_empresa.toLowerCase().includes(busqueda.toLowerCase()));
                
                const matchUbicacion = !ubicacion || oferta.ubicacion === ubicacion;
                const matchJornada = !jornada || oferta.jornada === jornada;

                return matchBusqueda && matchUbicacion && matchJornada;
            });

            mostrarOfertas(ofertasFiltradas);
            
            if (ofertasFiltradas.length === 0) {
                mostrarNotificacion('No se encontraron ofertas con esos criterios', 'info');
            }
        } catch (error) {
            console.error('Error al buscar ofertas:', error);
            mostrarNotificacion('Error al realizar la búsqueda', 'error');
        }
    }

    // Función para abrir modal de postulación
    function abrirModalPostulacion(idOferta) {
        // Crear modal dinámicamente
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-postulacion">
                <button class="modal-cerrar">&times;</button>
                <h2><i class="fas fa-file-alt"></i> Postulación</h2>
                <form id="formPostulacion">
                    <div class="campo-grupo">
                        <label for="nombre">Nombre completo *</label>
                        <input type="text" id="nombre" required>
                    </div>
                    
                    <div class="campo-grupo">
                        <label for="email">Email *</label>
                        <input type="email" id="email" value="${usuarioEmail}" required>
                    </div>
                    
                    <div class="campo-grupo">
                        <label for="telefono">Teléfono *</label>
                        <input type="tel" id="telefono" required placeholder="+54 9 11 1234-5678">
                    </div>
                    
                    <div class="campo-grupo">
                        <label for="salario">Salario mínimo esperado ($) *</label>
                        <input type="number" id="salario" required placeholder="500000">
                    </div>
                    
                    <div class="campo-grupo">
                        <label for="jornada">Jornada disponible *</label>
                        <select id="jornada" required>
                            <option value="">Seleccionar...</option>
                            <option value="full-time">Full-time</option>
                            <option value="part-time">Part-time</option>
                        </select>
                    </div>
                    
                    <div class="campo-grupo">
                        <label for="titulos">Títulos (separados por coma)</label>
                        <input type="text" id="titulos" placeholder="Ej: Lic. en Sistemas, MBA">
                    </div>
                    
                    <div class="campo-grupo">
                        <label>Habilidades</label>
                        <div id="habilidadesContainer">
                            <div class="habilidad-item">
                                <input type="text" placeholder="Nombre habilidad" class="habilidad-nombre">
                                <select class="habilidad-nivel">
                                    <option value="1">1 - Básico</option>
                                    <option value="2">2 - Intermedio bajo</option>
                                    <option value="3" selected>3 - Intermedio</option>
                                    <option value="4">4 - Avanzado</option>
                                    <option value="5">5 - Experto</option>
                                </select>
                            </div>
                        </div>
                        <button type="button" class="btn-agregar-habilidad">+ Agregar habilidad</button>
                    </div>
                    
                    <div class="modal-botones">
                        <button type="button" class="btn-cancelar">Cancelar</button>
                        <button type="submit" class="btn-enviar-postulacion">
                            <i class="fas fa-paper-plane"></i> Enviar postulación
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Eventos del modal
        const btnCerrar = modal.querySelector('.modal-cerrar');
        const btnCancelar = modal.querySelector('.btn-cancelar');
        const btnAgregarHabilidad = modal.querySelector('.btn-agregar-habilidad');
        const formPostulacion = modal.querySelector('#formPostulacion');

        btnCerrar.addEventListener('click', () => modal.remove());
        btnCancelar.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Agregar más habilidades
        btnAgregarHabilidad.addEventListener('click', function() {
            const container = document.getElementById('habilidadesContainer');
            const nuevaHabilidad = document.createElement('div');
            nuevaHabilidad.className = 'habilidad-item';
            nuevaHabilidad.innerHTML = `
                <input type="text" placeholder="Nombre habilidad" class="habilidad-nombre">
                <select class="habilidad-nivel">
                    <option value="1">1 - Básico</option>
                    <option value="2">2 - Intermedio bajo</option>
                    <option value="3" selected>3 - Intermedio</option>
                    <option value="4">4 - Avanzado</option>
                    <option value="5">5 - Experto</option>
                </select>
                <button type="button" class="btn-eliminar-habilidad">×</button>
            `;
            container.appendChild(nuevaHabilidad);

            // Evento para eliminar
            nuevaHabilidad.querySelector('.btn-eliminar-habilidad').addEventListener('click', function() {
                nuevaHabilidad.remove();
            });
        });

        // Enviar postulación
        formPostulacion.addEventListener('submit', async function(e) {
            e.preventDefault();
            await enviarPostulacion(idOferta, modal);
        });
    }

    // Función para enviar postulación
    async function enviarPostulacion(idOferta, modal) {
        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const telefono = document.getElementById('telefono').value;
        const salario = parseFloat(document.getElementById('salario').value);
        const jornada = document.getElementById('jornada').value;
        const titulosInput = document.getElementById('titulos').value;
        
        // Procesar títulos
        const titulos = titulosInput 
            ? titulosInput.split(',').map(t => t.trim()).filter(t => t)
            : [];

        // Procesar habilidades
        const habilidadesItems = document.querySelectorAll('.habilidad-item');
        const habilidades = Array.from(habilidadesItems)
            .map(item => {
                const nombreHab = item.querySelector('.habilidad-nombre').value.trim();
                const nivel = parseInt(item.querySelector('.habilidad-nivel').value);
                return nombreHab ? { nombre: nombreHab, nivel } : null;
            })
            .filter(h => h !== null);

        const datos = {
            nombre,
            email,
            telefono,
            salario_minimo: salario,
            jornada_disponible: jornada,
            titulos,
            habilidades
        };

        console.log('Enviando postulación:', datos);

        try {
            const btnEnviar = modal.querySelector('.btn-enviar-postulacion');
            btnEnviar.disabled = true;
            btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

            const response = await fetch(`${API_URL}/postulacion/oferta/${idOferta}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos)
            });

            if (!response.ok) {
                throw new Error('Error al enviar postulación');
            }

            const resultado = await response.json();
            console.log('Postulación exitosa:', resultado);

            mostrarNotificacion('¡Postulación enviada exitosamente!', 'success');
            modal.remove();
            
            // Recargar estadísticas y postulaciones
            cargarEstadisticas();
            cargarPostulaciones();
            
        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion('Error al enviar la postulación. Intentá nuevamente.', 'error');
            const btnEnviar = modal.querySelector('.btn-enviar-postulacion');
            btnEnviar.disabled = false;
            btnEnviar.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar postulación';
        }
    }

    // Función para cargar estadísticas (simulado)
    function cargarEstadisticas() {
        // Como no tenés un endpoint específico para estadísticas del usuario,
        // estas serán valores por defecto. Cuando tengas el endpoint, lo conectás aquí
        const stats = {
            totalPostulaciones: 12,
            enRevision: 3,
            perfilCompletado: 85
        };

        document.getElementById('totalPostulaciones').textContent = stats.totalPostulaciones;
        document.getElementById('enRevision').textContent = stats.enRevision;
        document.getElementById('perfilCompletado').textContent = stats.perfilCompletado + '%';
    }

    // Función para cargar postulaciones (simulado)
    function cargarPostulaciones() {
        // Postulaciones de ejemplo
        // Cuando tengas un endpoint para obtener postulaciones por usuario, lo conectás aquí
        const postulaciones = [
            { titulo: 'Desarrollador Backend', empresa: 'MercadoLibre', dias: 2, estado: 'revision' },
            { titulo: 'QA Tester', empresa: 'Globant', dias: 5, estado: 'preseleccionado' },
            { titulo: 'Full Stack Developer', empresa: 'Despegar', dias: 7, estado: 'revision' }
        ];

        postulacionesLista.innerHTML = postulaciones.map(p => `
            <div class="postulacion-item">
                <div class="postulacion-info">
                    <h4>${p.titulo}</h4>
                    <p>${p.empresa} • Hace ${p.dias} ${p.dias === 1 ? 'día' : 'días'}</p>
                </div>
                <span class="badge ${p.estado}">
                    ${p.estado === 'revision' ? '⏳ En revisión' : '✅ Preseleccionado'}
                </span>
            </div>
        `).join('');
    }

    // Utilidades
    function calcularDiasPublicacion(fecha) {
        if (!fecha) return 'Reciente';
        const hoy = new Date();
        const fechaPub = new Date(fecha);
        const diff = Math.floor((hoy - fechaPub) / (1000 * 60 * 60 * 24));
        
        if (diff === 0) return 'hoy';
        if (diff === 1) return '1 día';
        if (diff < 7) return `${diff} días`;
        if (diff < 30) return `${Math.floor(diff / 7)} semanas`;
        return `${Math.floor(diff / 30)} meses`;
    }

    function formatearNumero(numero) {
        return new Intl.NumberFormat('es-AR').format(numero);
    }

    function mostrarNotificacion(mensaje, tipo) {
        const notifAnterior = document.querySelector('.notificacion');
        if (notifAnterior) {
            notifAnterior.remove();
        }

        const notificacion = document.createElement('div');
        notificacion.className = `notificacion ${tipo}`;
        
        let icono = 'info-circle';
        if (tipo === 'success') icono = 'check-circle';
        if (tipo === 'error') icono = 'exclamation-circle';
        
        notificacion.innerHTML = `
            <i class="fas fa-${icono}"></i>
            <span>${mensaje}</span>
        `;

        document.body.appendChild(notificacion);

        setTimeout(() => {
            notificacion.classList.add('ocultar');
            setTimeout(() => notificacion.remove(), 300);
        }, 4000);
    }

    console.log('Dashboard inicializado correctamente');
});