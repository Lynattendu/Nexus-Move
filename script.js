/* =========================================================
   NEXUS MOVE
   SCRIPT.JS
========================================================= */

document.addEventListener("DOMContentLoaded", function () {


/* =========================================================
   OUTILS
========================================================= */

function el(id) {
  return document.getElementById(id);
}


function showScreen(screen) {

  document.querySelectorAll(".screen").forEach(function (item) {
    item.classList.remove("active");
  });

  screen.classList.add("active");

  window.scrollTo(0, 0);
}


/* =========================================================
   ÉCRANS
========================================================= */

const homeScreen = el("homeScreen");
const chronoScreen = el("chronoScreen");
const circuitSetupScreen = el("circuitSetupScreen");
const circuitWorkoutScreen = el("circuitWorkoutScreen");
const workoutCompleteScreen = el("workoutCompleteScreen");
const historyScreen = el("historyScreen");


/* =========================================================
   NAVIGATION
========================================================= */

el("openChronoBtn").addEventListener("click", function () {
  showScreen(chronoScreen);
});


el("openCircuitBtn").addEventListener("click", function () {

  renderExercises();

  showScreen(circuitSetupScreen);
});


el("openHistoryBtn").addEventListener("click", function () {

  renderHistory();

  showScreen(historyScreen);
});


document.querySelectorAll("[data-back-home]").forEach(function (button) {

  button.addEventListener("click", function () {

    updateHomeStats();

    showScreen(homeScreen);
  });

});


el("completeHomeBtn").addEventListener("click", function () {

  updateHomeStats();

  showScreen(homeScreen);
});


/* =========================================================
   AUDIO
========================================================= */

let audioContext = null;


function ensureAudio() {

  try {

    if (!audioContext) {

      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContext) {
        return;
      }

      audioContext =
        new AudioContext();
    }

    if (
      audioContext.state ===
      "suspended"
    ) {
      audioContext.resume();
    }

  } catch (error) {

    console.log(error);
  }
}


function beep(
  frequency,
  duration
) {

  try {

    ensureAudio();

    if (!audioContext) {
      return;
    }

    const oscillator =
      audioContext.createOscillator();

    const gain =
      audioContext.createGain();

    oscillator.type =
      "sine";

    oscillator.frequency.value =
      frequency;

    gain.gain.value =
      0.18;

    oscillator.connect(gain);

    gain.connect(
      audioContext.destination
    );

    oscillator.start();

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + duration
    );

    oscillator.stop(
      audioContext.currentTime + duration
    );

  } catch (error) {

    console.log(error);
  }
}


function soundStart() {

  beep(700, 0.12);

  setTimeout(function () {
    beep(950, 0.16);
  }, 140);
}


function soundChange() {
  beep(900, 0.16);
}


function soundRest() {
  beep(520, 0.2);
}


function soundFinish() {

  beep(700, 0.12);

  setTimeout(function () {
    beep(900, 0.12);
  }, 140);

  setTimeout(function () {
    beep(1150, 0.25);
  }, 280);
}


/* =========================================================
   FLASH
========================================================= */

function flash() {

  const flashElement =
    el("phaseFlash");

  flashElement.classList.remove(
    "flash"
  );

  void flashElement.offsetWidth;

  flashElement.classList.add(
    "flash"
  );
}


/* =========================================================
   FORMAT TEMPS
========================================================= */

function formatChrono(milliseconds) {

  const tenths =
    Math.floor(
      milliseconds / 100
    );

  const minutes =
    Math.floor(
      tenths / 600
    );

  const seconds =
    Math.floor(
      (tenths % 600) / 10
    );

  const decimal =
    tenths % 10;

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0") +
    "." +
    decimal
  );
}


function formatCountdown(seconds) {

  seconds =
    Math.max(
      0,
      Math.ceil(seconds)
    );

  const minutes =
    Math.floor(
      seconds / 60
    );

  const remainingSeconds =
    seconds % 60;

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(remainingSeconds).padStart(2, "0")
  );
}


function formatDuration(seconds) {

  seconds =
    Math.max(
      0,
      Math.round(seconds)
    );

  if (seconds < 60) {
    return seconds + " s";
  }

  const minutes =
    Math.floor(
      seconds / 60
    );

  const remainingSeconds =
    seconds % 60;


  if (minutes < 60) {

    if (
      remainingSeconds === 0
    ) {

      return minutes + " min";
    }

    return (
      minutes +
      " min " +
      remainingSeconds +
      " s"
    );
  }


  const hours =
    Math.floor(
      minutes / 60
    );

  const remainingMinutes =
    minutes % 60;


  return (
    hours +
    " h " +
    remainingMinutes +
    " min"
  );
}


/* =========================================================
   HISTORIQUE
========================================================= */

const HISTORY_KEY =
  "nexusMoveHistory";


function getHistory() {

  try {

    const value =
      localStorage.getItem(
        HISTORY_KEY
      );

    if (!value) {
      return [];
    }

    const history =
      JSON.parse(value);

    if (
      !Array.isArray(history)
    ) {
      return [];
    }

    return history;

  } catch (error) {

    return [];
  }
}


function saveHistory(history) {

  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(history)
  );
}


/* =========================================================
   CHRONOMÈTRE SIMPLE
========================================================= */

let chronoTimer = null;

let chronoRunning = false;

let chronoElapsed = 0;

let chronoStartedAt = 0;


function getCurrentChronoTime() {

  let value =
    chronoElapsed;

  if (chronoRunning) {

    value +=
      performance.now() -
      chronoStartedAt;
  }

  return value;
}


function updateChrono() {

  el("chronoDisplay").textContent =
    formatChrono(
      getCurrentChronoTime()
    );
}


/* =========================================================
   DÉMARRER CHRONO
========================================================= */

el("chronoStartBtn").addEventListener("click", function () {

  ensureAudio();

  clearInterval(
    chronoTimer
  );

  chronoElapsed = 0;

  chronoStartedAt =
    performance.now();

  chronoRunning = true;


  el("chronoStatus").textContent =
    "EN COURS";

  el("chronoStartBtn").disabled =
    true;

  el("chronoPauseBtn").disabled =
    false;

  el("chronoResumeBtn").disabled =
    true;


  el("chronoDisplay").classList.add(
    "running-glow"
  );


  chronoTimer =
    setInterval(
      updateChrono,
      50
    );
});


/* =========================================================
   STOP CHRONO
========================================================= */

el("chronoPauseBtn").addEventListener("click", function () {

  if (!chronoRunning) {
    return;
  }


  chronoElapsed +=
    performance.now() -
    chronoStartedAt;


  chronoRunning = false;


  clearInterval(
    chronoTimer
  );


  el("chronoStatus").textContent =
    "PAUSE";


  el("chronoPauseBtn").disabled =
    true;

  el("chronoResumeBtn").disabled =
    false;


  el("chronoDisplay").classList.remove(
    "running-glow"
  );


  updateChrono();
});


/* =========================================================
   REPRENDRE CHRONO
========================================================= */

el("chronoResumeBtn").addEventListener("click", function () {

  if (chronoRunning) {
    return;
  }


  chronoStartedAt =
    performance.now();

  chronoRunning =
    true;


  el("chronoStatus").textContent =
    "EN COURS";


  el("chronoPauseBtn").disabled =
    false;

  el("chronoResumeBtn").disabled =
    true;


  el("chronoDisplay").classList.add(
    "running-glow"
  );


  chronoTimer =
    setInterval(
      updateChrono,
      50
    );
});


/* =========================================================
   REMISE À ZÉRO CHRONO
========================================================= */

function resetChrono() {

  clearInterval(
    chronoTimer
  );

  chronoTimer =
    null;

  chronoRunning =
    false;

  chronoElapsed =
    0;

  chronoStartedAt =
    0;


  el("chronoDisplay").textContent =
    "00:00.0";

  el("chronoStatus").textContent =
    "PRÊT";


  el("chronoStartBtn").disabled =
    false;

  el("chronoPauseBtn").disabled =
    true;

  el("chronoResumeBtn").disabled =
    true;


  el("chronoDisplay").classList.remove(
    "running-glow"
  );
}


el("chronoResetBtn").addEventListener(
  "click",
  resetChrono
);


/* =========================================================
   ENREGISTRER ACTIVITÉ CHRONOMÉTRÉE
========================================================= */

el("saveChronoBtn").addEventListener("click", function () {

  const name =
    el("chronoActivityName")
      .value
      .trim();
const distance =
  Number(
    el("chronoDistance").value
  );

  if (!name) {

    alert(
      "Entre le nom de l'activité."
    );

    return;
  }
if (
  !distance ||
  distance <= 0
) {

  alert(
    "Entre la distance parcourue en mètres."
  );

  return;
}

  const milliseconds =
    getCurrentChronoTime();


  if (
    milliseconds < 1000
  ) {

    alert(
      "Le chronomètre doit avoir tourné avant d'enregistrer l'activité."
    );

    return;
  }


  const duration =
    Math.max(
      1,
      Math.round(
        milliseconds / 1000
      )
    );


  const history =
    getHistory();


  history.unshift({

    id:
      Date.now(),

    type:
      "chrono",

    date:
      new Date().toISOString(),

    name:
      name,

    duration:
      duration,

    completedExercises:
      1

  });


  saveHistory(
    history
  );


  soundFinish();

  flash();


  alert(
    "Activité enregistrée dans l'historique."
  );


  resetChrono();


  el("chronoActivityName").value =
    "";


  updateHomeStats();
});


/* =========================================================
   CIRCUIT
========================================================= */

let exercises = [];

let selectedType =
  "time";


/* =========================================================
   PLUS / MOINS
========================================================= */

document
  .querySelectorAll(".plus-btn")
  .forEach(function (button) {

    button.addEventListener("click", function () {

      const input =
        el(
          button.dataset.target
        );

      let value =
        Number(
          input.value
        ) || 0;

      const maximum =
        Number(
          input.max
        ) || 999;

      value++;

      input.value =
        Math.min(
          value,
          maximum
        );
    });
  });


document
  .querySelectorAll(".minus-btn")
  .forEach(function (button) {

    button.addEventListener("click", function () {

      const input =
        el(
          button.dataset.target
        );

      let value =
        Number(
          input.value
        ) || 0;

      const minimum =
        Number(
          input.min
        ) || 0;

      value--;

      input.value =
        Math.max(
          value,
          minimum
        );
    });
  });


/* =========================================================
   MODALE EXERCICE
========================================================= */

