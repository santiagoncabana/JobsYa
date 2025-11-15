import React from 'react';
import styles from './button.module.css';

const Button = ({ children, primary = true, className = '', onClick, type = 'button' }) => (
    <button
        type={type}
        onClick={onClick}
        className={`${styles.base} ${primary ? styles.primary : styles.secondary} ${className}`}
    >
        {children}
    </button>
);

export default Button;