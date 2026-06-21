import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader/AppHeader';
import Navbar from '../components/Navbar/Navbar';
import './RepairGuidePage.css';

function SafetyAlert({ text }) {
  return (
    <div className="safety-alert" role="alert">
      <p className="safety-alert__text">{text}</p>
    </div>
  );
}

function InstructionStep({ step, checked, onChange }) {
  return (
    <div className={`instruction-step${checked ? ' instruction-step--done' : ''}`}>
      <div className="instruction-step__header">
        <span className="instruction-step__number">{step.step_order}</span>
        <div className="instruction-step__text">
          <h3 className="instruction-step__title">{step.title}</h3>
          <p className="instruction-step__desc">{step.description}</p>
        </div>
        <label className="instruction-step__check-label" aria-label="סמן כהושלם">
          <input
            type="checkbox"
            className="instruction-step__checkbox"
            checked={checked}
            onChange={onChange}
          />
          <span className="instruction-step__checkmark" />
        </label>
      </div>
    </div>
  );
}

export default function RepairGuidePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [steps, setSteps] = useState([]);
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGuide() {
      const [{ data: guideData }, { data: stepsData }] = await Promise.all([
        supabase.from('repair_guides').select('*').eq('id', id).maybeSingle(),
        supabase.from('guide_steps').select('*').eq('guide_id', id).order('step_order'),
      ]);
      setGuide(guideData);
      setSteps(stepsData || []);
      setChecked(Object.fromEntries((stepsData || []).map((s) => [s.id, false])));
      setLoading(false);
    }
    fetchGuide();
  }, [id]);

  function toggleStep(stepId) {
    setChecked((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  }

  async function handleDone() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('repair_history').insert({
        user_id: user.id,
        guide_id: id,
        savings: 250,
      });
    }
    navigate('/success');
  }

  if (loading) {
    return (
      <div className="page-container repair-guide-page">
        <AppHeader title="מדריך תיקון" showBack={true} />
        <main className="repair-guide-page__content">
          <p className="loading-text">טוען מדריך...</p>
        </main>
        <Navbar />
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="page-container repair-guide-page">
        <AppHeader title="מדריך תיקון" showBack={true} />
        <main className="repair-guide-page__content">
          <p className="loading-text">המדריך לא נמצא</p>
        </main>
        <Navbar />
      </div>
    );
  }

  return (
    <div className="page-container repair-guide-page">
      <AppHeader title="מדריך תיקון" showBack={true} />

      <main className="repair-guide-page__content">
        <h2 className="repair-guide-page__title">{guide.title}</h2>

        {guide.safety_note && <SafetyAlert text={guide.safety_note} />}

        <section className="guide-section">
          <h3 className="guide-section__title">ציוד נדרש</h3>
          <ul className="tool-list">
            {(guide.tools || []).map((tool) => (
              <li key={tool} className="tool-list__item">
                <span className="tool-list__bullet">🔩</span>
                {tool}
              </li>
            ))}
          </ul>
        </section>

        <section className="guide-section">
          <h3 className="guide-section__title">שלבי התיקון</h3>
          <div className="steps-list">
            {steps.map((step) => (
              <InstructionStep
                key={step.id}
                step={step}
                checked={checked[step.id]}
                onChange={() => toggleStep(step.id)}
              />
            ))}
          </div>
        </section>

        <div className="repair-guide-page__actions">
          <button className="action-btn action-btn--primary" onClick={handleDone}>
            ✅ סיימתי לתקן!
          </button>
          <button
            className="action-btn action-btn--secondary"
            onClick={() => navigate('/technicians')}
          >
            📞 קרא לטכנאי
          </button>
        </div>
      </main>

      <Navbar />
    </div>
  );
}