function selectExerciseType(type) {

  selectedType =
    type;


  el("typeTimeBtn").classList.toggle(
    "active",
    type === "time"
  );


  el("typeRepsBtn").classList.toggle(
    "active",
    type === "reps"
  );


  el("timeOption").classList.toggle(
    "active",
    type === "time"
  );


  el("repsOption").classList.toggle(
    "active",
    type === "reps"
  );
}


function openExerciseModal() {

  el("exerciseName").value =
    "";

  el("exerciseTime").value =
    45;

  el("exerciseReps").value =
    10;


  selectExerciseType(
    "time"
  );


  el("exerciseModal").classList.add(
    "open"
  );


  el("exerciseModal").setAttribute(
    "aria-hidden",
    "false"
  );
}


function closeExerciseModal() {

  el("exerciseModal").classList.remove(
    "open"
  );


  el("exerciseModal").setAttribute(
    "aria-hidden",
    "true"
  );
}


el("addExerciseBtn").addEventListener(
  "click",
  openExerciseModal
);


el("closeExerciseModalBtn").addEventListener(
  "click",
  closeExerciseModal
);


document
  .querySelector("#exerciseModal .modal-overlay")
  .addEventListener(
    "click",
    closeExerciseModal
  );


el("typeTimeBtn").addEventListener("click", function () {

  selectExerciseType(
    "time"
  );
});


el("typeRepsBtn").addEventListener("click", function () {

  selectExerciseType(
    "reps"
  );
});


/* =========================================================
   AJOUTER EXERCICE
========================================================= */

el("saveExerciseBtn").addEventListener("click", function () {

  const name =
    el("exerciseName")
      .value
      .trim();


  if (!name) {

    alert(
      "Entre le nom de l'exercice."
    );

    return;
  }


  let value;


  if (
    selectedType ===
    "time"
  ) {

    value =
      Number(
        el("exerciseTime").value
      );


    if (
      !value ||
      value < 1
    ) {

      alert(
        "Entre une durée valide."
      );

      return;
    }

  } else {

    value =
      Number(
        el("exerciseReps").value
      );


    if (
      !value ||
      value < 1
    ) {

      alert(
        "Entre un nombre de répétitions valide."
      );

      return;
    }
  }


  exercises.push({

    id:
      Date.now(),

    name:
      name,

    type:
      selectedType,

    value:
      value

  });


  renderExercises();

  closeExerciseModal();
});


/* =========================================================
   LISTE EXERCICES
========================================================= */

function renderExercises() {

  const list =
    el("exerciseList");


  list.innerHTML =
    "";


  el("setupExerciseCount").textContent =
    exercises.length;


  exercises.forEach(function (
    exercise,
    index
  ) {


    const item =
      document.createElement(
        "div"
      );


    item.className =
      "exercise-item";


    const description =
      exercise.type === "time"
        ? exercise.value + " secondes"
        : exercise.value + " répétitions";


    const number =
      document.createElement(
        "div"
      );


    number.className =
      "exercise-item-number";


    number.textContent =
      index + 1;


    const content =
      document.createElement(
        "div"
      );


    content.className =
      "exercise-item-content";


    const title =
      document.createElement(
        "strong"
      );


    title.textContent =
      exercise.name;


    const detail =
      document.createElement(
        "span"
      );


    detail.textContent =
      description;


    content.appendChild(
      title
    );


    content.appendChild(
      detail
    );


    const deleteButton =
      document.createElement(
        "button"
      );


    deleteButton.className =
      "exercise-delete";


    deleteButton.type =
      "button";


    deleteButton.textContent =
      "×";


    deleteButton.addEventListener("click", function () {

      exercises.splice(
        index,
        1
      );


      renderExercises();
    });


    item.appendChild(
      number
    );

    item.appendChild(
      content
    );

    item.appendChild(
      deleteButton
    );


    list.appendChild(
      item
    );

  });
}


/* =========================================================
   VARIABLES ENTRAÎNEMENT
========================================================= */

let workout =
  null;

let workoutTimer =
  null;

let currentExercise =
  0;

let currentRound =
  1;

let completedExerciseCount =
  0;

let completedRoundCount =
  0;

let phase =
  "ready";

let phaseRemaining =
  0;

let phaseEnd =
  0;

let workoutPaused =
  false;

let workoutStarted =
  false;

let sessionStartedAt =
  0;

let totalPauseTime =
  0;

let pauseStartedAt =
  0;


/* =========================================================
   CRÉER CIRCUIT
========================================================= */

el("startCircuitBtn").addEventListener("click", function () {

  if (
    exercises.length === 0
  ) {

    alert(
      "Ajoute au moins un exercice."
    );

    return;
  }


  workout = {

    rounds:
      Math.max(
        1,
        Number(
          el("roundCount").value
        ) || 1
      ),

    exerciseRest:
      Math.max(
        0,
        Number(
          el("exerciseRest").value
        ) || 0
      ),

    roundRest:
      Math.max(
        0,
        Number(
          el("roundRest").value
        ) || 0
      ),

    exercises:
      exercises.map(function (exercise) {

        return {

          name:
            exercise.name,

          type:
            exercise.type,

          value:
            exercise.value

        };
      })
  };


  prepareWorkout();


  showScreen(
    circuitWorkoutScreen
  );
});


/* =========================================================
   PRÉPARER CIRCUIT
========================================================= */

function prepareWorkout() {

  clearInterval(
    workoutTimer
  );


  workoutTimer =
    null;

  currentExercise =
    0;

  currentRound =
    1;

  completedExerciseCount =
    0;

  completedRoundCount =
    0;

  phase =
    "ready";

  phaseRemaining =
    0;

  workoutPaused =
    false;

  workoutStarted =
    false;

  totalPauseTime =
    0;

  pauseStartedAt =
    0;


  el("workoutPhase").textContent =
    "PRÊT";


  el("workoutExerciseName").textContent =
    workout.exercises[0].name;


  if (
    workout.exercises[0].type ===
    "time"
  ) {

    el("workoutTimer").textContent =
      formatCountdown(
        workout.exercises[0].value
      );

  } else {

    el("workoutTimer").textContent =
      "--:--";
  }


  el("repsDisplay").hidden =
    true;

  el("finishRepsBtn").hidden =
    true;


  el("workoutStartBtn").disabled =
    false;

  el("workoutPauseBtn").disabled =
    true;

  el("workoutResumeBtn").disabled =
    true;


  updateProgress();
}


/* =========================================================
   COMMENCER CIRCUIT
========================================================= */

el("workoutStartBtn").addEventListener("click", function () {

  if (
    workoutStarted
  ) {
    return;
  }


  ensureAudio();


  workoutStarted =
    true;

  workoutPaused =
    false;


  sessionStartedAt =
    Date.now();


  el("workoutStartBtn").disabled =
    true;

  el("workoutPauseBtn").disabled =
    false;

  el("workoutResumeBtn").disabled =
    true;


  soundStart();

  flash();


  startExercise();
});


/* =========================================================
   EXERCICE
========================================================= */

function startExercise() {

  clearInterval(
    workoutTimer
  );


  const exercise =
    workout.exercises[
      currentExercise
    ];


  phase =
    "exercise";


  el("workoutPhase").textContent =
    "EXERCICE";


  el("workoutExerciseName").textContent =
    exercise.name;


  el("workoutExerciseProgress").textContent =
    (currentExercise + 1) +
    " / " +
    workout.exercises.length;


  el("workoutRoundProgress").textContent =
    currentRound +
    " / " +
    workout.rounds;


  if (
    exercise.type ===
    "time"
  ) {

    el("repsDisplay").hidden =
      true;

    el("finishRepsBtn").hidden =
      true;


    beginCountdown(
      exercise.value
    );

  } else {

    el("workoutTimer").textContent =
      "--:--";


    el("workoutReps").textContent =
      exercise.value;


    el("repsDisplay").hidden =
      false;

    el("finishRepsBtn").hidden =
      false;
  }


  circuitWorkoutScreen.classList.remove(
    "phase-rest",
    "phase-round-rest",
    "phase-paused"
  );


  circuitWorkoutScreen.classList.add(
    "phase-work"
  );
}


/* =========================================================
   COMPTE À REBOURS
========================================================= */

function beginCountdown(seconds) {

  clearInterval(
    workoutTimer
  );


  phaseRemaining =
    seconds;


  phaseEnd =
    Date.now() +
    seconds * 1000;


  updateCountdown();


  workoutTimer =
    setInterval(
      updateCountdown,
      100
    );
}


function updateCountdown() {

  if (
    workoutPaused
  ) {
    return;
  }


  phaseRemaining =
    Math.max(
      0,
      (
        phaseEnd -
        Date.now()
      ) / 1000
    );


  el("workoutTimer").textContent =
    formatCountdown(
      phaseRemaining
    );


  if (
    phaseRemaining <= 0
  ) {

    clearInterval(
      workoutTimer
    );


    workoutTimer =
      null;


    finishPhase();
  }
}


/* =========================================================
   FIN PHASE
========================================================= */

function finishPhase() {

  if (
    phase ===
    "exercise"
  ) {

    completeExercise();

  } else if (
    phase ===
    "exerciseRest"
  ) {

    currentExercise++;

    soundChange();

    flash();

    startExercise();

  } else if (
    phase ===
    "roundRest"
  ) {

    currentRound++;

    currentExercise =
      0;

    soundChange();

    flash();

    startExercise();
  }
}


/* =========================================================
   FIN EXERCICE
========================================================= */

function completeExercise() {

  completedExerciseCount++;


  updateProgress();


  const lastExercise =
    currentExercise ===
    workout.exercises.length - 1;


  if (
    !lastExercise
  ) {

    if (
      workout.exerciseRest > 0
    ) {

      startExerciseRest();

    } else {

      currentExercise++;

      soundChange();

      flash();

      startExercise();
    }

    return;
  }


  completedRoundCount++;


  updateProgress();


  const lastRound =
    currentRound >=
    workout.rounds;


  if (
    lastRound
  ) {

    finishWorkout();

    return;
  }


  if (
    workout.roundRest > 0
  ) {

    startRoundRest();

  } else {

    currentRound++;

    currentExercise =
      0;

    soundChange();

    flash();

    startExercise();
  }
}


/* =========================================================
   REPOS ENTRE EXERCICES
========================================================= */

function startExerciseRest() {

  phase =
    "exerciseRest";


  el("workoutPhase").textContent =
    "REPOS";


  el("workoutExerciseName").textContent =
    "Prochain : " +
    workout.exercises[
      currentExercise + 1
    ].name;


  el("repsDisplay").hidden =
    true;

  el("finishRepsBtn").hidden =
    true;


  circuitWorkoutScreen.classList.remove(
    "phase-work",
    "phase-round-rest"
  );


  circuitWorkoutScreen.classList.add(
    "phase-rest"
  );


  soundRest();

  flash();


  beginCountdown(
    workout.exerciseRest
  );
}


