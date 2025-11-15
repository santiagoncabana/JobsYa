import React from 'react';
import { Code, TrendingUp, DollarSign, Users, Zap, Truck, ArrowRight, User, Briefcase } from 'lucide-react';
import Button from '../UI/Button';
import styles from './topCategories.module.css';

const TopCategories = () => {
    const categories = [
        { name: 'Tecnología e IT', icon: Code, count: '12,500' },
        { name: 'Marketing y Ventas', icon: TrendingUp, count: '8,200' },
        { name: 'Finanzas y Contabilidad', icon: DollarSign, count: '5,900' },
        { name: 'Recursos Humanos', icon: Users, count: '4,100' },
        { name: 'Diseño y Creatividad', icon: Zap, count: '3,500' },
        { name: 'Operaciones y Logística', icon: Truck, count: '6,800' },
        { name: 'Administración', icon: User, count: '9,500' },
        { name: 'Salud y Farmacia', icon: Briefcase, count: '7,100' },
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <h2 className={styles.title}>
                    Explora las Categorías Populares
                </h2>
                <div className={styles.grid}>
                    {categories.map((cat) => (
                        <a
                            key={cat.name}
                            href="#"
                            className={styles.card}
                        >
                            <div className={styles.iconWrapper}>
                                <cat.icon className={styles.icon} />
                            </div>

                            <div className={styles.contentWrapper}>
                                <h3 className={styles.cardTitle}>{cat.name}</h3>
                                <p className={styles.cardCount}>{cat.count} ofertas</p>
                            </div>

                            <div className={styles.actionLink}>
                                Ver empleos ({cat.count}) <ArrowRight className={styles.arrowIcon} />
                            </div>
                        </a>
                    ))}
                </div>
                <div className={styles.buttonWrapper}>
                    <Button primary={false} className={styles.allCategoriesButton}>
                        Ver todas las categorías
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default TopCategories;