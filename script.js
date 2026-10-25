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


  history.unshift({

    id:
      Date.now(),

    type:
      "circuit",

    date:
      new Date().toISOString(),

    rounds:
      completedRoundCount,

    completedExercises:
      completedExerciseCount,

    duration:
      duration,

    exercises:
      workout.exercises

  });


  saveHistory(
    history
  );


  updateHomeStats();
}


/* =========================================================
   AFFICHAGE HISTORIQUE
========================================================= */

function renderHistory() {

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
   INITIALISATION
========================================================= */

renderExercises();

updateHomeStats();

showScreen(
  homeScreen
);


});
