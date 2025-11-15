import React from 'react';
import styles from './featuredCompanies.module.css';

const FeaturedCompanies = () => {
    // Los logos se simulan con iconos y colores
    const companies = [
        { name: 'GlobalTech', icon: 'G', color: styles.logoPrimary },
        { name: 'InnovateX', icon: 'I', color: styles.logoAccent },
        { name: 'DataFlow', icon: 'D', color: styles.logoSuccess },
        { name: 'EcoCorp', icon: 'E', color: styles.logoRed }, // Color fuera de paleta, mapeado en CSS
        { name: 'MediaHub', icon: 'M', color: styles.logoIndigo }, // Color fuera de paleta, mapeado en CSS
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.title}>
                    Empresas destacadas que contratan
                </h2>

                <div className={styles.companiesGrid}>
                    {companies.map((company) => (
                        <div key={company.name} className={styles.companyWrapper}>
                            <div className={`${styles.logoContainer} ${company.color}`}>
                                <span className={styles.logoText}>{company.icon}</span>
                            </div>
                            <p className={styles.companyName}>{company.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedCompanies;