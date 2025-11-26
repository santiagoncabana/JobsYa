// login_empresa.js
console.log('Script de login de empresa cargado');

const API_URL = 'http://127.0.0.1:8000'; 
const ENDPOINT_LOGIN = `${API_URL}/auth/login_empresa`; 

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formLoginEmpresa');
    const btnLogin = document.getElementById('btnLogin');
    const emailInput = document.getElementById('email');
    const contrasenaInput = document.getElementById('contrasena');
    const recordarmeCheckbox = document.getElementById('recordarme');

    // Cargar email guardado si existe
    const emailGuardado = localStorage.getItem('empresa_email_recordado');
    if (emailGuardado && emailInput) {
        emailInput.value = emailGuardado;
        recordarmeCheckbox.checked = true;
    }

    // Toggle mostrar/ocultar contraseña
    document.querySelectorAll('.toggle-contrasena').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            this.querySelector('i').className = isPassword ? 'fas fa-eye' : 'fas fa-eye-slash';
        });
    });

    // Evento de envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault(); 
        
        if (!validarFormulario()) {
            mostrarNotificacion('Por favor, completa los campos requeridos.', 'error');
            return;
        }

        btnLogin.disabled = true;
        const textoOriginal = btnLogin.innerHTML;
        btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ingresando...';

        const datosLogin = {
            email: emailInput.value.trim(),
            contrasena: contrasenaInput.value
        };

        try {
            const response = await fetch(ENDPOINT_LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosLogin)
            });

            const resultado = await response.json();

            if (response.ok) {
                mostrarNotificacion('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
                
                // ✅ GUARDAR DATOS EN FORMATO CORRECTO PARA EL DASHBOARD
                const empresaData = {
                    id_empresa: resultado.id_empresa || resultado.id_usuario || resultado.id || 0,
                    nombre: resultado.nombre_empresa || resultado.nombre || 'Empresa',
                    email: datosLogin.email,
                    cuit: resultado.cuit || ''
                };
                
                // Guardar como objeto JSON
                localStorage.setItem('empresa', JSON.stringify(empresaData));
                
                // También mantener compatibilidad con formato anterior (opcional)
                localStorage.setItem('empresa_logueada', 'true');
                localStorage.setItem('empresa_id', empresaData.id_empresa);
                localStorage.setItem('empresa_nombre', empresaData.nombre);
                localStorage.setItem('empresa_email', empresaData.email);
                localStorage.setItem('empresa_cuit', empresaData.cuit);

                // Guardar email para "Recordarme"
                if (recordarmeCheckbox.checked) {
                    localStorage.setItem('empresa_email_recordado', datosLogin.email);
                } else {
                    localStorage.removeItem('empresa_email_recordado');
                }

                // Redirigir al dashboard de la empresa
                setTimeout(() => {
                    window.location.href = '../../pages/pages_empresas/DASHBOARD_EMPRESA.HTML';
                }, 1000);
            } else {
                // Manejar errores de credenciales (401)
                const mensaje = resultado.detail || 'Credenciales incorrectas.';
                mostrarNotificacion(mensaje, 'error');
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            mostrarNotificacion('Error de conexión. Verifica que el servidor esté activo.', 'error');
        } finally {
            btnLogin.disabled = false;
            btnLogin.innerHTML = textoOriginal;
        }
    });
    
    // ===================================
    // Funciones Auxiliares
    // ===================================
    
    function validarFormulario() {
        return emailInput.value.trim() && contrasenaInput.value;
    }

    function mostrarNotificacion(mensaje, tipo) {
        const contenedor = document.getElementById('notificacion-contenedor');
        if (!contenedor) return;

        const color = tipo === 'error' ? '#ef4444' : (tipo === 'success' ? '#10b981' : '#3b82f6');
        contenedor.innerHTML = `<div style="padding: 10px; margin-bottom: 10px; border-radius: 5px; color: white; background-color: ${color}; font-weight: 500;">${mensaje}</div>`;

        setTimeout(() => {
            contenedor.innerHTML = '';
        }, 4000);
    }
    
    // Limpieza de errores al escribir
    emailInput.addEventListener('input', () => emailInput.classList.remove('error'));
    contrasenaInput.addEventListener('input', () => contrasenaInput.classList.remove('error'));
});