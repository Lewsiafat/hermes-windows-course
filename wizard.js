const TOTAL_STEPS = 9;
const STORAGE_KEY = 'hermes-course-step';

function getCurrentStep() {
  const hashMatch = window.location.hash.match(/^#step-(\d+)$/);
  if (hashMatch) {
    const n = parseInt(hashMatch[1], 10);
    if (n >= 0 && n <= TOTAL_STEPS) return n;
  }
  let saved = '0';
  try {
    saved = localStorage.getItem(STORAGE_KEY) || '0';
  } catch (err) {
    // localStorage unavailable (private mode, disabled, etc.) — fall through to default
  }
  const savedNum = parseInt(saved, 10);
  return (savedNum >= 0 && savedNum <= TOTAL_STEPS) ? savedNum : 0;
}

function showStep(n) {
  document.querySelectorAll('.step').forEach(el => {
    const stepNum = parseInt(el.dataset.step, 10);
    el.hidden = (stepNum !== n);
  });
  document.getElementById('progress-text').textContent = (n === 0) ? '前言' : `Step ${n} / ${TOTAL_STEPS}`;
  document.getElementById('prev-btn').disabled = (n === 0);
  document.getElementById('next-btn').disabled = (n === TOTAL_STEPS);
  try {
    localStorage.setItem(STORAGE_KEY, String(n));
  } catch (err) {
    // localStorage unavailable — wizard still works for this session
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function navigate(n) {
  if (n < 0 || n > TOTAL_STEPS) return;
  window.location.hash = `step-${n}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const initial = getCurrentStep();
  if (!window.location.hash) {
    history.replaceState(null, '', `#step-${initial}`);
  }
  showStep(initial);

  document.getElementById('prev-btn').addEventListener('click', () => {
    navigate(getCurrentStep() - 1);
  });
  document.getElementById('next-btn').addEventListener('click', () => {
    navigate(getCurrentStep() + 1);
  });

  window.addEventListener('hashchange', () => {
    showStep(getCurrentStep());
  });

  document.querySelectorAll('pre[data-copy]').forEach(pre => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', async () => {
      const text = pre.querySelector('code').textContent;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = '✓ Copied';
        setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
      } catch (err) {
        btn.textContent = 'Copy failed';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      }
    });
    pre.appendChild(btn);
  });
});
