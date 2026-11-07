// pocket-wiki — Early skin initializer to prevent visual flash before first paint
(function () {
  try {
    const skin = localStorage.getItem('pocket-wiki-skin') || 'paper';
    if (skin === 'console' || skin === 'atelier') {
      document.documentElement.setAttribute('data-skin', skin);
    } else {
      document.documentElement.setAttribute('data-skin', 'paper');
    }
  } catch {
    document.documentElement.setAttribute('data-skin', 'paper');
  }
})();
