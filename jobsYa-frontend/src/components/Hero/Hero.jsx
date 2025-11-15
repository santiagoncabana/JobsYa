import React, { useState } from 'react';
import { Briefcase, MapPin, Search } from 'lucide-react';
import Button from '../UI/Button';
import styles from './hero.module.css';

const Hero = () => {
    const [jobTitle, setJobTitle] = useState('');
    const [location, setLocation] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        console.log(`Buscando: ${jobTitle} en ${location}`);
    };

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h1 className={styles.title}>
                    Encuentra tu próximo <span className={styles.titleAccent}>empleo ideal</span>
                </h1>
                <p className={styles.subtitle}>
                    Más de <span className={styles.subtitleCount}>500.000</span> ofertas de empleo disponibles para impulsar tu carrera.
                </p>

                {/* Formulario de Búsqueda */}
                <form onSubmit={handleSearch} className={styles.form}>

                    {/* Input Puesto */}
                    <div className={styles.inputGroup}>
                        <Briefcase className={styles.inputIcon} />
                        <input
                            type="text"
                            placeholder="Puesto o palabra clave"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    {/* Input Ubicación */}
                    <div className={styles.inputGroupLocation}>
                        <MapPin className={styles.inputIcon} />
                        <input
                            type="text"
                            placeholder="Ubicación"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    {/* Botón Buscar */}
                    <Button type="submit" primary={false} className={styles.searchButton}>
                        <Search className={styles.searchIcon} />
                        <span>Buscar</span>
                    </Button>
                </form>
            </div>
        </section>
    );
};

export default Hero;