(function () {
  var KEY = 'hermes-course-theme';

  function targetIcon(theme) {
    return theme === 'light' ? '🌙' : '☀️';
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.textContent = targetIcon(currentTheme());
    btn.addEventListener('click', function () {
      var next = currentTheme() === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(KEY, next);
      btn.textContent = targetIcon(next);
    });
  });
})();
