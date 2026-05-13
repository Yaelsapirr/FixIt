import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader/AppHeader';
import Navbar from '../components/Navbar/Navbar';
import './RepairGuidePage.css';

const GUIDE_DATA = {
  'faucet-drip': {
    title: 'ברז מטפטף — תיקון בסיסי',
    safety: '⚠️ לפני שמתחילים — כבה את ברז הראשי מתחת לכיור או בכניסה לדירה',
    tools: ['מפתח ברגים שטוח', 'אטם טפלון', 'מפתח אנגלי', 'דלי קטן'],
    steps: [
      { id: 1, title: 'סגור את הברז הראשי', desc: 'מצא את ברז הניתוק מתחת לכיור וסובב אותו עם כיוון השעון עד שייסגר לחלוטין.' },
      { id: 2, title: 'פרק את הברז', desc: 'הסר את הבורג המרכזי מראש הברז בעזרת מפתח ברגים, ומשוך בעדינות את הידית.' },
      { id: 3, title: 'החלף את האטם', desc: 'זהה את האטם הגומי בתחתית — אם הוא בלוי, החלף אותו באטם חדש מאותו גודל.' },
      { id: 4, title: 'הרכב והדק', desc: 'הרכב את הברז בסדר הפוך, הדק את הבורג היטב ופתח את הברז הראשי לאט לאט לבדיקה.' },
    ],
  },
  'outlet-dead': {
    title: 'שקע חשמל לא עובד — בדיקה ואיפוס',
    safety: '⚠️ לפני שמתחילים — כבה את המפסק הראשי בלוח החשמל',
    tools: ['מברג שטוח', 'בודק מתח', 'כפפות בידוד', 'לפיד'],
    steps: [
      { id: 1, title: 'כבה את המפסק בלוח', desc: 'עבור ללוח החשמל ובדוק איזה מפסק שולט באזור השקע — הורד אותו למצב OFF.' },
      { id: 2, title: 'בדוק שקעי GFCI', desc: 'חפש שקע עם כפתורי RESET ו-TEST (לרוב בחדר האמבטיה) — לחץ על RESET.' },
      { id: 3, title: 'פרק ובדוק את השקע', desc: 'הסר את כיסוי השקע, ובדוק עם בודק המתח שאין מתח לפני שנוגעים בחוטים.' },
      { id: 4, title: 'החלף אם נדרש', desc: 'אם השקע פגום — החלף בשקע חדש מאותו סוג, חבר חוטים לפי צבע והרכב.' },
    ],
  },
};

const DEFAULT_GUIDE = {
  title: 'מדריך תיקון כללי',
  safety: '⚠️ לפני שמתחילים — כבה את הברז הראשי / החשמל הראשי',
  tools: ['מפתח ברגים', 'אטם טפלון', 'מפתח אנגלי', 'סרט הדבקה'],
  steps: [
    { id: 1, title: 'אבחן את הבעיה', desc: 'בדוק את מקור הבעיה וודא שאתה מבין מה גרם לתקלה לפני שמתחילים לפרק.' },
    { id: 2, title: 'הכן את הציוד', desc: 'אסוף את כל הכלים הנדרשים לפני תחילת העבודה כדי לא להפסיק באמצע.' },
    { id: 3, title: 'בצע את התיקון', desc: 'פעל לפי ההנחיות בקפידה ואל תמהר — עדיף לעשות נכון מאשר מהר.' },
    { id: 4, title: 'בדוק ואמת', desc: 'לאחר סיום, בדוק שהתקלה נפתרה לחלוטין לפני שמחזירים את הכל למקומו.' },
  ],
};

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
        <span className="instruction-step__number">{step.id}</span>
        <div className="instruction-step__text">
          <h3 className="instruction-step__title">{step.title}</h3>
          <p className="instruction-step__desc">{step.desc}</p>
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
  const guide = GUIDE_DATA[id] ?? DEFAULT_GUIDE;

  const [checked, setChecked] = useState(() =>
    Object.fromEntries(guide.steps.map((s) => [s.id, false]))
  );

  function toggleStep(stepId) {
    setChecked((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  }

  return (
    <div className="page-container repair-guide-page">
      <AppHeader title="מדריך תיקון" showBack={true} />

      <main className="repair-guide-page__content">
        <h2 className="repair-guide-page__title">{guide.title}</h2>

        <SafetyAlert text={guide.safety} />

        {/* Tools */}
        <section className="guide-section">
          <h3 className="guide-section__title">ציוד נדרש</h3>
          <ul className="tool-list">
            {guide.tools.map((tool) => (
              <li key={tool} className="tool-list__item">
                <span className="tool-list__bullet">🔩</span>
                {tool}
              </li>
            ))}
          </ul>
        </section>

        {/* Steps */}
        <section className="guide-section">
          <h3 className="guide-section__title">שלבי התיקון</h3>
          <div className="steps-list">
            {guide.steps.map((step) => (
              <InstructionStep
                key={step.id}
                step={step}
                checked={checked[step.id]}
                onChange={() => toggleStep(step.id)}
              />
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="repair-guide-page__actions">
          <button
            className="action-btn action-btn--primary"
            onClick={() => navigate('/success')}
          >
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
