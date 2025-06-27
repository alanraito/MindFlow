/*
  Arquivo: src/pages/HomePage.js
  Descrição: Página inicial redesenhada com uma nova seção de funcionalidades, layout aprimorado e elementos visuais para ser mais atrativa e profissional.
*/
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const FeatureCard = ({ icon, title, description }) => (
    <div className="feature-card">
        <div className="feature-icon-wrapper">
            <span className="material-icons">{icon}</span>
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
    </div>
);

const HomePage = () => {
    return (
        <div className="homepage-logged-in-container">
            <main>
                <section className="hero-section-logged-in">
                    <div className="hero-content">
                        <h2>Organize suas ideias, acelere seu aprendizado.</h2>
                        <p>Crie mapas mentais de forma intuitiva, colabore em tempo real e transforme seus estudos com flashcards e nuvens de palavras geradas por IA.</p>
                        <Link to="/app/dashboard" className="cta-button-logged-in">Ir para o Dashboard</Link>
                    </div>
                    <div className="hero-icon-background">
                        <span className="material-icons">bubble_chart</span>
                    </div>
                </section>

                <section className="features-section">
                    <FeatureCard
                        icon="hub"
                        title="Mapas Mentais Intuitivos"
                        description="Visualize e conecte suas ideias em um canvas infinito, projetado para um fluxo de trabalho sem interrupções."
                    />
                    <FeatureCard
                        icon="style"
                        title="Flashcards com IA"
                        description="Transforme qualquer tópico do seu mapa em flashcards de estudo com um único clique, otimizando sua revisão."
                    />
                    <FeatureCard
                        icon="cloud_queue"
                        title="Nuvens de Palavras"
                        description="Gere nuvens de palavras para identificar os temas centrais e as ideias mais recorrentes em seus mapas."
                    />
                </section>

                <section id="plans" className="pricing-section">
                    <h3>Planos para todos os níveis</h3>
                    <p>Escolha o plano que melhor se adapta às suas necessidades e potencialize seus resultados.</p>
                    <div className="pricing-cards-container">
                        {/* Card do Plano Mensal */}
                        <div className="pricing-card">
                            <h4>Plano Mensal</h4>
                            <div className="price">R$19,90 <span className="period">/mês</span></div>
                            <ul>
                                <li><span className="material-icons">check_circle</span> Mapas Mentais Ilimitados</li>
                                <li><span className="material-icons">check_circle</span> Flashcards com IA</li>
                                <li><span className="material-icons">check_circle</span> Nuvens de Palavras</li>
                                <li><span className="material-icons">check_circle</span> Colaboração em tempo real</li>
                                <li><span className="material-icons">check_circle</span> Suporte Prioritário</li>
                            </ul>
                            <button className="pricing-button">Seja Premium</button>
                        </div>

                        {/* Card do Plano Anual */}
                        <div className="pricing-card recommended">
                            <span className="recommended-badge">Mais Popular</span>
                            <h4>Plano Anual</h4>
                            <div className="price">R$199,90 <span className="period">/ano</span></div>
                            <ul>
                                <li><span className="material-icons">check_circle</span> Todos os benefícios do plano mensal</li>
                                <li><span className="material-icons">check_circle</span> **Economize mais de 15%**</li>
                                <li><span className="material-icons">check_circle</span> Acesso antecipado a novas funcionalidades</li>
                            </ul>
                            <button className="pricing-button">Seja Premium Anual</button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default HomePage;