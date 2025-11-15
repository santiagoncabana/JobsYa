import React from 'react';
import { LogIn } from 'lucide-react';
import Button from '../UI/Button';
import styles from './header.module.css';

const Header = () => (
    <header className={styles.header}>
        <div className={styles.container}>
            {/* Logo */}
            <div className={styles.logo}>
                Jobs<span className={styles.logoAccent}>YA</span>
            </div>

            {/* Navegación (visible en desktop) */}
            <nav className={styles.nav}>
                {['Buscar ofertas', 'Empresas', 'Salarios', 'Formación', 'Mi Perfil'].map(item => (
                    <a
                        key={item}
                        href="#"
                        className={styles.navLink}
                    >
                        {item}
                    </a>
                ))}
            </nav>

            {/* Botones de Acción */}
            <div className={styles.actions}>
                <button className={styles.loginButton}>
                    <LogIn className={styles.loginIcon} /> Iniciar sesión
                </button>
                <Button primary={false} className={styles.registerButton}>
                    Registrarse
                </Button>
            </div>
        </div>
    </header>
);

export default Header;