// pocket-wiki — Early skin initializer to prevent visual flash before first paint
(function () {
  try {
    const params = new URLSearchParams(window.location.search);
    const skin = params.get('skin') || localStorage.getItem('pocket-wiki-skin') || 'paper';
    if (skin === 'console' || skin === 'atelier' || skin === 'midnight') {
      document.documentElement.setAttribute('data-skin', skin);
    } else {
      document.documentElement.setAttribute('data-skin', 'paper');
    }
  } catch {
    document.documentElement.setAttribute('data-skin', 'paper');
  }
})();
