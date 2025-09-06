// quick require check for syntax errors
(async () => {
  try {
    const router = await import('./src/routes/habit.routes.js');
    console.log('habit.routes.js loaded OK');
  } catch (err) {
    console.error('Require failed:', err);
    process.exit(1);
  }
})();
