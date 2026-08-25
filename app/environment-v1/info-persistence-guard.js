(() => {
  "use strict";

  const save = document.getElementById("saveState");
  const footer = document.getElementById("footerStatus");

  function showFailure(detail) {
    const text = "Not saved on device";
    if (save) {
      save.textContent = text;
      save.dataset.mode = "error";
      save.title = detail || "Browser storage is unavailable. Current session data may not survive reload.";
    }
    if (footer) footer.textContent = `${text} · ${detail || "browser storage unavailable"}`;
    document.body.dataset.informationPersistence = "failed";
  }

  function showHealthy() {
    if (document.body.dataset.informationPersistence === "failed") return;
    document.body.dataset.informationPersistence = "healthy";
  }

  window.addEventListener("tagro:job-info-save-error", event => {
    setTimeout(() => showFailure(event?.detail?.error || "Browser storage write failed."), 0);
  });

  window.addEventListener("tagro:job-info-save-ok", showHealthy);

  const state = window.TAGROJobInfo?.persistence?.();
  if (state?.ok === false) showFailure(state.error);
  else showHealthy();
})();