/* =========================================================
   REPOS ENTRE TOURS
========================================================= */

function startRoundRest() {

  phase =
    "roundRest";


  el("workoutPhase").textContent =
    "REPOS ENTRE LES TOURS";


  el("workoutExerciseName").textContent =
    "Tour " +
    currentRound +
    " terminé";


  el("repsDisplay").hidden =
    true;

  el("finishRepsBtn").hidden =
    true;


  circuitWorkoutScreen.classList.remove(
    "phase-work",
    "phase-rest"
  );


  circuitWorkoutScreen.classList.add(
    "phase-round-rest"
  );


  soundRest();

  flash();


  beginCountdown(
    workout.roundRest
  );
}


/* =========================================================
   RÉPÉTITIONS TERMINÉES
========================================================= */

el("finishRepsBtn").addEventListener("click", function () {

  if (
    !workoutStarted ||
    workoutPaused ||
    phase !== "exercise"
  ) {
    return;
  }


  soundChange();

  flash();


  completeExercise();
});


/* =========================================================
   PAUSE CIRCUIT
========================================================= */

el("workoutPauseBtn").addEventListener("click", function () {

  if (
    !workoutStarted ||
    workoutPaused
  ) {
    return;
  }


  workoutPaused =
    true;


  pauseStartedAt =
    Date.now();


  if (
    workoutTimer
  ) {

    phaseRemaining =
      Math.max(
        0,
        (
          phaseEnd -
          Date.now()
        ) / 1000
      );


    clearInterval(
      workoutTimer
    );


    workoutTimer =
      null;
  }


  el("workoutPauseBtn").disabled =
    true;


  el("workoutResumeBtn").disabled =
    false;


  el("workoutPhase").dataset.previous =
    el("workoutPhase").textContent;


  el("workoutPhase").textContent =
    "PAUSE";


  circuitWorkoutScreen.classList.add(
    "phase-paused"
  );
});


/* =========================================================
   REPRENDRE CIRCUIT
========================================================= */

el("workoutResumeBtn").addEventListener("click", function () {

  if (
    !workoutPaused
  ) {
    return;
  }


  totalPauseTime +=
    Date.now() -
    pauseStartedAt;


  workoutPaused =
    false;


  el("workoutPauseBtn").disabled =
    false;


  el("workoutResumeBtn").disabled =
    true;


  const previous =
    el("workoutPhase").dataset.previous;


  if (
    previous
  ) {

    el("workoutPhase").textContent =
      previous;
  }


  circuitWorkoutScreen.classList.remove(
    "phase-paused"
  );


  const exercise =
    workout.exercises[
      currentExercise
    ];


  const needsTimer =
    phase !== "exercise" ||
    exercise.type === "time";


  if (
    needsTimer
  ) {

    phaseEnd =
      Date.now() +
      phaseRemaining * 1000;


    workoutTimer =
      setInterval(
        updateCountdown,
        100
      );


    updateCountdown();
  }
});


/* =========================================================
   RESET CIRCUIT
========================================================= */

el("workoutResetBtn").addEventListener("click", function () {

  const answer =
    confirm(
      "Recommencer le circuit depuis le début ?"
    );


  if (
    !answer
  ) {
    return;
  }


  prepareWorkout();
});


/* =========================================================
   QUITTER CIRCUIT
========================================================= */

el("quitWorkoutBtn").addEventListener("click", function () {

  const answer =
    confirm(
      "Quitter le circuit ? La séance ne sera pas enregistrée."
    );


  if (
    !answer
  ) {
    return;
  }


  clearInterval(
    workoutTimer
  );


  workoutTimer =
    null;


  showScreen(
    circuitSetupScreen
  );
});


/* =========================================================
   PROGRESSION
========================================================= */

function updateProgress() {

  if (
    !workout
  ) {
    return;
  }


  el("workoutExerciseProgress").textContent =
    (currentExercise + 1) +
    " / " +
    workout.exercises.length;


  el("workoutRoundProgress").textContent =
    currentRound +
    " / " +
    workout.rounds;


  el("completedExercises").textContent =
    completedExerciseCount;


  el("completedRounds").textContent =
    completedRoundCount;
}


/* =========================================================
   FIN CIRCUIT
========================================================= */

function finishWorkout() {

  clearInterval(
    workoutTimer
  );


  workoutTimer =
    null;


  let duration =
    Date.now() -
    sessionStartedAt -
    totalPauseTime;


  if (
    workoutPaused &&
    pauseStartedAt
  ) {

    duration -=
      Date.now() -
      pauseStartedAt;
  }


  duration =
    Math.max(
      1,
      Math.round(
        duration / 1000
      )
    );


  soundFinish();

  flash();


  saveCircuitWorkout(
    duration
  );


  el("completeRounds").textContent =
    completedRoundCount;


  el("completeExercises").textContent =
    completedExerciseCount;


  el("completeDuration").textContent =
    formatDuration(
      duration
    );


  showScreen(
    workoutCompleteScreen
  );
}


/* =========================================================
   ENREGISTRER CIRCUIT
========================================================= */

function saveCircuitWorkout(
  duration
) {

  const history =
    getHistory();


  /* =========================================================
   ROUTINE UTILISÉE POUR CETTE SÉANCE
========================================================= */

let selectedRoutine = null;

try {

  selectedRoutine =
    JSON.parse(
      localStorage.getItem(
        "nexusMoveSelectedRoutine"
      )
    );

} catch (error) {

  selectedRoutine = null;

}


/* =========================================================
   COPIE EXACTE DE LA ROUTINE AU MOMENT DE LA SÉANCE
========================================================= */

let routineSnapshot = null;

let routineVolume = 0;


if (
  selectedRoutine &&
  Array.isArray(
    selectedRoutine.exercises
  )
) {

  const repsPerRound =
    selectedRoutine.exercises.reduce(
      (total, exercise) => {

        return (
          total +
          Number(
            exercise.reps || 0
          )
        );

      },
      0
    );


  /*
    On utilise le nombre de tours
    réellement réalisés.
  */

  const actualRounds =
    Number(
      completedRoundCount ||
      selectedRoutine.rounds ||
      1
    );


  routineVolume =
    repsPerRound *
    actualRounds;


  routineSnapshot = {

    routineId:
      selectedRoutine.id,

    routineName:
      selectedRoutine.name,

    plannedRounds:
      Number(
        selectedRoutine.rounds || 1
      ),

    completedRounds:
      actualRounds,

    exercises:
      selectedRoutine.exercises.map(
        exercise => ({

          name:
            exercise.name,

          reps:
            Number(
              exercise.reps || 0
            )

        })
      ),

    repsPerRound,

    totalVolume:
      routineVolume

  };

}


history.unshift({

  id: Date.now(),

  type: "circuit",

  date:
    new Date().toISOString(),

  rounds:
    completedRoundCount,

  completedExercises:
    completedExerciseCount,

  duration,

  exercises:
    workout.exercises,


  /* ROUTINE UTILISÉE */

  routineId:
  selectedRoutine
    ? selectedRoutine.id
    : null,

routineName:
  selectedRoutine
    ? selectedRoutine.name
    : null,


/* Copie de la routine utilisée ce jour-là */

routineSnapshot:
  routineSnapshot,


/* Nombre total de répétitions réalisées */

routineVolume:
  routineVolume

});


  saveHistory(
    history
  );


  updateHomeStats();

   openWorkoutFeedback();
}

/* =========================================================
   PROGRESSION CHRONOMÈTRE
========================================================= */

function normalizeActivityName(name) {

  return String(name || "")
    .trim()
    .toLowerCase();
}


/* =========================================================
   CRÉER LES GROUPES COMPARABLES
========================================================= */

function getProgressGroups() {

  const history =
    getHistory();


  const groups =
    {};


  history.forEach(function (session) {

    /*
       Pour l'instant :
       progression uniquement sur les activités
       enregistrées avec le chronomètre.
    */

    if (
      session.type !== "chrono"
    ) {
      return;
    }


    const distance =
      Number(session.distance);


    const duration =
      Number(session.duration);


    if (
      !session.name ||
      !distance ||
      !duration
    ) {
      return;
    }


    const key =
      normalizeActivityName(session.name) +
      "|" +
      distance;


    if (!groups[key]) {

      groups[key] = {

        name:
          session.name,

        distance:
          distance,

        sessions:
          []

      };
    }


    groups[key].sessions.push(
      session
    );

  });


  /*
     On remet les séances dans
     l'ordre chronologique :
     ancienne -> récente
  */

  Object.values(groups).forEach(function (group) {

    group.sessions.sort(function (a, b) {

      return (
        new Date(a.date) -
        new Date(b.date)
      );

    });

  });


  return groups;
}


/* =========================================================
   CALCUL TENDANCE
========================================================= */

function calculateProgress(group) {

  const sessions =
    group.sessions;


  if (
    sessions.length < 2
  ) {
    return null;
  }


  const first =
    sessions[0];


  const latest =
    sessions[
      sessions.length - 1
    ];


  const previous =
    sessions[
      sessions.length - 2
    ];


  /*
     Pour une distance identique :
     moins de temps = meilleure performance
  */

  const difference =
    previous.duration -
    latest.duration;


  const percentage =
    (
      difference /
      previous.duration
    ) * 100;


  /*
     Zone stable :
     moins de 2 % d'écart.
  */

  let status;
  let label;


  if (
    percentage > 2
  ) {

    status =
      "up";

    label =
      "En progression ↗";

  } else if (
    percentage < -2
  ) {

    status =
      "down";

    label =
      "En recul ↘";

  } else {

    status =
      "stable";

    label =
      "Stable →";
  }


  /*
     Meilleur temps historique
  */

  const best =
    sessions.reduce(function (
      bestSession,
      session
    ) {

      if (
        session.duration <
        bestSession.duration
      ) {

        return session;
      }

      return bestSession;

    }, sessions[0]);


  /*
     Évolution depuis la toute
     première séance.
  */

  const globalEvolution =
    (
      (
        first.duration -
        latest.duration
      ) /
      first.duration
    ) * 100;


  return {

    latest:
      latest,

    previous:
      previous,

    best:
      best,

    status:
      status,

    label:
      label,

    percentage:
      percentage,

    globalEvolution:
      globalEvolution,

    sessionCount:
      sessions.length

  };
}


/* =========================================================
   AFFICHER PROGRESSION
========================================================= */

