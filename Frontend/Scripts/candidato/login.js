// register.js

document.addEventListener('DOMContentLoaded', () => {
    // ===== ELEMENTOS DEL DOM =====
    const form = document.querySelector('form');
    const nombreInput = document.getElementById('nombre');
    const apellidoInput = document.getElementById('apellido');
    const emailInput = document.getElementById('email');
    const contrasenaInput = document.getElementById('contrasena');
    const confirmarContrasenaInput = document.getElementById('confirmar-contrasena');
    const terminosCheckbox = document.getElementById('terminos');
    const botonRegistro = document.querySelector('.boton-registro');
    
    // Selector de tipo de usuario (candidato/empresa)
    const tiposOpciones = document.querySelectorAll('.tipo-opcion');
    let tipoUsuarioSeleccionado = 'candidato'; // Por defecto
    
    
    // ===== MANEJO DEL SELECTOR DE TIPO =====
    tiposOpciones.forEach(opcion => {
        opcion.addEventListener('click', () => {
            // Remover clase activo de todas
            tiposOpciones.forEach(o => o.classList.remove('activo'));
            
            // Agregar clase activo a la seleccionada
            opcion.classList.add('activo');
            
            // Determinar tipo seleccionado
            const texto = opcion.querySelector('span').textContent;
            tipoUsuarioSeleccionado = texto === 'Busco empleo' ? 'candidato' : 'empresa';
            
            console.log('Tipo seleccionado:', tipoUsuarioSeleccionado);
        });
    });
    
    
    // ===== VALIDACIÓN EN TIEMPO REAL =====
    
    // Validar email
    emailInput.addEventListener('blur', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            mostrarError(emailInput, 'Email inválido');
        } else {
            limpiarError(emailInput);
        }
    });
    
    // Validar contraseña
    contrasenaInput.addEventListener('blur', () => {
        if (contrasenaInput.value.length < 8) {
            mostrarError(contrasenaInput, 'La contraseña debe tener al menos 8 caracteres');
        } else {
            limpiarError(contrasenaInput);
        }
    });
    
    // Validar confirmación de contraseña
    confirmarContrasenaInput.addEventListener('blur', () => {
        if (confirmarContrasenaInput.value !== contrasenaInput.value) {
            mostrarError(confirmarContrasenaInput, 'Las contraseñas no coinciden');
        } else {
            limpiarError(confirmarContrasenaInput);
        }
    });
    
    
    // ===== SUBMIT DEL FORMULARIO =====
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Limpiar errores previos
        limpiarTodosLosErrores();
        
        // Validar campos
        if (!validarFormulario()) {
            return;
        }
        
        // Deshabilitar botón para evitar doble submit
        botonRegistro.disabled = true;
        botonRegistro.textContent = 'Creando cuenta...';
        
        // Preparar datos
        const datosUsuario = {
            email: emailInput.value.trim(),
            contrasena: contrasenaInput.value,
            nombre: nombreInput.value.trim(),
            apellido: apellidoInput.value.trim()
        };
        
        try {
            // Llamar al endpoint de registro
            const response = await fetch('http://localhost:8000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosUsuario)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Registro exitoso
                mostrarExito('¡Cuenta creada exitosamente!');
                
                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    window.location.href = './login_candidato.html';
                }, 2000);
                
            } else {
                // Error del servidor
                mostrarErrorGeneral(data.detail || 'Error al crear la cuenta');
                botonRegistro.disabled = false;
                botonRegistro.textContent = 'Crear mi cuenta';
            }
            
        } catch (error) {
            console.error('Error:', error);
            mostrarErrorGeneral('Error de conexión. Intenta nuevamente.');
            botonRegistro.disabled = false;
            botonRegistro.textContent = 'Crear mi cuenta';
        }
    });
    
    
    // ===== FUNCIONES DE VALIDACIÓN =====
    
    function validarFormulario() {
        let esValido = true;
        
        // Validar nombre
        if (nombreInput.value.trim() === '') {
            mostrarError(nombreInput, 'El nombre es obligatorio');
            esValido = false;
        }
        
        // Validar apellido
        if (apellidoInput.value.trim() === '') {
            mostrarError(apellidoInput, 'El apellido es obligatorio');
            esValido = false;
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            mostrarError(emailInput, 'Email inválido');
            esValido = false;
        }
        
        // Validar contraseña
        if (contrasenaInput.value.length < 8) {
            mostrarError(contrasenaInput, 'La contraseña debe tener al menos 8 caracteres');
            esValido = false;
        }
        
        // Validar confirmación
        if (confirmarContrasenaInput.value !== contrasenaInput.value) {
            mostrarError(confirmarContrasenaInput, 'Las contraseñas no coinciden');
            esValido = false;
        }
        
        // Validar términos
        if (!terminosCheckbox.checked) {
            mostrarErrorGeneral('Debes aceptar los términos y condiciones');
            esValido = false;
        }
        
        return esValido;
    }
    
    
    // ===== FUNCIONES DE UI =====
    
    function mostrarError(input, mensaje) {
        const campoGrupo = input.closest('.campo-grupo') || input.closest('.campo-icono').parentElement;
        
        // Remover error previo si existe
        const errorPrevio = campoGrupo.querySelector('.mensaje-error');
        if (errorPrevio) {
            errorPrevio.remove();
        }
        
        // Agregar borde rojo
        const campoInput = input.classList.contains('campo-input') ? input : input.querySelector('.campo-input');
        if (campoInput) {
            campoInput.style.borderColor = '#ef4444';
        }
        
        // Crear mensaje de error
        const mensajeError = document.createElement('span');
        mensajeError.className = 'mensaje-error';
        mensajeError.textContent = mensaje;
        mensajeError.style.color = '#ef4444';
        mensajeError.style.fontSize = '0.85rem';
        mensajeError.style.marginTop = '5px';
        mensajeError.style.display = 'block';
        
        campoGrupo.appendChild(mensajeError);
    }
    
    function limpiarError(input) {
        const campoGrupo = input.closest('.campo-grupo') || input.closest('.campo-icono').parentElement;
        
        // Remover mensaje de error
        const errorMsg = campoGrupo.querySelector('.mensaje-error');
        if (errorMsg) {
            errorMsg.remove();
        }
        
        // Restaurar borde normal
        const campoInput = input.classList.contains('campo-input') ? input : input.querySelector('.campo-input');
        if (campoInput) {
            campoInput.style.borderColor = '#e2e8f0';
        }
    }
    
    function limpiarTodosLosErrores() {
        document.querySelectorAll('.mensaje-error').forEach(error => error.remove());
        document.querySelectorAll('.campo-input').forEach(input => {
            input.style.borderColor = '#e2e8f0';
        });
        
        // Remover alerta general si existe
        const alertaGeneral = document.querySelector('.alerta-general');
        if (alertaGeneral) {
            alertaGeneral.remove();
        }
    }
    
    function mostrarErrorGeneral(mensaje) {
        // Remover alerta previa
        const alertaPrevia = document.querySelector('.alerta-general');
        if (alertaPrevia) {
            alertaPrevia.remove();
        }
        
        const alerta = document.createElement('div');
        alerta.className = 'alerta-general';
        alerta.textContent = mensaje;
        alerta.style.cssText = `
            background: #fee2e2;
            color: #991b1b;
            padding: 12px 16px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-size: 0.9rem;
            border-left: 4px solid #ef4444;
        `;
        
        form.insertBefore(alerta, form.firstChild);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => alerta.remove(), 5000);
    }
    
    function mostrarExito(mensaje) {
        const alerta = document.createElement('div');
        alerta.className = 'alerta-exito';
        alerta.textContent = mensaje;
        alerta.style.cssText = `
            background: #dcfce7;
            color: #166534;
            padding: 12px 16px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-size: 0.9rem;
            border-left: 4px solid #22c55e;
        `;
        
        form.insertBefore(alerta, form.firstChild);
    }
    
    
    // ===== BOTONES SOCIALES (PLACEHOLDER) =====
    document.querySelectorAll('.boton-social').forEach(boton => {
        boton.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Funcionalidad de registro social próximamente');
        });
    });
});


// ===== ESTILOS ADICIONALES (Opcional - agregar al CSS) =====
/*
.mensaje-error {
    color: #ef4444;
    font-size: 0.85rem;
    margin-top: 5px;
    display: block;
}

.alerta-general {
    background: #fee2e2;
    color: #991b1b;
    padding: 12px 16px;
    border-radius: 10px;
    margin-bottom: 20px;
    font-size: 0.9rem;
    border-left: 4px solid #ef4444;
}

.alerta-exito {
    background: #dcfce7;
    color: #166534;
    padding: 12px 16px;
    border-radius: 10px;
    margin-bottom: 20px;
    font-size: 0.9rem;
    border-left: 4px solid #22c55e;
}
*/