const TOTAL_STEPS = 9;
const STORAGE_KEY = 'hermes-course-step';

function getCurrentStep() {
  const hashMatch = window.location.hash.match(/^#step-(\d+)$/);
  if (hashMatch) {
    const n = parseInt(hashMatch[1], 10);
    if (n >= 1 && n <= TOTAL_STEPS) return n;
  }
  let saved = '1';
  try {
    saved = localStorage.getItem(STORAGE_KEY) || '1';
  } catch (err) {
    // localStorage unavailable (private mode, disabled, etc.) — fall through to default
  }
  const savedNum = parseInt(saved, 10);
  return (savedNum >= 1 && savedNum <= TOTAL_STEPS) ? savedNum : 1;
}

function showStep(n) {
  document.querySelectorAll('.step').forEach(el => {
    const stepNum = parseInt(el.dataset.step, 10);
    el.hidden = (stepNum !== n);
  });
  document.getElementById('progress-text').textContent = `Step ${n} / ${TOTAL_STEPS}`;
  document.getElementById('prev-btn').disabled = (n === 1);
  document.getElementById('next-btn').disabled = (n === TOTAL_STEPS);
  try {
    localStorage.setItem(STORAGE_KEY, String(n));
  } catch (err) {
    // localStorage unavailable — wizard still works for this session
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function navigate(n) {
  if (n < 1 || n > TOTAL_STEPS) return;
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