function renderProgression() {

  const container =
    el("progressList");


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  const groups =
    getProgressGroups();


  let displayed =
    0;


  Object.values(groups).forEach(function (group) {

    const progress =
      calculateProgress(group);


    /*
       Il faut au minimum
       deux séances comparables.
    */

    if (!progress) {
      return;
    }


    displayed++;


    const card =
      document.createElement(
        "article"
      );


    card.className =
      "progress-card";


    /* HEADER */

    const header =
      document.createElement(
        "div"
      );


    header.className =
      "progress-card-header";


    const titleZone =
      document.createElement(
        "div"
      );


    titleZone.className =
      "progress-card-title";


    const title =
      document.createElement(
        "strong"
      );


    title.textContent =
      group.name;


    const subtitle =
      document.createElement(
        "span"
      );


    subtitle.textContent =
      group.distance +
      " m • " +
      progress.sessionCount +
      " séances";


    titleZone.appendChild(
      title
    );


    titleZone.appendChild(
      subtitle
    );


    const trend =
      document.createElement(
        "div"
      );


    trend.className =
      "progress-trend " +
      progress.status;


    trend.textContent =
      progress.label;


    header.appendChild(
      titleZone
    );


    header.appendChild(
      trend
    );


    card.appendChild(
      header
    );


    /* VALEURS */

    const values =
      document.createElement(
        "div"
      );


    values.className =
      "progress-values";


    /* DERNIER */

    const latestBox =
      document.createElement(
        "div"
      );


    latestBox.className =
      "progress-value";


    const latestValue =
      document.createElement(
        "strong"
      );


    latestValue.textContent =
      formatDuration(
        progress.latest.duration
      );


    const latestLabel =
      document.createElement(
        "span"
      );


    latestLabel.textContent =
      "DERNIER";


    latestBox.appendChild(
      latestValue
    );


    latestBox.appendChild(
      latestLabel
    );


    /* PRÉCÉDENT */

    const previousBox =
      document.createElement(
        "div"
      );


    previousBox.className =
      "progress-value";


    const previousValue =
      document.createElement(
        "strong"
      );


    previousValue.textContent =
      formatDuration(
        progress.previous.duration
      );


    const previousLabel =
      document.createElement(
        "span"
      );


    previousLabel.textContent =
      "PRÉCÉDENT";


    previousBox.appendChild(
      previousValue
    );


    previousBox.appendChild(
      previousLabel
    );


    /* RECORD */

    const bestBox =
      document.createElement(
        "div"
      );


    bestBox.className =
      "progress-value";


    const bestValue =
      document.createElement(
        "strong"
      );


    bestValue.textContent =
      formatDuration(
        progress.best.duration
      );


    const bestLabel =
      document.createElement(
        "span"
      );


    bestLabel.textContent =
      "RECORD";


    bestBox.appendChild(
      bestValue
    );


    bestBox.appendChild(
      bestLabel
    );


    values.appendChild(
      latestBox
    );


    values.appendChild(
      previousBox
    );


    values.appendChild(
      bestBox
    );


    card.appendChild(
      values
    );


    /* ÉVOLUTION GLOBALE */

    const evolution =
      document.createElement(
        "div"
      );


    evolution.className =
      "progress-evolution";


    const global =
      progress.globalEvolution;


    if (
      global > 0
    ) {

      evolution.innerHTML =
        "Depuis la première séance : " +
        "<strong>+" +
        global.toFixed(1) +
        " %</strong>";

    } else if (
      global < 0
    ) {

      evolution.innerHTML =
        "Depuis la première séance : " +
        "<strong>" +
        global.toFixed(1) +
        " %</strong>";

    } else {

      evolution.innerHTML =
        "Depuis la première séance : " +
        "<strong>stable</strong>";
    }


    card.appendChild(
      evolution
    );


    container.appendChild(
      card
    );

  });


  /* AUCUNE COMPARAISON */

  if (
    displayed === 0
  ) {

    const empty =
      document.createElement(
        "div"
      );


    empty.className =
      "progress-empty";


    empty.textContent =
      "Il faut au moins deux séances avec la même activité et la même distance pour calculer ta progression.";


    container.appendChild(
      empty
    );
  }
}
/* =========================================================
   AFFICHAGE HISTORIQUE
========================================================= */

function renderHistory() {
renderProgression();
   renderRoutineProgression();
  const history =
    getHistory();


  const list =
    el("historyList");


  list.innerHTML =
    "";


  let exerciseTotal =
    0;

  let timeTotal =
    0;


  history.forEach(function (session) {

    exerciseTotal +=
      session.completedExercises || 0;


    timeTotal +=
      session.duration || 0;
  });


  el("historyWorkoutCount").textContent =
    history.length;


  el("historyExerciseCount").textContent =
    exerciseTotal;


  el("historyTotalTime").textContent =
    formatDuration(
      timeTotal
    );


  if (
    history.length === 0
  ) {

    const empty =
      document.createElement(
        "div"
      );


    empty.className =
      "empty-history";


    empty.innerHTML =
      `
        <div class="empty-history-icon">
          ◷
        </div>

        <h3>
          Aucun entraînement
        </h3>

        <p>
          Tes activités apparaîtront ici.
        </p>
      `;


    list.appendChild(
      empty
    );


    el("clearHistoryBtn").style.display =
      "none";


    return;
  }


  el("clearHistoryBtn").style.display =
    "block";


  history.forEach(function (session) {

    const date =
      new Date(
        session.date
      );


    const card =
      document.createElement(
        "article"
      );


    card.className =
      "history-item";


    const header =
      document.createElement(
        "div"
      );


    header.className =
      "history-item-header";


    const title =
      document.createElement(
        "strong"
      );


    if (
      session.type ===
      "chrono"
    ) {

      title.textContent =
        session.name ||
        "Activité";

    } else {

      title.textContent =
        "Circuit • " +
        session.rounds +
        (
          session.rounds > 1
            ? " tours"
            : " tour"
        );
    }


    const time =
      document.createElement(
        "span"
      );


    time.className =
      "history-date";


    time.textContent =
      date.toLocaleTimeString(
        "fr-FR",
        {
          hour:
            "2-digit",

          minute:
            "2-digit"
        }
      );


    header.appendChild(
      title
    );


    header.appendChild(
      time
    );


    const details =
      document.createElement(
        "div"
      );


    details.className =
      "history-item-details";


    const dateLine =
      document.createElement(
        "strong"
      );


    dateLine.textContent =
      date.toLocaleDateString(
        "fr-FR",
        {
          weekday:
            "long",

          day:
            "numeric",

          month:
            "long",

          year:
            "numeric"
        }
      );


    details.appendChild(
      dateLine
    );


    details.appendChild(
      document.createElement(
        "br"
      )
    );


    details.appendChild(
      document.createElement(
        "br"
      )
    );


    if (
      session.type ===
      "chrono"
    ) {

      const activity =
        document.createElement(
          "div"
        );


      activity.textContent =
        "Activité : " +
        session.name;


      details.appendChild(
        activity
      );


      const duration =
        document.createElement(
          "div"
        );


      duration.textContent =
        "Durée : " +
        formatDuration(
          session.duration
        );


      details.appendChild(
        duration
      );

    } else {


      session.exercises.forEach(function (exercise) {

        const line =
          document.createElement(
            "div"
          );


        if (
          exercise.type ===
          "time"
        ) {

          line.textContent =
            exercise.name +
            " — " +
            exercise.value +
            " s";

        } else {

          line.textContent =
            exercise.name +
            " — " +
            exercise.value +
            " répétitions";
        }


        details.appendChild(
          line
        );
      });


      details.appendChild(
        document.createElement(
          "br"
        )
      );


      const duration =
        document.createElement(
          "div"
        );


      duration.textContent =
        "Durée : " +
        formatDuration(
          session.duration
        );


      details.appendChild(
        duration
      );
    }


    card.appendChild(
      header
    );


    card.appendChild(
      details
    );


    list.appendChild(
      card
    );
  });
}


/* =========================================================
   EFFACER HISTORIQUE
========================================================= */

el("clearHistoryBtn").addEventListener("click", function () {

  const answer =
    confirm(
      "Effacer tout l'historique ?"
    );


  if (
    !answer
  ) {
    return;
  }


  localStorage.removeItem(
    HISTORY_KEY
  );


  renderHistory();

  updateHomeStats();
});


/* =========================================================
   STATS ACCUEIL
========================================================= */

function updateHomeStats() {

  const history =
    getHistory();


  let exercisesTotal =
    0;

  let timeTotal =
    0;


  history.forEach(function (session) {

    exercisesTotal +=
      session.completedExercises || 0;


    timeTotal +=
      session.duration || 0;
  });


  el("homeWorkoutCount").textContent =
    history.length;


  el("homeExerciseCount").textContent =
    exercisesTotal;


  el("homeTotalTime").textContent =
    formatDuration(
      timeTotal
    );
}


/* =========================================================
   CONNEXION ROUTINES → CIRCUIT
========================================================= */

document.addEventListener(
  "nexusLoadRoutine",
  function(event) {

    const routine =
      event.detail;

    if (
      !routine ||
      !Array.isArray(routine.exercises) ||
      routine.exercises.length === 0
    ) {
      return;
    }

    const newExercises =
      routine.exercises.map(
        function(exercise, index) {

          return {
            id: Date.now() + index,
            name: exercise.name,
            type: "reps",
            value: Number(exercise.reps)
          };

        }
      );

    if (
      newExercises.some(exercise =>
        !exercise.name ||
        !Number.isFinite(exercise.value) ||
        exercise.value < 1
      )
    ) {
      return;
    }

    exercises = newExercises;

    el("roundCount").value =
      routine.rounds;

    renderExercises();

    showScreen(
      circuitSetupScreen
    );

    routine.loaded = true;

  }
);

/* =========================================================
   INITIALISATION
========================================================= */

renderExercises();

updateHomeStats();

showScreen(
  homeScreen
);


});


/* =========================================================
   HISTORIQUE — SPORT DU MATIN
========================================================= */

function getMorningSessions() {

  let sessions = [];

  // Cherche automatiquement l'historique dans le localStorage
  for (let i = 0; i < localStorage.length; i++) {

    const key = localStorage.key(i);

    try {

      const data =
        JSON.parse(localStorage.getItem(key));

      if (!Array.isArray(data)) {
        continue;
      }

      const chronoSessions =
        data.filter(item =>
          item &&
          (
            item.type === "chrono" ||
            item.activity ||
            item.activite
          ) &&
          (
            item.duration ||
            item.duree
          ) &&
          item.date
        );

      if (chronoSessions.length > sessions.length) {
        sessions = chronoSessions;
      }

    } catch (error) {
      // On ignore les données qui ne sont pas de l'historique
    }

  }


  return sessions
    .map(session => {

      return {
        ...session,

        duration:
          Number(
            session.duration ||
            session.duree ||
            0
          )
      };

    })
    .filter(session =>
      session.duration > 0
    )
    .sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    );
}


