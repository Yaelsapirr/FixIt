import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader/AppHeader';
import Navbar from '../components/Navbar/Navbar';
import './RepairGuidePage.css';

const YT_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

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

function YouTubeEmbed({ query }) {
  const [videoId, setVideoId] = useState(null);

  useEffect(() => {
    if (!YT_KEY || !query) return;
    const url =
      'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1' +
      '&relevanceLanguage=iw&q=' + encodeURIComponent(query + ' תיקון DIY') +
      '&key=' + YT_KEY;
    fetch(url)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        const id = data.items && data.items[0] && data.items[0].id && data.items[0].id.videoId;
        if (id) setVideoId(id);
      })
      .catch(function() {});
  }, [query]);

  if (!YT_KEY || !videoId) return null;

  return (
    <section className="guide-section">
      <h3 className="guide-section__title">סרטון הדרכה</h3>
      <div className="yt-wrapper">
        <iframe
          className="yt-embed"
          src={'https://www.youtube.com/embed/' + videoId}
          title="סרטון הדרכה"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  );
}

export default function RepairGuidePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guide,   setGuide]   = useState(null);
  const [steps,   setSteps]   = useState([]);
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(true);
  const [saved,   setSaved]   = useState(false);
  const [userId,  setUserId]  = useState(null);

  useEffect(() => {
    async function fetchGuide() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      const [{ data: guideData }, { data: stepsData }, { data: savedData }] = await Promise.all([
        supabase.from('repair_guides').select('*').eq('id', id).maybeSingle(),
        supabase.from('guide_steps').select('*').eq('guide_id', id).order('step_order'),
        user
          ? supabase.from('saved_repairs').select('guide_id').eq('user_id', user.id).eq('guide_id', id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      setGuide(guideData);
      setSteps(stepsData || []);
      setChecked(Object.fromEntries((stepsData || []).map((s) => [s.id, false])));
      setSaved(!!savedData);
      setLoading(false);
    }
    fetchGuide();
  }, [id]);

  function toggleStep(stepId) {
    setChecked((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  }

  async function handleToggleSave() {
    if (!userId) { navigate('/login'); return; }
    if (saved) {
      await supabase.from('saved_repairs').delete().eq('user_id', userId).eq('guide_id', id);
      setSaved(false);
    } else {
      await supabase.from('saved_repairs').upsert({ user_id: userId, guide_id: id });
      setSaved(true);
    }
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

        <YouTubeEmbed query={guide.title} />

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
            סיימתי לתקן!
          </button>
          <button
            className={`action-btn action-btn--save${saved ? ' action-btn--saved' : ''}`}
            onClick={handleToggleSave}
          >
            {saved ? 'שמור' : 'שמור לאחר כך'}
          </button>
          <button
            className="action-btn action-btn--secondary"
            onClick={() => navigate('/technicians')}
          >
            קרא לטכנאי
          </button>
        </div>
      </main>

      <Navbar />
    </div>
  );
}
