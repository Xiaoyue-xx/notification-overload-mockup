// Editable labels for the selected-state explanation.
const stateDetails = {
  normal: {
    title: "Normal",
    description: "A balanced experience with four notifications that preserve the user’s attention."
  },
  overloaded: {
    title: "Overloaded",
    description: "Ten notification cards compete for attention, showing how repetition and density can reduce focus."
  },
  focus: {
    title: "Focus Mode",
    description: "Important messages and events remain visible while lower-priority updates are grouped or hidden."
  }
};

const phoneCards = Array.from(document.querySelectorAll(".phone-card"));
const stateButtons = Array.from(document.querySelectorAll(".state-button"));
const selectionTitle = document.querySelector("#selection-title");
const selectionDescription = document.querySelector("#selection-description");
const enterModeButton = document.querySelector("#enter-mode");
const modeViewer = document.querySelector("#mode-viewer");
const viewerTitle = document.querySelector("#viewer-title");
const viewerDescription = document.querySelector("#viewer-description");
const viewerToast = document.querySelector("#viewer-toast");
const modePages = Array.from(document.querySelectorAll("[data-view-page]"));

let activeState = "normal";
let lastFocusedElement = null;

function selectState(state, { scrollToPhone = true } = {}) {
  if (!stateDetails[state]) return;

  activeState = state;

  phoneCards.forEach((card) => {
    const isActive = card.dataset.state === state;
    card.classList.toggle("is-selected", isActive);
    card.setAttribute("aria-pressed", String(isActive));
    card.classList.toggle("is-mobile-active", isActive);
  });

  stateButtons.forEach((button) => {
    const isActive = button.dataset.target === state;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  selectionTitle.textContent = stateDetails[state].title;
  selectionDescription.textContent = stateDetails[state].description;
  enterModeButton.innerHTML = `Open ${stateDetails[state].title} experience <span aria-hidden="true">→</span>`;

  if (scrollToPhone && window.matchMedia("(max-width: 680px)").matches) {
    const activeCard = phoneCards.find((card) => card.dataset.state === state);
    activeCard?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
function openModeViewer(state) {
  const activePage = modePages.find((page) => page.dataset.viewPage === state);
  if (!activePage) return;

  lastFocusedElement = document.activeElement;
  activeState = state;
  modePages.forEach((page) => page.classList.toggle("is-active", page === activePage));
  viewerTitle.textContent = stateDetails[state].title;
  viewerDescription.textContent = stateDetails[state].description;
  modeViewer.classList.add("is-open");
  modeViewer.setAttribute("aria-hidden", "false");
  document.body.classList.add("viewer-open");
  modeViewer.querySelector(".viewer-close")?.focus();
}

function closeModeViewer() {
  modeViewer.classList.remove("is-open");
  modeViewer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("viewer-open");
  lastFocusedElement?.focus();
}

phoneCards.forEach((card) => {
  card.addEventListener("click", () => {
    selectState(card.dataset.state, { scrollToPhone: false });
    openModeViewer(card.dataset.state);
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectState(card.dataset.state, { scrollToPhone: false });
      openModeViewer(card.dataset.state);
    }
  });
});

enterModeButton.addEventListener("click", () => openModeViewer(activeState));
stateButtons.forEach((button) => {
  button.addEventListener("click", () => selectState(button.dataset.target));
});
modeViewer.querySelectorAll("[data-close-viewer]").forEach((button) => {
  button.addEventListener("click", closeModeViewer);
});

document.querySelectorAll("[data-focus-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    const tabName = tab.dataset.focusTab;
    document.querySelectorAll("[data-focus-tab]").forEach((item) => item.classList.toggle("is-active", item === tab));
    document.querySelectorAll("[data-focus-panel]").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.focusPanel === tabName));
  });
});

document.querySelectorAll("[data-notification]").forEach((item) => {
  item.addEventListener("click", () => {
    viewerToast.textContent = item.dataset.notification;
    viewerToast.classList.add("is-visible");
    window.setTimeout(() => viewerToast.classList.remove("is-visible"), 2600);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modeViewer.classList.contains("is-open")) {
    closeModeViewer();
  }
});

// Keep the same visual state on resize, including the mobile one-at-a-time view.
window.addEventListener("resize", () => {
  if (window.matchMedia("(max-width: 680px)").matches) {
    selectState(activeState, { scrollToPhone: false });
  }
});

// The initial state is intentionally set to Normal for a clean presentation.
selectState("normal", { scrollToPhone: false });