/* =========================================================
   DATE
========================================================= */

function morningDateKey(date) {

  const d = new Date(date);

  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}


/* =========================================================
   LUNDI DE LA SEMAINE
========================================================= */

function morningMonday() {

  const date = new Date();

  date.setHours(0, 0, 0, 0);

  const day = date.getDay();

  const diff =
    day === 0
      ? -6
      : 1 - day;

  date.setDate(
    date.getDate() + diff
  );

  return date;
}


/* =========================================================
   FORMAT DURÉE
========================================================= */

function morningFormatTotal(seconds) {

  const minutes =
    Math.floor(seconds / 60);

  const hours =
    Math.floor(minutes / 60);

  const restMinutes =
    minutes % 60;


  if (hours > 0) {

    return (
      hours +
      " h " +
      restMinutes +
      " min"
    );

  }

  return minutes + " min";
}


/* =========================================================
   CETTE SEMAINE
========================================================= */

function renderMorningWeek(sessions) {

  const monday =
    morningMonday();

  const activeDays =
    new Set();

  let totalDuration = 0;


  sessions.forEach(session => {

    const sessionDate =
      new Date(session.date);

    sessionDate.setHours(0, 0, 0, 0);


    const endWeek =
      new Date(monday);

    endWeek.setDate(
      endWeek.getDate() + 7
    );


    if (
      sessionDate >= monday &&
      sessionDate < endWeek
    ) {

      activeDays.add(
        morningDateKey(sessionDate)
      );

      totalDuration +=
        session.duration;

    }

  });


  const todayKey =
    morningDateKey(new Date());


  for (let i = 0; i < 7; i++) {

    const date =
      new Date(monday);

    date.setDate(
      date.getDate() + i
    );


    const dot =
      document.getElementById(
        "morning-day-" + (i + 1)
      );


    if (!dot) continue;


    dot.classList.remove(
      "active",
      "today"
    );


    const key =
      morningDateKey(date);


    if (activeDays.has(key)) {
      dot.classList.add("active");
    }


    if (key === todayKey) {
      dot.classList.add("today");
    }
  }


  const count =
    activeDays.size;


  const countElement =
    document.getElementById(
      "morningWeekCount"
    );


  if (countElement) {

    countElement.textContent =
      count === 1
        ? "1 séance"
        : count + " séances";
  }


  const summary =
    document.getElementById(
      "morningWeekSummary"
    );


  if (summary) {

    if (count === 0) {

      summary.textContent =
        "Aucune séance cette semaine";

    } else {

      summary.textContent =
        count +
        " jour" +
        (count > 1 ? "s" : "") +
        " actif" +
        (count > 1 ? "s" : "") +
        " • " +
        morningFormatTotal(totalDuration) +
        " d'entraînement";
    }
  }
}


/* =========================================================
   SÉRIE DE JOURS CONSÉCUTIFS
========================================================= */

function getMorningStreak(sessions) {

  const days =
    [
      ...new Set(
        sessions.map(session =>
          morningDateKey(session.date)
        )
      )
    ]
    .map(date =>
      new Date(date + "T12:00:00")
    )
    .sort((a, b) => b - a);


  if (!days.length) {
    return 0;
  }


  const today =
    new Date();

  today.setHours(12, 0, 0, 0);


  const yesterday =
    new Date(today);

  yesterday.setDate(
    yesterday.getDate() - 1
  );


  const last =
    morningDateKey(days[0]);


  if (
    last !== morningDateKey(today) &&
    last !== morningDateKey(yesterday)
  ) {
    return 0;
  }


  let streak = 1;


  for (let i = 1; i < days.length; i++) {

    const diff =
      Math.round(
        (days[i - 1] - days[i]) /
        86400000
      );


    if (diff === 1) {

      streak++;

    } else {

      break;
    }
  }


  return streak;
}


/* =========================================================
   MESSAGE VARIABLE
========================================================= */

function morningRandomMessage(messages) {

  const date =
    new Date();

  const index =
    (
      date.getDate() +
      date.getMonth()
    ) %
    messages.length;


  return messages[index];
}


/* =========================================================
   MA DYNAMIQUE
========================================================= */

function renderMorningDynamic(sessions) {

  const icon =
    document.getElementById(
      "morningDynamicIcon"
    );

  const title =
    document.getElementById(
      "morningDynamicTitle"
    );

  const text =
    document.getElementById(
      "morningDynamicText"
    );


  if (!icon || !title || !text) {
    return;
  }


  if (!sessions.length) {

    icon.textContent = "🌱";

    title.textContent =
      "On commence";

    text.textContent =
      "Ta prochaine séance apparaîtra ici.";

    return;
  }


  const streak =
    getMorningStreak(sessions);


  if (streak >= 5) {

    icon.textContent = "🏆";

    title.textContent =
      streak + " jours de suite";

    text.textContent =
      morningRandomMessage([
        "Ta routine est vraiment en train de s'installer.",
        "Belle régularité. Continue sur cette lancée.",
        "Ces petites séances répétées commencent à compter.",
        "Tu construis une vraie habitude."
      ]);

    return;
  }


  if (streak >= 2) {

    icon.textContent = "🔥";

    title.textContent =
      "Bonne dynamique";

    text.textContent =
      morningRandomMessage([
        streak + " matins de suite. Continue comme ça !",
        streak + " jours consécutifs. La dynamique est bonne.",
        streak + " matins actifs. La régularité s'installe.",
        streak + " séances d'affilée avant le travail. Beau rythme."
      ]);

    return;
  }


  const lastSession =
    sessions[sessions.length - 1];


  if (
    morningDateKey(lastSession.date) ===
    morningDateKey(new Date())
  ) {

    icon.textContent = "✅";

    title.textContent =
      "Séance faite";

    text.textContent =
      morningRandomMessage([
        "Séance du matin validée.",
        "Encore un matin où tu as pris le temps de bouger.",
        "Petit entraînement terminé avant le travail.",
        "Une séance de plus dans ta routine."
      ]);

  } else {

    icon.textContent = "🌱";

    title.textContent =
      "On continue";

    text.textContent =
      morningRandomMessage([
        "Une nouvelle séance suffit pour relancer la dynamique.",
        "La régularité se construit séance après séance.",
        "Pas besoin d'être parfait. Il suffit de revenir.",
        "La prochaine séance relancera la série."
      ]);
  }
}


/* =========================================================
   COURBE
========================================================= */

function renderMorningChart(sessions) {

  const chart =
    document.getElementById(
      "morningChart"
    );


  if (!chart) {
    return;
  }


  const data =
    sessions.slice(-7);


  if (data.length < 2) {

    chart.innerHTML =
      '<div class="morning-chart-empty">' +
      "Il faut au moins deux séances pour afficher la courbe." +
      "</div>";

    return;
  }


  const width = 320;
  const height = 170;

  const left = 20;
  const right = 20;
  const top = 25;
  const bottom = 35;


  const durations =
    data.map(session =>
      session.duration
    );


  let min =
    Math.min(...durations);

  let max =
    Math.max(...durations);


  if (min === max) {
    min -= 60;
    max += 60;
  }


  min =
    Math.max(0, min - 30);

  max += 30;


  const usableWidth =
    width - left - right;

  const usableHeight =
    height - top - bottom;


  const points =
    data.map((session, index) => {

      const x =
        left +
        (
          index /
          (data.length - 1)
        ) *
        usableWidth;


      const ratio =
        (
          session.duration - min
        ) /
        (
          max - min
        );


      const y =
        top +
        usableHeight -
        ratio * usableHeight;


      return {
        x,
        y,
        session
      };
    });


  const polyline =
    points
      .map(point =>
        point.x + "," + point.y
      )
      .join(" ");


  const labels =
    points
      .map(point => {

        const date =
          new Date(
            point.session.date
          );


        const dateText =
          date.toLocaleDateString(
            "fr-FR",
            {
              day: "numeric",
              month: "short"
            }
          );


        const minutes =
          Math.round(
            point.session.duration / 60
          );


        return `
          <text
            x="${point.x}"
            y="${height - 10}"
            class="morning-chart-label"
          >
            ${dateText}
          </text>

          <text
            x="${point.x}"
            y="${Math.max(12, point.y - 12)}"
            class="morning-chart-value"
          >
            ${minutes} min
          </text>

          <circle
            cx="${point.x}"
            cy="${point.y}"
            r="5"
            class="morning-chart-point"
          />
        `;
      })
      .join("");


  chart.innerHTML = `

    <svg
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="none"
    >

      <line
        x1="${left}"
        x2="${width - right}"
        y1="${top}"
        y2="${top}"
        class="morning-chart-grid"
      />

      <line
        x1="${left}"
        x2="${width - right}"
        y1="${top + usableHeight / 2}"
        y2="${top + usableHeight / 2}"
        class="morning-chart-grid"
      />

      <line
        x1="${left}"
        x2="${width - right}"
        y1="${top + usableHeight}"
        y2="${top + usableHeight}"
        class="morning-chart-grid"
      />

      <polyline
        points="${polyline}"
        class="morning-chart-line"
      />

      ${labels}

    </svg>
  `;
}

/* =========================================================
   MES RECORDS
========================================================= */

