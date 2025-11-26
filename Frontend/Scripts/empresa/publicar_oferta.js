// publicar_oferta.js
console.log('Script de Publicar Oferta cargado.');

const API_URL = 'http://127.0.0.1:8000'; // Raíz del API
const ENDPOINT_CREAR_OFERTA = `${API_URL}/api/CrearOfertas`;

document.addEventListener('DOMContentLoaded', function() {
    // 1. Obtener datos de la Empresa desde localStorage
    const idEmpresa = localStorage.getItem('empresa_id');
    const cuitEmpresa = localStorage.getItem('empresa_cuit'); // ⬅️ Asumimos que esta clave existe
    const nombreEmpresa = localStorage.getItem('empresa_nombre') || 'Empresa No Encontrada';

    const form = document.getElementById('formPublicarOferta');
    const btnPublicar = document.getElementById('btnPublicar');
    const empresaDisplay = document.getElementById('empresa_display');
    const cuitDisplay = document.getElementById('cuit_empresa'); // ⬅️ Nuevo ID para el CUIT
    
    // 🛑 CRÍTICO: Verificar sesión y poblar datos
    if (!idEmpresa || localStorage.getItem('empresa_logueada') !== 'true') {
        mostrarNotificacion('Sesión expirada. Por favor, vuelve a iniciar sesión.', 'error');
        setTimeout(() => { window.location.href = '../../pages/pages_empresas/login_empresa.html'; }, 1500);
        return;
    }
    
    // Poblar los campos de solo lectura
    if (empresaDisplay) {
        empresaDisplay.value = nombreEmpresa;
    }
    if (cuitDisplay) {
        // Aseguramos que el CUIT se muestre y que sea la clave correcta
        cuitDisplay.value = cuitEmpresa || 'No Disponible';
    }


    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault(); 
            
            // 2. Validación de todos los campos del formulario
            if (!validarFormulario(form)) {
                mostrarNotificacion('Por favor, completa y corrige todos los campos obligatorios.', 'error');
                return;
            }

            btnPublicar.disabled = true;
            const textoOriginal = btnPublicar.innerHTML;
            btnPublicar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';
            
            // 3. Crear el objeto de datos
            const datosOferta = crearObjetoOferta(form);
            
            // 4. Llamar al endpoint de la API
            await enviarOferta(datosOferta, cuitEmpresa, btnPublicar, textoOriginal);
        });
    }
    
    // Inicializar evento de logout (basado en el HTML)
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm('¿Estás seguro que quieres cerrar sesión?')) {
                localStorage.clear();
                window.location.href = './login_empresa.html';
            }
        });
    }

});

// ===============================================
// LÓGICA DE NEGOCIO Y API
// ===============================================

// Función auxiliar para convertir el texto de textarea a una lista (array)
function textToList(id, form) {
    const textarea = form.querySelector(`#${id}`);
    if (!textarea || !textarea.value.trim()) return [];
    
    // Separa el texto por saltos de línea (\n) y filtra las líneas vacías
    return textarea.value.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);
}

function crearObjetoOferta(form) {
    // FUNCIÓN PARA RECOPILAR DATOS DEL FORMULARIO Y CREAR EL OBJETO JSON
    
    return {
        // Mapeo de campos requeridos por la API
        id_oferta: 0, // Valor placeholder, asumimos que la API lo asigna
        nombre_puesto: form.querySelector('#nombre_puesto').value.trim(),
        descripcion_puesto: form.querySelector('#descripcion_puesto').value.trim(), 
        
        // Rangos salariales (campos ocultos requeridos por la API)
        rango_salarial_min: parseFloat(form.querySelector('#rango_salarial_min').value) || 0,
        rango_salarial_max: parseFloat(form.querySelector('#rango_salarial_max').value) || 0,
        
        // Jornada/Modalidad
        jornada: form.querySelector('#jornada').value,
        ubicacion: form.querySelector('#ubicacion').value.trim(),
        
        // 🛑 CRÍTICO: Conversión de textarea a List[str]
        requisitos: textToList('requisitos', form), 
        beneficios: textToList('beneficios', form) 
    };
}

async function enviarOferta(datos, cuit, btn, textoOriginal) {
    // La API requiere el CUIT como Query Parameter
    const finalEndpoint = `${ENDPOINT_CREAR_OFERTA}?cuit=${cuit}`;
    
    if (!cuit) {
        mostrarNotificacion('Error: CUIT de la empresa no encontrado. Inicie sesión de nuevo.', 'error');
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
        return;
    }

    try {
        const response = await fetch(finalEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        });

        const resultado = await response.json();

        if (response.ok) {
            mostrarNotificacion('¡Oferta publicada con éxito!', 'success');
            document.getElementById('formPublicarOferta').reset();
            
        } else {
            const mensaje = resultado.detail || resultado.message || 'Error al publicar la oferta. Verifique el formato.';
            mostrarNotificacion(mensaje, 'error');
        }
    } catch (error) {
        console.error('Error al enviar la oferta:', error);
        mostrarNotificacion('Error de conexión con el servidor. Intente más tarde.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = textoOriginal;
    }
}

// ===============================================
// UTILIDADES Y VALIDACIÓN
// ===============================================

function validarFormulario(form) {
    let esValido = true;
    const inputsObligatorios = form.querySelectorAll('[required]');
    
    // 1. Validar campos de texto y select
    inputsObligatorios.forEach(input => {
        // Validación básica de campos vacíos
        if (!input.value.trim() || input.value === "Seleccionar") {
            input.classList.add('error');
            esValido = false;
        } else {
            input.classList.remove('error');
        }
        
        // 2. Validación de Vacantes (si estuviera visible)
        if (input.id === 'vacantes' && (parseInt(input.value) <= 0 || isNaN(parseInt(input.value)))) {
            input.classList.add('error');
            esValido = false;
        }
    });

    return esValido;
}

// Implementación placeholder para notificaciones
function mostrarNotificacion(mensaje, tipo) {
    const contenedor = document.getElementById('mensaje-contenedor'); // ID del contenedor en el HTML
    if (!contenedor) {
        console.warn('Contenedor de notificaciones no encontrado: #mensaje-contenedor');
        return;
    }

    // Limpiamos mensajes anteriores
    contenedor.innerHTML = ''; 

    if (tipo === 'clear' || !mensaje) {
        return;
    }

    const colorFondo = tipo === 'error' ? '#fee2e2' : '#d1fae5';
    const colorTexto = tipo === 'error' ? '#991b1b' : '#065f46';
    const bordeColor = tipo === 'error' ? '#ef4444' : '#10b981';

    contenedor.innerHTML = `
        <div style="padding: 12px 15px; border-left: 4px solid ${bordeColor}; background-color: ${colorFondo}; color: ${colorTexto}; border-radius: 6px; margin-bottom: 15px; font-weight: 500;">
            ${mensaje}
        </div>
    `;

    setTimeout(() => {
        contenedor.innerHTML = '';
    }, 5000);
}