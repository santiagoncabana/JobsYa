// register_empresa.js
console.log('Script de registro de empresa cargado');

const API_URL = 'http://127.0.0.1:8000/auth'; // Raíz del API, la ruta es /register_empresa

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM completamente cargado.');
    
    const form = document.getElementById('formRegistroEmpresa');
    const btnRegistro = document.getElementById('btnRegistro');
    
    // 1. Mapeo de Inputs (CRÍTICO: Asegúrate de que estos IDs coincidan con tu HTML)
    const inputs = {
        nombre: document.getElementById('nombre'),
        cuit: document.getElementById('cuit'),
        email: document.getElementById('email'),
        contrasena: document.getElementById('contrasena'), // Solo un campo de contraseña
        terminos: document.getElementById('aceptoTerminos')
    };
    
    // Diagnóstico: Verificar si todos los elementos existen (Si alguno es 'null', el script falla)
    console.log("Estado de Inputs:", Object.keys(inputs).map(key => ({ [key]: inputs[key] ? 'OK' : 'FALLÓ' })));


    // Toggle de Contraseña
    document.querySelectorAll('.toggle-contrasena').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            this.querySelector('i').className = isPassword ? 'fas fa-eye' : 'fas fa-eye-slash';
        });
    });

    // ===================================
    // Evento de Envío del Formulario
    // ===================================
    form.addEventListener('submit', async function(e) {
        console.log("Evento SUBMIT detectado.");
        e.preventDefault(); // 🛑 CRÍTICO: Detiene la recarga de la página
        console.log("Envío detenido. Iniciando validación.");

        // Limpiar errores de servidor (si los hubiera)
        mostrarNotificacion('', 'clear'); 

        // La validación ahora solo usa los campos disponibles
        if (!validarFormulario(inputs)) {
            console.log("Validación fallida en el cliente.");
            mostrarNotificacion('Por favor, completa y corrige todos los campos.', 'error');
            return;
        }

        btnRegistro.disabled = true;
        const textoOriginal = btnRegistro.innerHTML;
        btnRegistro.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';

        const datosRegistro = {
            nombre: inputs.nombre.value.trim(),
            cuit: inputs.cuit.value.trim().replace(/[^0-9]/g, ''), 
            email: inputs.email.value.trim(),
            contrasena: inputs.contrasena.value
        };
        
        console.log('Enviando datos a la API...');

        try {
            const response = await fetch(`${API_URL}/register_empresa`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosRegistro)
            });

            const resultado = await response.json();

            if (response.ok) {
                mostrarNotificacion('¡Empresa registrada exitosamente! Redirigiendo...', 'success');
                // Redirigir al login de la empresa después de un registro exitoso
                setTimeout(() => {
                    window.location.href = '../../pages/pages_empresas/login_empresa.html';
                }, 1500);
            } else {
                // Manejar errores de servidor (ej: CUIT/Email ya existen)
                const mensaje = resultado.detail || resultado.message || 'Error en el registro. Verificá los datos.';
                mostrarNotificacion(mensaje, 'error');
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            mostrarNotificacion('Error de conexión con el servidor. Intenta de nuevo.', 'error');
        } finally {
            btnRegistro.disabled = false;
            btnRegistro.innerHTML = textoOriginal;
        }
    });
    
    // Agregar event listeners para limpiar errores al escribir
    Object.values(inputs).forEach(input => {
        if (input && input.type !== 'checkbox') {
            input.addEventListener('input', () => mostrarError(input, null));
        }
    });
});

// ===================================
// LÓGICA DE VALIDACIÓN Y UTILS
// ===================================

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarCuit(cuit) {
    // Debe tener 11 dígitos para ser un CUIT argentino estándar
    const cleanedCuit = cuit.replace(/[^0-9]/g, '');
    return cleanedCuit.length === 11; 
}

// 🛑 FUNCIÓN CRÍTICA DE VALIDACIÓN
function validarFormulario(inputs) {
    let esValido = true;
    
    // 1. Nombre
    if (!inputs.nombre.value.trim()) {
        mostrarError(inputs.nombre, 'El nombre es obligatorio.');
        esValido = false;
    }

    // 2. CUIT
    if (!inputs.cuit.value.trim() || !validarCuit(inputs.cuit.value)) {
        mostrarError(inputs.cuit, 'El CUIT debe tener 11 dígitos.');
        esValido = false;
    } else {
        mostrarError(inputs.cuit, null);
    }

    // 3. Email
    if (!inputs.email.value.trim() || !validarEmail(inputs.email.value)) {
        mostrarError(inputs.email, 'Ingresá un email válido.');
        esValido = false;
    } else {
        mostrarError(inputs.email, null);
    }

    // 4. Contraseña (Mínimo 6 caracteres)
    if (inputs.contrasena.value.length < 6) {
        mostrarError(inputs.contrasena, 'Mínimo 6 caracteres.');
        esValido = false;
    } else {
        mostrarError(inputs.contrasena, null);
    }
    
    // 5. Términos y Condiciones
    if (!inputs.terminos.checked) {
        mostrarNotificacion('Debes aceptar los Términos y Condiciones para registrarte.', 'error');
        esValido = false;
    }

    return esValido;
}


// Función mejorada para mostrar errores específicos por campo
function mostrarError(input, mensaje) {
    const grupo = input.closest('.campo-grupo');
    // Buscamos el div error-mensaje creado en el HTML
    let errorDiv = grupo.querySelector('.error-mensaje');
    
    // Nota: Hemos agregado el div error-mensaje en el HTML para el CUIT, Email y Contraseña.

    if (mensaje) {
        input.classList.add('error');
        if (errorDiv) {
             errorDiv.textContent = mensaje;
             errorDiv.style.display = 'block';
        }
    } else {
        input.classList.remove('error');
        if (errorDiv) {
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
        }
    }
}

// Función simple de notificaciones 
function mostrarNotificacion(mensaje, tipo) {
    const contenedor = document.getElementById('notificacion-contenedor');
    if (!contenedor) {
        console.warn("Contenedor de notificaciones no encontrado: #notificacion-contenedor");
        return;
    }
    
    if (tipo === 'clear') {
        contenedor.innerHTML = '';
        return;
    }

    const color = tipo === 'error' ? '#ef4444' : (tipo === 'success' ? '#10b981' : '#3b82f6');
    contenedor.innerHTML = `<div style="padding: 10px; margin-bottom: 10px; border-radius: 5px; color: white; background-color: ${color}; font-weight: 500;">${mensaje}</div>`;

    setTimeout(() => {
        contenedor.innerHTML = '';
    }, 4000);
}