function renderMorningRecords(sessions) {

  if (!sessions.length) {
    return;
  }


  /* -------------------------
     MEILLEURE SÉRIE
  ------------------------- */

  const uniqueDays =
    [
      ...new Set(
        sessions.map(session =>
          morningDateKey(session.date)
        )
      )
    ]
    .sort();


  let bestStreak = 1;
  let currentStreak = 1;


  for (let i = 1; i < uniqueDays.length; i++) {

    const previous =
      new Date(
        uniqueDays[i - 1] + "T12:00:00"
      );

    const current =
      new Date(
        uniqueDays[i] + "T12:00:00"
      );


    const difference =
      Math.round(
        (current - previous) /
        86400000
      );


    if (difference === 1) {

      currentStreak++;

      bestStreak =
        Math.max(
          bestStreak,
          currentStreak
        );

    } else {

      currentStreak = 1;

    }

  }


  /* -------------------------
     MEILLEURE SEMAINE
  ------------------------- */

  const weeks = {};


  sessions.forEach(session => {

    const date =
      new Date(session.date);

    const monday =
      new Date(date);

    const day =
      monday.getDay();

    const diff =
      day === 0
        ? -6
        : 1 - day;

    monday.setDate(
      monday.getDate() + diff
    );

    const key =
      morningDateKey(monday);


    if (!weeks[key]) {
      weeks[key] = new Set();
    }


    weeks[key].add(
      morningDateKey(date)
    );

  });


  let bestWeek = 0;


  Object.values(weeks).forEach(days => {

    bestWeek =
      Math.max(
        bestWeek,
        days.size
      );

  });


  /* -------------------------
     MOIS EN COURS
  ------------------------- */

  const now =
    new Date();


  const monthSessions =
    sessions.filter(session => {

      const date =
        new Date(session.date);

      return (
        date.getMonth() ===
        now.getMonth() &&
        date.getFullYear() ===
        now.getFullYear()
      );

    });


  const monthDays =
    new Set(
      monthSessions.map(session =>
        morningDateKey(session.date)
      )
    );


  const monthTime =
    monthSessions.reduce(
      (total, session) =>
        total + session.duration,
      0
    );


  /* -------------------------
     AFFICHAGE
  ------------------------- */

  const streakElement =
    document.getElementById(
      "recordBestStreak"
    );

  const weekElement =
    document.getElementById(
      "recordBestWeek"
    );

  const monthSessionsElement =
    document.getElementById(
      "recordMonthSessions"
    );

  const monthTimeElement =
    document.getElementById(
      "recordMonthTime"
    );


  if (streakElement) {
    streakElement.textContent =
      bestStreak;
  }


  if (weekElement) {
    weekElement.textContent =
      bestWeek;
  }


  if (monthSessionsElement) {
    monthSessionsElement.textContent =
      monthDays.size;
  }


  if (monthTimeElement) {
    monthTimeElement.textContent =
      morningFormatTotal(
        monthTime
      );
  }

}
/* =========================================================
   TOUT AFFICHER
========================================================= */

function renderMorningDashboard() {

  const sessions =
    getMorningSessions();

  renderMorningDynamic(sessions);

  renderMorningWeek(sessions);

  renderMorningChart(sessions);

  renderMorningRecords(sessions);
}

/* =========================================================
   LANCEMENT
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  renderMorningDashboard
);


/* =========================================================
   NEXUS MOVE — MES ROUTINES
========================================================= */

const ROUTINES_STORAGE_KEY =
  "nexusMoveRoutines";


let nexusRoutines = [];

let routineEditingId = null;

let routineRounds = 3;

let selectedRoutineId = null;


/* =========================================================
   ÉLÉMENTS
========================================================= */

const routinesList =
  document.getElementById(
    "routinesList"
  );

const routinesEmpty =
  document.getElementById(
    "routinesEmpty"
  );

const routineEditor =
  document.getElementById(
    "routineEditor"
  );

const routineEditorTitle =
  document.getElementById(
    "routineEditorTitle"
  );

const routineNameInput =
  document.getElementById(
    "routineNameInput"
  );

const routineRoundsValue =
  document.getElementById(
    "routineRoundsValue"
  );

const routineExercisesList =
  document.getElementById(
    "routineExercisesList"
  );

const routineSelected =
  document.getElementById(
    "routineSelected"
  );

const selectedRoutineName =
  document.getElementById(
    "selectedRoutineName"
  );

const selectedRoutineInfo =
  document.getElementById(
    "selectedRoutineInfo"
  );

const selectedRoutineExercises =
  document.getElementById(
    "selectedRoutineExercises"
  );


/* =========================================================
   CHARGEMENT
========================================================= */

function loadNexusRoutines() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          ROUTINES_STORAGE_KEY
        )
      );

    nexusRoutines =
      Array.isArray(saved)
        ? saved
        : [];

  } catch (error) {

    nexusRoutines = [];

  }

}


/* =========================================================
   SAUVEGARDE
========================================================= */

function saveNexusRoutines() {

  localStorage.setItem(
    ROUTINES_STORAGE_KEY,
    JSON.stringify(nexusRoutines)
  );

}


/* =========================================================
   ID
========================================================= */

function createRoutineId() {

  return (
    "routine-" +
    Date.now() +
    "-" +
    Math.floor(
      Math.random() * 10000
    )
  );

}


/* =========================================================
   AFFICHER LES ROUTINES
========================================================= */

function renderNexusRoutines() {

  if (!routinesList) {
    return;
  }


  routinesList
    .querySelectorAll(
      ".routine-card"
    )
    .forEach(card =>
      card.remove()
    );


  if (!nexusRoutines.length) {

    if (routinesEmpty) {

      routinesEmpty.classList.remove(
        "hidden"
      );

    }

    return;

  }


  if (routinesEmpty) {

    routinesEmpty.classList.add(
      "hidden"
    );

  }


  nexusRoutines.forEach(routine => {

    const card =
      document.createElement(
        "div"
      );

    card.className =
      "routine-card";


    const exerciseCount =
      routine.exercises.length;


    card.innerHTML = `

      <div class="routine-card-top">

        <div>

          <div class="routine-card-name">
            ${escapeRoutineText(
              routine.name
            )}
          </div>

          <div class="routine-card-meta">

            ${routine.rounds}
            tour${
              routine.rounds > 1
                ? "s"
                : ""
            }

            •

            ${exerciseCount}
            exercice${
              exerciseCount > 1
                ? "s"
                : ""
            }

          </div>

        </div>

      </div>


      <div class="routine-card-actions">

        <button
          class="routine-card-btn select"
          type="button"
        >
          Choisir
        </button>

        <button
          class="routine-card-btn edit"
          type="button"
        >
          Modifier
        </button>

        <button
          class="routine-card-btn delete"
          type="button"
        >
          ×
        </button>

      </div>

    `;


    card
      .querySelector(
        ".select"
      )
      .addEventListener(
        "click",
        () =>
          selectNexusRoutine(
            routine.id
          )
      );


    card
      .querySelector(
        ".edit"
      )
      .addEventListener(
        "click",
        () =>
          editNexusRoutine(
            routine.id
          )
      );


    card
      .querySelector(
        ".delete"
      )
      .addEventListener(
        "click",
        () =>
          deleteNexusRoutine(
            routine.id
          )
      );


    routinesList.appendChild(
      card
    );

  });

}


/* =========================================================
   ÉCHAPPER TEXTE
========================================================= */

