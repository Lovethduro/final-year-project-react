import { useInView } from '../App';
import { QUOTE_OFFERINGS } from '../constants/quoteOfferings';
import { FONT_BODY, FONT_DISPLAY } from '../styles/landingFonts';

export function InstallationOfferingsSection() {
    const [ref, inView] = useInView();

    return (
        <section id="installations" className="install-section">
            <div className="install-section-inner">
                <div
                    ref={ref}
                    className="install-section-head"
                    style={{
                        opacity: inView ? 1 : 0,
                        transform: inView ? 'none' : 'translateY(24px)',
                        transition: 'all 0.7s ease',
                    }}
                >
                    <span className="install-eyebrow">Supply &amp; Installation</span>
                    <h2>Products, Installations, or Both</h2>
                    <p>We supply technology, carry out professional installs, or handle the full package - same options as our quote form.</p>
                </div>

                <div className="install-pipeline">
                    {QUOTE_OFFERINGS.map((offering, index) => (
                        <div key={offering.id} className="install-pipeline-item">
                            {index > 0 && <div className="install-pipeline-connector" aria-hidden="true" />}
                            <div className="install-pipeline-node">{index + 1}</div>
                            <div className="install-pipeline-card">
                                <span className="install-pipeline-tag">{offering.tag}</span>
                                <h3>{offering.title}</h3>
                                <p>{offering.description}</p>
                                <ul>
                                    {offering.highlights.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .install-section {
                    padding: clamp(72px, 10vw, 104px) clamp(18px, 4vw, 44px);
                    background: #071210;
                    background-image: linear-gradient(180deg, rgba(16,185,129,0.06) 0%, transparent 40%);
                    border-top: 0.5px solid rgba(52,211,153,0.1);
                    font-family: ${FONT_BODY};
                }
                .install-section-inner { max-width: 960px; margin: 0 auto; }
                .install-section-head { text-align: center; max-width: 580px; margin: 0 auto 48px; }
                .install-eyebrow {
                    display: inline-block; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
                    color: #34D399; font-weight: 700; margin-bottom: 12px;
                }
                .install-section-head h2 {
                    font-family: ${FONT_DISPLAY}; font-size: clamp(28px, 4vw, 36px); color: #0F172A;
                    margin: 0 0 12px; font-weight: 700;
                }
                .install-section-head p { font-size: 15px; color: rgba(15,23,42,0.5); line-height: 1.7; margin: 0; }
                .install-pipeline { display: flex; flex-direction: column; gap: 0; }
                .install-pipeline-item {
                    display: grid;
                    grid-template-columns: 48px 1fr;
                    gap: 20px;
                    position: relative;
                    padding-bottom: 28px;
                }
                .install-pipeline-item:last-child { padding-bottom: 0; }
                .install-pipeline-connector {
                    position: absolute; left: 23px; top: -28px; width: 2px; height: 28px;
                    background: linear-gradient(180deg, rgba(52,211,153,0.4), rgba(52,211,153,0.15));
                }
                .install-pipeline-node {
                    width: 48px; height: 48px; border-radius: 50%;
                    background: rgba(52,211,153,0.15); border: 2px solid rgba(52,211,153,0.45);
                    display: flex; align-items: center; justify-content: center;
                    font-family: ${FONT_DISPLAY}; font-size: 18px; font-weight: 800; color: #34D399;
                    flex-shrink: 0; z-index: 1;
                }
                .install-pipeline-card {
                    background: #0C1A16;
                    border: 0.5px solid rgba(52,211,153,0.2);
                    border-radius: 14px;
                    padding: 24px 26px;
                    transition: border-color 0.25s ease, box-shadow 0.25s ease;
                }
                .install-pipeline-card:hover {
                    border-color: rgba(52,211,153,0.4);
                    box-shadow: 0 12px 32px rgba(16,185,129,0.12);
                }
                .install-pipeline-tag {
                    font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
                    color: #34D399; font-weight: 600;
                }
                .install-pipeline-card h3 {
                    font-family: ${FONT_DISPLAY}; font-size: 20px; color: #0F172A;
                    margin: 10px 0 8px; font-weight: 600;
                }
                .install-pipeline-card p { font-size: 14px; color: rgba(15,23,42,0.5); line-height: 1.65; margin: 0 0 12px; }
                .install-pipeline-card ul { margin: 0; padding-left: 18px; font-size: 13px; color: rgba(10,31,68,0.42); line-height: 1.55; }
                @media (max-width: 600px) {
                    .install-pipeline-item { grid-template-columns: 40px 1fr; gap: 14px; }
                    .install-pipeline-node { width: 40px; height: 40px; font-size: 16px; }
                    .install-pipeline-connector { left: 19px; }
                }
            `}</style>
        </section>
    );
}