function escapeRoutineText(value) {

  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================================================
   OUVRIR L'ÉDITEUR
========================================================= */

function openNewRoutineEditor() {

  routineEditingId = null;

  routineRounds = 3;


  if (routineEditorTitle) {

    routineEditorTitle.textContent =
      "Nouvelle routine";

  }


  if (routineNameInput) {

    routineNameInput.value = "";

  }


  updateRoutineRounds();


  if (routineExercisesList) {

    routineExercisesList.innerHTML =
      "";

  }


  /*
    On crée directement
    5 lignes pour ta routine du matin.
  */

  addRoutineExercise(
    "Squat",
    10
  );

  addRoutineExercise(
    "Pompes",
    10
  );

  addRoutineExercise(
    "Abdos côté",
    10
  );

  addRoutineExercise(
    "Squat côté",
    10
  );

  addRoutineExercise(
    "Bras au sol / bras levé",
    10
  );


  if (routineEditor) {

    routineEditor.classList.remove(
      "hidden"
    );

  }

}


/* =========================================================
   FERMER ÉDITEUR
========================================================= */

function closeRoutineEditor() {

  if (routineEditor) {

    routineEditor.classList.add(
      "hidden"
    );

  }

}


/* =========================================================
   AJOUTER EXERCICE
========================================================= */

function addRoutineExercise(
  name = "",
  reps = 10
) {

  if (!routineExercisesList) {
    return;
  }


  const row =
    document.createElement(
      "div"
    );


  row.className =
    "routine-exercise-row";


  row.innerHTML = `

    <input
      class="routine-exercise-name"
      type="text"
      maxlength="50"
      placeholder="Exercice"
      value="${escapeRoutineText(name)}"
    >

    <input
      class="routine-exercise-reps"
      type="number"
      min="1"
      max="999"
      value="${Number(reps) || 10}"
      aria-label="Répétitions"
    >

    <button
      class="routine-exercise-remove"
      type="button"
      aria-label="Supprimer l'exercice"
    >
      ×
    </button>

  `;


  row
    .querySelector(
      ".routine-exercise-remove"
    )
    .addEventListener(
      "click",
      () =>
        row.remove()
    );


  routineExercisesList.appendChild(
    row
  );

}


/* =========================================================
   TOURS
========================================================= */

function updateRoutineRounds() {

  routineRounds =
    Math.max(
      1,
      Math.min(
        20,
        routineRounds
      )
    );


  if (routineRoundsValue) {

    routineRoundsValue.textContent =
      routineRounds;

  }

}


/* =========================================================
   ENREGISTRER
========================================================= */

function saveRoutineFromEditor() {

  if (!routineNameInput) {
    return;
  }


  const name =
    routineNameInput
      .value
      .trim();


  if (!name) {

    alert(
      "Donne un nom à la routine."
    );

    return;

  }


  const rows =
    routineExercisesList
      ? [
          ...routineExercisesList
            .querySelectorAll(
              ".routine-exercise-row"
            )
        ]
      : [];


  const exercises =
    rows
      .map(row => {

        const nameInput =
          row.querySelector(
            ".routine-exercise-name"
          );

        const repsInput =
          row.querySelector(
            ".routine-exercise-reps"
          );


        return {

          name:
            nameInput
              .value
              .trim(),

          reps:
            Math.max(
              1,
              Number(
                repsInput.value
              ) || 1
            )

        };

      })
      .filter(exercise =>
        exercise.name
      );


  if (!exercises.length) {

    alert(
      "Ajoute au moins un exercice."
    );

    return;

  }


  if (routineEditingId) {

    const routine =
      nexusRoutines.find(item =>
        item.id ===
        routineEditingId
      );


    if (routine) {

      routine.name =
        name;

      routine.rounds =
        routineRounds;

      routine.exercises =
        exercises;

    }

  } else {

    nexusRoutines.push({

      id:
        createRoutineId(),

      name,

      rounds:
        routineRounds,

      exercises,

      createdAt:
        new Date()
          .toISOString()

    });

  }


  saveNexusRoutines();

  renderNexusRoutines();

  closeRoutineEditor();

}


/* =========================================================
   MODIFIER
========================================================= */

function editNexusRoutine(id) {

  const routine =
    nexusRoutines.find(item =>
      item.id === id
    );


  if (!routine) {
    return;
  }


  routineEditingId =
    routine.id;


  routineRounds =
    routine.rounds;


  if (routineEditorTitle) {

    routineEditorTitle.textContent =
      "Modifier la routine";

  }


  if (routineNameInput) {

    routineNameInput.value =
      routine.name;

  }


  updateRoutineRounds();


  if (routineExercisesList) {

    routineExercisesList.innerHTML =
      "";

  }


  routine.exercises.forEach(
    exercise => {

      addRoutineExercise(
        exercise.name,
        exercise.reps
      );

    }
  );


  if (routineEditor) {

    routineEditor.classList.remove(
      "hidden"
    );

  }

}


/* =========================================================
   SUPPRIMER
========================================================= */

function deleteNexusRoutine(id) {

  const routine =
    nexusRoutines.find(item =>
      item.id === id
    );


  if (!routine) {
    return;
  }


  const confirmed =
    confirm(
      'Supprimer "' +
      routine.name +
      '" ?'
    );


  if (!confirmed) {
    return;
  }


  nexusRoutines =
    nexusRoutines.filter(item =>
      item.id !== id
    );


  if (
    selectedRoutineId === id
  ) {

    selectedRoutineId =
      null;


    if (routineSelected) {

      routineSelected.classList.add(
        "hidden"
      );

    }

  }


  saveNexusRoutines();

  renderNexusRoutines();

}


/* =========================================================
   CHOISIR
========================================================= */

function selectNexusRoutine(id) {

  const routine =
    nexusRoutines.find(item =>
      item.id === id
    );


  if (!routine) {
    return;
  }


  selectedRoutineId =
    routine.id;


  if (selectedRoutineName) {

    selectedRoutineName.textContent =
      routine.name;

  }


  const totalRepsPerRound =
    routine.exercises.reduce(
      (total, exercise) =>
        total +
        Number(exercise.reps),
      0
    );


  const totalReps =
    totalRepsPerRound *
    routine.rounds;


  if (selectedRoutineInfo) {

    selectedRoutineInfo.textContent =
      routine.rounds +
      " tours • " +
      routine.exercises.length +
      " exercices • " +
      totalReps +
      " répétitions au total";

  }


  if (selectedRoutineExercises) {

    selectedRoutineExercises.innerHTML =
      "";


    routine.exercises.forEach(
      exercise => {

        const row =
          document.createElement(
            "div"
          );


        row.className =
          "selected-routine-exercise";


        row.innerHTML = `

          <span>
            ${escapeRoutineText(
              exercise.name
            )}
          </span>

          <strong>
            × ${exercise.reps}
          </strong>

        `;


        selectedRoutineExercises
          .appendChild(
            row
          );

      }
    );

  }


  if (routineSelected) {

    routineSelected.classList.remove(
      "hidden"
    );

  }

}


/* =========================================================
   UTILISER ROUTINE
========================================================= */

function useSelectedNexusRoutine() {

  const routine =
    nexusRoutines.find(item =>
      item.id === selectedRoutineId
    );

  if (!routine) {

    alert(
      "Choisis d'abord une routine."
    );

    return;
  }

  /* COPIE DE LA ROUTINE */

  const routineToLoad =
    JSON.parse(
      JSON.stringify(routine)
    );

  /* ENVOYER AU CIRCUIT */

  document.dispatchEvent(
    new CustomEvent(
      "nexusLoadRoutine",
      {
        detail: routineToLoad
      }
    )
  );

  /* VÉRIFIER LE CHARGEMENT */

  if (!routineToLoad.loaded) {

    alert(
      "Impossible de charger la routine."
    );

    return;
  }

  /* MÉMORISER LA ROUTINE */

  delete routineToLoad.loaded;

  localStorage.setItem(
    "nexusMoveSelectedRoutine",
    JSON.stringify(routineToLoad)
  );

  window.nexusMoveSelectedRoutine =
    routineToLoad;

  alert(
    routine.name +
    " chargée dans le circuit."
  );

}


/* =========================================================
   ÉVÉNEMENTS
========================================================= */

const openRoutineCreatorBtn =
  document.getElementById(
    "openRoutineCreatorBtn"
  );


if (openRoutineCreatorBtn) {

  openRoutineCreatorBtn
    .addEventListener(
      "click",
      openNewRoutineEditor
    );

}


const closeRoutineEditorBtn =
  document.getElementById(
    "closeRoutineEditorBtn"
  );


if (closeRoutineEditorBtn) {

  closeRoutineEditorBtn
    .addEventListener(
      "click",
      closeRoutineEditor
    );

}


const cancelRoutineBtn =
  document.getElementById(
    "cancelRoutineBtn"
  );


if (cancelRoutineBtn) {

  cancelRoutineBtn
    .addEventListener(
      "click",
      closeRoutineEditor
    );

}


const addRoutineExerciseBtn =
  document.getElementById(
    "addRoutineExerciseBtn"
  );


if (addRoutineExerciseBtn) {

  addRoutineExerciseBtn
    .addEventListener(
      "click",
      () =>
        addRoutineExercise()
    );

}


const routineRoundsMinus =
  document.getElementById(
    "routineRoundsMinus"
  );


if (routineRoundsMinus) {

  routineRoundsMinus
    .addEventListener(
      "click",
      () => {

        routineRounds--;

        updateRoutineRounds();

      }
    );

}


const routineRoundsPlus =
  document.getElementById(
    "routineRoundsPlus"
  );


if (routineRoundsPlus) {

  routineRoundsPlus
    .addEventListener(
      "click",
      () => {

        routineRounds++;

        updateRoutineRounds();

      }
    );

}


const saveRoutineBtn =
  document.getElementById(
    "saveRoutineBtn"
  );


if (saveRoutineBtn) {

  saveRoutineBtn
    .addEventListener(
      "click",
      saveRoutineFromEditor
    );

}


const useRoutineBtn =
  document.getElementById(
    "useRoutineBtn"
  );


if (useRoutineBtn) {

  useRoutineBtn
    .addEventListener(
      "click",
      useSelectedNexusRoutine
    );

}


/* =========================================================
   INITIALISATION
========================================================= */

loadNexusRoutines();

renderNexusRoutines();

/* =========================================================
   PROGRESSION DES ROUTINES
========================================================= */

/* =========================================================
   PROGRESSION DES ROUTINES
========================================================= */

function renderRoutineProgression() {

  const progressList =
    document.getElementById(
      "progressList"
    );


  if (!progressList) {
    return;
  }


  let history = [];


  try {

    history =
      JSON.parse(
        localStorage.getItem(
          "nexusMoveHistory"
        )
      ) || [];

  } catch (error) {

    return;

  }


  /* =====================================================
     UNIQUEMENT LES ROUTINES
  ===================================================== */

  const routineSessions =
    history.filter(session =>

      session &&

      session.type === "circuit" &&

      session.routineId &&

      Number(
        session.duration
      ) > 0

    );


  if (!routineSessions.length) {
    return;
  }


  /* =====================================================
     GROUPER PAR ROUTINE
  ===================================================== */

  const groups = {};


  routineSessions.forEach(
    session => {

      const key =
        session.routineId;


      if (!groups[key]) {

        groups[key] = [];

      }


      groups[key].push(
        session
      );

    }
  );


  /* =====================================================
     UNE CARTE PAR ROUTINE
  ===================================================== */

  Object.values(groups)
    .forEach(sessions => {


      sessions.sort(
        (a, b) =>
          new Date(a.date) -
          new Date(b.date)
      );


      if (sessions.length < 2) {
        return;
      }


      const previous =
        sessions[
          sessions.length - 2
        ];


      const latest =
        sessions[
          sessions.length - 1
        ];


      /* =================================================
         DURÉE
      ================================================= */

      const previousDuration =
        Number(
          previous.duration || 0
        );


      const latestDuration =
        Number(
          latest.duration || 0
        );


      /* =================================================
         VOLUME
      ================================================= */

      const previousVolume =
        getRoutineSessionVolume(
          previous
        );


      const latestVolume =
        getRoutineSessionVolume(
          latest
        );


      /* =================================================
         EFFICACITÉ
         répétitions par minute
      ================================================= */

      const previousEfficiency =
        previousDuration > 0
          ? previousVolume /
            (
              previousDuration / 60
            )
          : 0;


      const latestEfficiency =
        latestDuration > 0
          ? latestVolume /
            (
              latestDuration / 60
            )
          : 0;


      /* =================================================
         VARIATIONS %
      ================================================= */

      const volumeChange =
        previousVolume > 0
          ? (
              (
                latestVolume -
                previousVolume
              ) /
              previousVolume
            ) * 100
          : 0;


      const efficiencyChange =
        previousEfficiency > 0
          ? (
              (
                latestEfficiency -
                previousEfficiency
              ) /
              previousEfficiency
            ) * 100
          : 0;


      /* =================================================
         ANALYSE
      ================================================= */

      let icon = "→";

      let status =
        "progress-stable";

      let message =
        "Ton niveau reste stable.";


      /* -------------------------------------------------
         PLUS DE VOLUME + PLUS EFFICACE
      ------------------------------------------------- */

      if (
        volumeChange > 2 &&
        efficiencyChange > 2
      ) {

        icon = "↗";

        status =
          "progress-up";

        message =
          "Tu fais plus de travail et tu es aussi plus efficace.";

      }


      /* -------------------------------------------------
         PLUS DE VOLUME, EFFICACITÉ STABLE
      ------------------------------------------------- */

      else if (
        volumeChange > 2 &&
        efficiencyChange >= -2
      ) {

        icon = "↗";

        status =
          "progress-up";

        message =
          "Tu réalises davantage de travail tout en gardant ton rythme.";

      }


      /* -------------------------------------------------
         PLUS DE VOLUME MAIS PLUS LENT
      ------------------------------------------------- */

      else if (
        volumeChange > 2
      ) {

        icon = "↗";

        status =
          "progress-up";

        message =
          "Ton volume augmente. C'est une progression de charge, même si la séance est plus longue.";

      }


      /* -------------------------------------------------
         MÊME VOLUME MAIS PLUS EFFICACE
      ------------------------------------------------- */

      else if (
        Math.abs(
          volumeChange
        ) <= 2 &&
        efficiencyChange > 2
      ) {

        icon = "↗";

        status =
          "progress-up";

        message =
          "Même travail, mais réalisé plus efficacement.";

      }


      /* -------------------------------------------------
         STABLE
      ------------------------------------------------- */

      else if (
        Math.abs(
          volumeChange
        ) <= 2 &&
        Math.abs(
          efficiencyChange
        ) <= 2
      ) {

        icon = "→";

        status =
          "progress-stable";

        message =
          "Volume et rythme sont stables.";

      }


      /* -------------------------------------------------
         VOLUME PLUS FAIBLE
      ------------------------------------------------- */

      else if (
        volumeChange < -2
      ) {

        icon = "→";

        status =
          "progress-stable";

        message =
          "Le volume de cette séance était plus faible. On évite de comparer directement les temps.";

      }


      /* =================================================
         RECORD D'EFFICACITÉ
      ================================================= */

      let bestEfficiency = 0;


      sessions.forEach(
        session => {

          const duration =
            Number(
              session.duration || 0
            );


          const volume =
            getRoutineSessionVolume(
              session
            );


          if (
            duration <= 0 ||
            volume <= 0
          ) {

            return;

          }


          const efficiency =
            volume /
            (
              duration / 60
            );


          bestEfficiency =
            Math.max(
              bestEfficiency,
              efficiency
            );

        }
      );


      /* =================================================
         CARTE
      ================================================= */

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "progress-card " +
        status;


      card.innerHTML = `

        <div class="progress-card-header">

          <div>

            <div class="progress-card-title">

              ${
                escapeRoutineText(
                  latest.routineName ||
                  "Routine"
                )
              }

            </div>

            <div class="progress-card-subtitle">

              ${
                sessions.length
              }
              séances enregistrées

            </div>

          </div>


          <div class="progress-card-icon">

            ${icon}

          </div>

        </div>


        <div class="progress-card-values">

          <div>

            <span>
              Volume
            </span>

            <strong>
              ${
                latestVolume
              }
            </strong>

            <small>
              répétitions
            </small>

          </div>


          <div>

            <span>
              Durée
            </span>

            <strong>
              ${
                formatRoutineProgressTime(
                  latestDuration
                )
              }
            </strong>

          </div>


          <div>

            <span>
              Efficacité
            </span>

            <strong>
              ${
                latestEfficiency
                  .toFixed(1)
              }
            </strong>

            <small>
              reps/min
            </small>

          </div>

        </div>


        <div class="progress-card-message">

          ${message}

        </div>


        <div class="routine-progress-details">

          Volume :
          ${
            formatRoutineChange(
              volumeChange
            )
          }

          •

          Efficacité :
          ${
            formatRoutineChange(
              efficiencyChange
            )
          }

          <br>

          Meilleure efficacité :
          ${
            bestEfficiency
              .toFixed(1)
          }
          reps/min

        </div>

      `;


      progressList.appendChild(
        card
      );

    });

}


/* =========================================================
   VOLUME D'UNE SÉANCE
========================================================= */

function getRoutineSessionVolume(
  session
) {

  /*
    Nouveau système
  */

  if (
    Number(
      session.routineVolume
    ) > 0
  ) {

    return Number(
      session.routineVolume
    );

  }


  /*
    Snapshot
  */

  if (
    session.routineSnapshot &&
    Number(
      session.routineSnapshot
        .totalVolume
    ) > 0
  ) {

    return Number(
      session.routineSnapshot
        .totalVolume
    );

  }


  /*
    Anciennes séances :
    tentative de reconstruction
  */

  if (
    Array.isArray(
      session.exercises
    )
  ) {

    const repsPerRound =
      session.exercises.reduce(
        (
          total,
          exercise
        ) => {

          return (
            total +
            Number(
              exercise.reps || 0
            )
          );

        },
        0
      );


    const rounds =
      Number(
        session.rounds || 1
      );


    return (
      repsPerRound *
      rounds
    );

  }


  return 0;

}


/* =========================================================
   VARIATION %
========================================================= */

function formatRoutineChange(
  value
) {

  if (
    !Number.isFinite(value)
  ) {

    return "—";

  }


  if (
    Math.abs(value) < 0.5
  ) {

    return "stable";

  }


  const sign =
    value > 0
      ? "+"
      : "";


  return (
    sign +
    value.toFixed(1) +
    " %"
  );

}


/* =========================================================
   FORMAT DURÉE ROUTINE
========================================================= */

function formatRoutineProgressTime(seconds) {

  seconds =
    Math.round(
      Number(seconds) || 0
    );


  const minutes =
    Math.floor(
      seconds / 60
    );


  const remainingSeconds =
    seconds % 60;


  return (
    minutes +
    " min " +
    String(
      remainingSeconds
    ).padStart(2, "0") +
    " s"
  );

}

/* =========================================================
   NEXUS MOVE — BILAN APRÈS SÉANCE
========================================================= */

let workoutFeedbackFeeling = null;

let workoutFeedbackEnergy = null;

let workoutFeedbackHasPain = null;

let workoutFeedbackPainLocations = [];


/* =========================================================
   ÉLÉMENTS
========================================================= */

const workoutFeedbackOverlay =
  document.getElementById(
    "workoutFeedbackOverlay"
  );

const feedbackPainLocations =
  document.getElementById(
    "feedbackPainLocations"
  );

const feedbackOtherPain =
  document.getElementById(
    "feedbackOtherPain"
  );


/* =========================================================
   OUVRIR LE BILAN
========================================================= */

function openWorkoutFeedback() {

  workoutFeedbackFeeling = null;

  workoutFeedbackEnergy = null;

  workoutFeedbackHasPain = null;

  workoutFeedbackPainLocations = [];


  document
    .querySelectorAll(
      ".feedback-choice-btn, " +
      ".feedback-pain-btn, " +
      ".feedback-energy-row button, " +
      ".pain-location-grid button"
    )
    .forEach(button => {

      button.classList.remove(
        "selected"
      );

    });


  if (feedbackPainLocations) {

    feedbackPainLocations.classList.add(
      "hidden"
    );

  }


  if (feedbackOtherPain) {

    feedbackOtherPain.value = "";

  }


  if (workoutFeedbackOverlay) {

    workoutFeedbackOverlay.classList.remove(
      "hidden"
    );

  }

}


/* =========================================================
   RESSENTI
========================================================= */

document
  .querySelectorAll(
    "[data-feeling]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(
            "[data-feeling]"
          )
          .forEach(item =>
            item.classList.remove(
              "selected"
            )
          );


        button.classList.add(
          "selected"
        );


        workoutFeedbackFeeling =
          button.dataset.feeling;

      }
    );

  });


/* =========================================================
   ÉNERGIE
========================================================= */

document
  .querySelectorAll(
    "[data-energy]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(
            "[data-energy]"
          )
          .forEach(item =>
            item.classList.remove(
              "selected"
            )
          );


        button.classList.add(
          "selected"
        );


        workoutFeedbackEnergy =
          Number(
            button.dataset.energy
          );

      }
    );

  });


/* =========================================================
   DOULEUR NON
========================================================= */

const feedbackPainNo =
  document.getElementById(
    "feedbackPainNo"
  );


if (feedbackPainNo) {

  feedbackPainNo.addEventListener(
    "click",
    () => {

      workoutFeedbackHasPain =
        false;


      workoutFeedbackPainLocations =
        [];


      feedbackPainNo.classList.add(
        "selected"
      );


      const yes =
        document.getElementById(
          "feedbackPainYes"
        );


      if (yes) {

        yes.classList.remove(
          "selected"
        );

      }


      if (feedbackPainLocations) {

        feedbackPainLocations.classList.add(
          "hidden"
        );

      }

    }
  );

}


/* =========================================================
   DOULEUR OUI
========================================================= */

const feedbackPainYes =
  document.getElementById(
    "feedbackPainYes"
  );


if (feedbackPainYes) {

  feedbackPainYes.addEventListener(
    "click",
    () => {

      workoutFeedbackHasPain =
        true;


      feedbackPainYes.classList.add(
        "selected"
      );


      if (feedbackPainNo) {

        feedbackPainNo.classList.remove(
          "selected"
        );

      }


      if (feedbackPainLocations) {

        feedbackPainLocations.classList.remove(
          "hidden"
        );

      }

    }
  );

}


/* =========================================================
   ZONES DE DOULEUR
========================================================= */

document
  .querySelectorAll(
    "[data-location]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const location =
          button.dataset.location;


        if (
          workoutFeedbackPainLocations
            .includes(location)
        ) {

          workoutFeedbackPainLocations =
            workoutFeedbackPainLocations
              .filter(item =>
                item !== location
              );


          button.classList.remove(
            "selected"
          );

        } else {

          workoutFeedbackPainLocations
            .push(location);


          button.classList.add(
            "selected"
          );

        }

      }
    );

  });


/* =========================================================
   ENREGISTRER LE BILAN
========================================================= */

function saveWorkoutFeedback() {

  if (!workoutFeedbackFeeling) {

    alert(
      "Indique ton ressenti."
    );

    return;

  }


  if (!workoutFeedbackEnergy) {

    alert(
      "Indique ton niveau d'énergie."
    );

    return;

  }


  if (
    workoutFeedbackHasPain === null
  ) {

    alert(
      "Indique si tu as une douleur."
    );

    return;

  }


  let painLocations =
    [
      ...workoutFeedbackPainLocations
    ];


  if (
    workoutFeedbackHasPain &&
    feedbackOtherPain &&
    feedbackOtherPain.value.trim()
  ) {

    painLocations.push(
      feedbackOtherPain
        .value
        .trim()
    );

  }


  if (
    workoutFeedbackHasPain &&
    painLocations.length === 0
  ) {

    alert(
      "Indique où se trouve la douleur."
    );

    return;

  }


  let history = [];


  try {

    history =
      JSON.parse(
        localStorage.getItem(
          "nexusMoveHistory"
        )
      ) || [];

  } catch (error) {

    history = [];

  }


  if (!history.length) {

    alert(
      "Aucune séance trouvée."
    );

    return;

  }


  /*
    On cherche la séance la plus récente.
  */

  let latestIndex = 0;

  let latestTime = 0;


  history.forEach(
    (session, index) => {

      const time =
        new Date(
          session.date
        ).getTime();


      if (time > latestTime) {

        latestTime = time;

        latestIndex = index;

      }

    }
  );


  /* =====================================================
     DONNÉES POUR HEDA BO
  ===================================================== */

  history[latestIndex].feedback = {

    feeling:
      workoutFeedbackFeeling,

    energy:
      workoutFeedbackEnergy,

    pain: {

      hasPain:
        workoutFeedbackHasPain,

      locations:
        workoutFeedbackHasPain
          ? painLocations
          : []

    },

    recordedAt:
      new Date()
        .toISOString()

  };


  localStorage.setItem(
    "nexusMoveHistory",
    JSON.stringify(history)
  );


  if (workoutFeedbackOverlay) {

    workoutFeedbackOverlay.classList.add(
      "hidden"
    );

  }


  /*
    Rafraîchit l'historique si la fonction existe.
  */

  if (
    typeof renderHistory ===
    "function"
  ) {

    renderHistory();

  }

}


/* =========================================================
   BOUTON ENREGISTRER
========================================================= */

const saveWorkoutFeedbackBtn =
  document.getElementById(
    "saveWorkoutFeedbackBtn"
  );


if (saveWorkoutFeedbackBtn) {

  saveWorkoutFeedbackBtn.addEventListener(
    "click",
    saveWorkoutFeedback
  );

}




