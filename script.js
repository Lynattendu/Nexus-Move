/* =========================================================
   NEXUS MOVE
   SCRIPT.JS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


/* =========================================================
   ÉCRANS
========================================================= */

const screens = document.querySelectorAll(".screen");

const homeScreen =
  document.getElementById("homeScreen");

const chronoScreen =
  document.getElementById("chronoScreen");

const circuitSetupScreen =
  document.getElementById("circuitSetupScreen");

const circuitWorkoutScreen =
  document.getElementById("circuitWorkoutScreen");

const workoutCompleteScreen =
  document.getElementById("workoutCompleteScreen");

const historyScreen =
  document.getElementById("historyScreen");


function showScreen(screen) {

  screens.forEach(item => {
    item.classList.remove("active");
  });

  screen.classList.add("active");

  window.scrollTo({
    top: 0,
    behavior: "instant"
  });

}


/* =========================================================
   NAVIGATION
========================================================= */

const openChronoBtn =
  document.getElementById("openChronoBtn");

const openCircuitBtn =
  document.getElementById("openCircuitBtn");

const openHistoryBtn =
  document.getElementById("openHistoryBtn");

const completeHomeBtn =
  document.getElementById("completeHomeBtn");


openChronoBtn.addEventListener("click", () => {

  showScreen(chronoScreen);

});


openCircuitBtn.addEventListener("click", () => {

  renderExerciseList();

  showScreen(circuitSetupScreen);

});


openHistoryBtn.addEventListener("click", () => {

  renderHistory();

  showScreen(historyScreen);

});


completeHomeBtn.addEventListener("click", () => {

  updateHomeStats();

  showScreen(homeScreen);

});


document
  .querySelectorAll("[data-back-home]")
  .forEach(button => {

    button.addEventListener("click", () => {

      updateHomeStats();

      showScreen(homeScreen);

    });

  });


/* =========================================================
   AUDIO
========================================================= */

let audioContext = null;


function initAudio() {

  if (!audioContext) {

    audioContext =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

}


function playTone(
  frequency = 700,
  duration = 0.15,
  volume = 0.18
) {

  try {

    initAudio();

    const oscillator =
      audioContext.createOscillator();

    const gain =
      audioContext.createGain();

    oscillator.type = "sine";

    oscillator.frequency.value =
      frequency;

    gain.gain.value =
      volume;

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

    console.log("Audio non disponible.");

  }

}


function playStartSound() {

  playTone(700, 0.12);

  setTimeout(() => {
    playTone(900, 0.14);
  }, 130);

}


function playChangeSound() {

  playTone(850, 0.12);

}


function playRestSound() {

  playTone(540, 0.18);

}


function playRoundSound() {

  playTone(650, 0.12);

  setTimeout(() => {
    playTone(800, 0.12);
  }, 120);

}


function playFinishSound() {

  playTone(700, 0.14);

  setTimeout(() => {
    playTone(900, 0.14);
  }, 140);

  setTimeout(() => {
    playTone(1100, 0.25);
  }, 280);

}


/* =========================================================
   VIBRATION
========================================================= */

function vibrate(pattern = 100) {

  if ("vibrate" in navigator) {

    navigator.vibrate(pattern);

  }

}


/* =========================================================
   FLASH VISUEL
========================================================= */

const phaseFlash =
  document.getElementById("phaseFlash");


function flashScreen() {

  phaseFlash.classList.remove("flash");

  void phaseFlash.offsetWidth;

  phaseFlash.classList.add("flash");

}


/* =========================================================
   FORMAT TEMPS
========================================================= */

function formatStopwatch(ms) {

  const totalTenths =
    Math.floor(ms / 100);

  const minutes =
    Math.floor(totalTenths / 600);

  const seconds =
    Math.floor((totalTenths % 600) / 10);

  const tenths =
    totalTenths % 10;

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0") +
    "." +
    tenths
  );

}


function formatCountdown(seconds) {

  seconds =
    Math.max(
      0,
      Math.ceil(seconds)
    );

  const minutes =
    Math.floor(seconds / 60);

  const secs =
    seconds % 60;

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(secs).padStart(2, "0")
  );

}


function formatDuration(seconds) {

  seconds =
    Math.max(
      0,
      Math.round(seconds)
    );

  const minutes =
    Math.floor(seconds / 60);

  const secs =
    seconds % 60;

  if (minutes === 0) {

    return `${secs} s`;

  }

  if (secs === 0) {

    return `${minutes} min`;

  }

  return `${minutes} min ${secs} s`;

}


/* =========================================================
   CHRONOMÈTRE SIMPLE
========================================================= */

const chronoDisplay =
  document.getElementById("chronoDisplay");

const chronoStatus =
  document.getElementById("chronoStatus");

const chronoStartBtn =
  document.getElementById("chronoStartBtn");

const chronoPauseBtn =
  document.getElementById("chronoPauseBtn");

const chronoResumeBtn =
  document.getElementById("chronoResumeBtn");

const chronoResetBtn =
  document.getElementById("chronoResetBtn");


let chronoRunning = false;

let chronoPaused = false;

let chronoStartTime = 0;

let chronoElapsed = 0;

let chronoInterval = null;


function updateChronoDisplay() {

  let elapsed =
    chronoElapsed;

  if (chronoRunning) {

    elapsed +=
      performance.now() -
      chronoStartTime;

  }

  chronoDisplay.textContent =
    formatStopwatch(elapsed);

}


function startChrono() {

  if (chronoRunning) {
    return;
  }

  initAudio();

  chronoElapsed = 0;

  chronoStartTime =
    performance.now();

  chronoRunning = true;

  chronoPaused = false;

  chronoStatus.textContent =
    "EN COURS";

  chronoDisplay.classList.add(
    "running-glow"
  );

  chronoStartBtn.disabled = true;

  chronoPauseBtn.disabled = false;

  chronoResumeBtn.disabled = true;

  clearInterval(chronoInterval);

  chronoInterval =
    setInterval(
      updateChronoDisplay,
      50
    );

}


function pauseChrono() {

  if (!chronoRunning) {
    return;
  }

  chronoElapsed +=
    performance.now() -
    chronoStartTime;

  chronoRunning = false;

  chronoPaused = true;

  clearInterval(
    chronoInterval
  );

  chronoStatus.textContent =
    "PAUSE";

  chronoDisplay.classList.remove(
    "running-glow"
  );

  chronoPauseBtn.disabled = true;

  chronoResumeBtn.disabled = false;

}


function resumeChrono() {

  if (!chronoPaused) {
    return;
  }

  chronoStartTime =
    performance.now();

  chronoRunning = true;

  chronoPaused = false;

  chronoStatus.textContent =
    "EN COURS";

  chronoDisplay.classList.add(
    "running-glow"
  );

  chronoPauseBtn.disabled = false;

  chronoResumeBtn.disabled = true;

  clearInterval(
    chronoInterval
  );

  chronoInterval =
    setInterval(
      updateChronoDisplay,
      50
    );

}


function resetChrono() {

  clearInterval(
    chronoInterval
  );

  chronoRunning = false;

  chronoPaused = false;

  chronoElapsed = 0;

  chronoDisplay.textContent =
    "00:00.0";

  chronoStatus.textContent =
    "PRÊT";

  chronoDisplay.classList.remove(
    "running-glow"
  );

  chronoStartBtn.disabled = false;

  chronoPauseBtn.disabled = true;

  chronoResumeBtn.disabled = true;

}


chronoStartBtn.addEventListener(
  "click",
  startChrono
);

chronoPauseBtn.addEventListener(
  "click",
  pauseChrono
);

chronoResumeBtn.addEventListener(
  "click",
  resumeChrono
);

chronoResetBtn.addEventListener(
  "click",
  resetChrono
);


/* =========================================================
   CONFIGURATION CIRCUIT
========================================================= */

const roundCount =
  document.getElementById("roundCount");

const exerciseRest =
  document.getElementById("exerciseRest");

const roundRest =
  document.getElementById("roundRest");

const exerciseList =
  document.getElementById("exerciseList");

const setupExerciseCount =
  document.getElementById("setupExerciseCount");

const addExerciseBtn =
  document.getElementById("addExerciseBtn");

const startCircuitBtn =
  document.getElementById("startCircuitBtn");


let exercises = [];


/* =========================================================
   PLUS / MOINS
========================================================= */

document
  .querySelectorAll(".plus-btn")
  .forEach(button => {

    button.addEventListener("click", () => {

      const target =
        document.getElementById(
          button.dataset.target
        );

      const max =
        Number(target.max) || Infinity;

      let value =
        Number(target.value) || 0;

      value++;

      target.value =
        Math.min(value, max);

    });

  });


document
  .querySelectorAll(".minus-btn")
  .forEach(button => {

    button.addEventListener("click", () => {

      const target =
        document.getElementById(
          button.dataset.target
        );

      const min =
        Number(target.min) || 0;

      let value =
        Number(target.value) || 0;

      value--;

      target.value =
        Math.max(value, min);

    });

  });


/* =========================================================
   MODALE EXERCICE
========================================================= */

const exerciseModal =
  document.getElementById("exerciseModal");

const closeExerciseModalBtn =
  document.getElementById(
    "closeExerciseModalBtn"
  );

const exerciseName =
  document.getElementById("exerciseName");

const exerciseTime =
  document.getElementById("exerciseTime");

const exerciseReps =
  document.getElementById("exerciseReps");

const typeTimeBtn =
  document.getElementById("typeTimeBtn");

const typeRepsBtn =
  document.getElementById("typeRepsBtn");

const timeOption =
  document.getElementById("timeOption");

const repsOption =
  document.getElementById("repsOption");

const saveExerciseBtn =
  document.getElementById("saveExerciseBtn");


let selectedExerciseType =
  "time";


function openExerciseModal() {

  exerciseName.value = "";

  exerciseTime.value = 45;

  exerciseReps.value = 10;

  selectedExerciseType =
    "time";

  typeTimeBtn.classList.add(
    "active"
  );

  typeRepsBtn.classList.remove(
    "active"
  );

  timeOption.classList.add(
    "active"
  );

  repsOption.classList.remove(
    "active"
  );

  exerciseModal.classList.add(
    "open"
  );

  exerciseModal.setAttribute(
    "aria-hidden",
    "false"
  );

  setTimeout(() => {
    exerciseName.focus();
  }, 150);

}


function closeExerciseModal() {

  exerciseModal.classList.remove(
    "open"
  );

  exerciseModal.setAttribute(
    "aria-hidden",
    "true"
  );

}


addExerciseBtn.addEventListener(
  "click",
  openExerciseModal
);


closeExerciseModalBtn.addEventListener(
  "click",
  closeExerciseModal
);


exerciseModal
  .querySelector(".modal-overlay")
  .addEventListener(
    "click",
    closeExerciseModal
  );


typeTimeBtn.addEventListener(
  "click",
  () => {

    selectedExerciseType =
      "time";

    typeTimeBtn.classList.add(
      "active"
    );

    typeRepsBtn.classList.remove(
      "active"
    );

    timeOption.classList.add(
      "active"
    );

    repsOption.classList.remove(
      "active"
    );

  }
);


typeRepsBtn.addEventListener(
  "click",
  () => {

    selectedExerciseType =
      "reps";

    typeRepsBtn.classList.add(
      "active"
    );

    typeTimeBtn.classList.remove(
      "active"
    );

    repsOption.classList.add(
      "active"
    );

    timeOption.classList.remove(
      "active"
    );

  }
);


/* =========================================================
   AJOUT EXERCICE
========================================================= */

saveExerciseBtn.addEventListener(
  "click",
  () => {

    const name =
      exerciseName.value.trim();

    if (!name) {

      alert(
        "Entre un nom pour l'exercice."
      );

      return;

    }


    if (
      selectedExerciseType ===
      "time"
    ) {

      const seconds =
        Number(exerciseTime.value);

      if (
        !seconds ||
        seconds < 1
      ) {

        alert(
          "Entre une durée valide."
        );

        return;

      }

      exercises.push({
        id: Date.now(),
        name,
        type: "time",
        value: seconds
      });

    } else {

      const reps =
        Number(exerciseReps.value);

      if (
        !reps ||
        reps < 1
      ) {

        alert(
          "Entre un nombre de répétitions valide."
        );

        return;

      }

      exercises.push({
        id: Date.now(),
        name,
        type: "reps",
        value: reps
      });

    }

    renderExerciseList();

    closeExerciseModal();

  }
);


/* =========================================================
   AFFICHAGE LISTE EXERCICES
========================================================= */

function renderExerciseList() {

  exerciseList.innerHTML = "";

  setupExerciseCount.textContent =
    exercises.length;


  exercises.forEach(
    (exercise, index) => {

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "exercise-item";


      const valueText =
        exercise.type === "time"
          ? `${exercise.value} secondes`
          : `${exercise.value} répétitions`;


      item.innerHTML = `

        <div class="exercise-item-number">
          ${index + 1}
        </div>

        <div class="exercise-item-content">

          <strong>
            ${escapeHTML(exercise.name)}
          </strong>

          <span>
            ${valueText}
          </span>

        </div>

        <button
          class="exercise-delete"
          type="button"
          data-index="${index}"
        >
          ×
        </button>

      `;

      exerciseList.appendChild(
        item
      );

    }
  );


  exerciseList
    .querySelectorAll(
      ".exercise-delete"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(
              button.dataset.index
            );

          exercises.splice(
            index,
            1
          );

          renderExerciseList();

        }
      );

    });

}


/* =========================================================
   SÉCURITÉ TEXTE
========================================================= */

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent =
    text;

  return div.innerHTML;

}


/* =========================================================
   ÉLÉMENTS ÉCRAN CIRCUIT
========================================================= */

const workoutPhase =
  document.getElementById("workoutPhase");

const workoutExerciseName =
  document.getElementById(
    "workoutExerciseName"
  );

const workoutTimer =
  document.getElementById("workoutTimer");

const repsDisplay =
  document.getElementById("repsDisplay");

const workoutReps =
  document.getElementById("workoutReps");

const workoutExerciseProgress =
  document.getElementById(
    "workoutExerciseProgress"
  );

const workoutRoundProgress =
  document.getElementById(
    "workoutRoundProgress"
  );

const completedExercises =
  document.getElementById(
    "completedExercises"
  );

const completedRounds =
  document.getElementById(
    "completedRounds"
  );

const finishRepsBtn =
  document.getElementById(
    "finishRepsBtn"
  );

const workoutStartBtn =
  document.getElementById(
    "workoutStartBtn"
  );

const workoutPauseBtn =
  document.getElementById(
    "workoutPauseBtn"
  );

const workoutResumeBtn =
  document.getElementById(
    "workoutResumeBtn"
  );

const workoutResetBtn =
  document.getElementById(
    "workoutResetBtn"
  );

const quitWorkoutBtn =
  document.getElementById(
    "quitWorkoutBtn"
  );


/* =========================================================
   VARIABLES CIRCUIT
========================================================= */

let workoutConfig = null;

let currentExerciseIndex = 0;

let currentRound = 1;

let totalCompletedExercises = 0;

let totalCompletedRounds = 0;

let workoutPhaseType = "ready";

let workoutRunning = false;

let workoutPaused = false;

let workoutStarted = false;

let phaseDuration = 0;

let phaseRemaining = 0;

let phaseEndTime = 0;

let workoutInterval = null;

let workoutStartedAt = null;

let workoutAccumulatedTime = 0;

let lastWorkoutTickTime = null;


/* =========================================================
   DÉMARRAGE CONFIGURATION CIRCUIT
========================================================= */

startCircuitBtn.addEventListener(
  "click",
  () => {

    if (exercises.length === 0) {

      alert(
        "Ajoute au moins un exercice."
      );

      return;

    }


    const rounds =
      Math.max(
        1,
        Number(roundCount.value) || 1
      );

    const betweenExercises =
      Math.max(
        0,
        Number(exerciseRest.value) || 0
      );

    const betweenRounds =
      Math.max(
        0,
        Number(roundRest.value) || 0
      );


    workoutConfig = {

      rounds,

      exerciseRest:
        betweenExercises,

      roundRest:
        betweenRounds,

      exercises:
        exercises.map(
          exercise => ({
            ...exercise
          })
        )

    };


    prepareWorkout();

    showScreen(
      circuitWorkoutScreen
    );

  }
);


/* =========================================================
   PRÉPARER CIRCUIT
========================================================= */

function prepareWorkout() {

  stopWorkoutTimer();

  currentExerciseIndex = 0;

  currentRound = 1;

  totalCompletedExercises = 0;

  totalCompletedRounds = 0;

  workoutPhaseType =
    "ready";

  workoutRunning = false;

  workoutPaused = false;

  workoutStarted = false;

  phaseRemaining = 0;

  workoutAccumulatedTime = 0;

  workoutStartedAt = null;

  lastWorkoutTickTime = null;


  workoutPhase.textContent =
    "PRÊT";

  workoutExerciseName.textContent =
    workoutConfig.exercises[0].name;

  workoutTimer.textContent =
    workoutConfig.exercises[0].type ===
    "time"
      ? formatCountdown(
          workoutConfig
            .exercises[0]
            .value
        )
      : "--:--";


  updateWorkoutNumbers();


  repsDisplay.hidden = true;

  finishRepsBtn.hidden = true;


  workoutStartBtn.disabled = false;

  workoutPauseBtn.disabled = true;

  workoutResumeBtn.disabled = true;


  circuitWorkoutScreen.classList.remove(
    "phase-work",
    "phase-rest",
    "phase-round-rest",
    "phase-paused"
  );

}


/* =========================================================
   DÉMARRER CIRCUIT
========================================================= */

function startWorkout() {

  if (workoutStarted) {
    return;
  }

  initAudio();

  workoutStarted = true;

  workoutRunning = true;

  workoutPaused = false;

  workoutStartedAt =
    Date.now();

  lastWorkoutTickTime =
    performance.now();

  workoutStartBtn.disabled = true;

  workoutPauseBtn.disabled = false;

  workoutResumeBtn.disabled = true;

  playStartSound();

  flashScreen();

  startCurrentExercise();

}


/* =========================================================
   EXERCICE ACTUEL
========================================================= */

function startCurrentExercise() {

  const exercise =
    workoutConfig.exercises[
      currentExerciseIndex
    ];

  workoutPhaseType =
    "exercise";

  workoutRunning = true;

  workoutPaused = false;


  workoutPhase.textContent =
    "EXERCICE";

  workoutExerciseName.textContent =
    exercise.name;


  circuitWorkoutScreen.classList.remove(
    "phase-rest",
    "phase-round-rest",
    "phase-paused"
  );

  circuitWorkoutScreen.classList.add(
    "phase-work"
  );


  updateWorkoutNumbers();


  if (
    exercise.type ===
    "time"
  ) {

    repsDisplay.hidden =
      true;

    finishRepsBtn.hidden =
      true;

    startCountdown(
      exercise.value
    );

  } else {

    stopWorkoutTimer();

    workoutTimer.textContent =
      "--:--";

    workoutReps.textContent =
      exercise.value;

    repsDisplay.hidden =
      false;

    finishRepsBtn.hidden =
      false;

  }

}


/* =========================================================
   COMPTE À REBOURS
========================================================= */

function startCountdown(seconds) {

  stopWorkoutTimer();

  phaseDuration =
    seconds;

  phaseRemaining =
    seconds;

  phaseEndTime =
    performance.now() +
    seconds * 1000;


  workoutTimer.textContent =
    formatCountdown(
      phaseRemaining
    );


  workoutInterval =
    setInterval(
      workoutTick,
      100
    );

}


/* =========================================================
   TICK CIRCUIT
========================================================= */

function workoutTick() {

  if (
    !workoutRunning ||
    workoutPaused
  ) {
    return;
  }


  const now =
    performance.now();


  if (lastWorkoutTickTime) {

    workoutAccumulatedTime +=
      (
        now -
        lastWorkoutTickTime
      ) / 1000;

  }

  lastWorkoutTickTime =
    now;


  phaseRemaining =
    Math.max(
      0,
      (
        phaseEndTime -
        now
      ) / 1000
    );


  workoutTimer.textContent =
    formatCountdown(
      phaseRemaining
    );


  if (
    phaseRemaining <= 0
  ) {

    stopWorkoutTimer();

    handlePhaseFinished();

  }

}


/* =========================================================
   FIN PHASE
========================================================= */

function handlePhaseFinished() {

  if (
    workoutPhaseType ===
    "exercise"
  ) {

    completeCurrentExercise();

    return;

  }


  if (
    workoutPhaseType ===
    "exercise-rest"
  ) {

    currentExerciseIndex++;

    playChangeSound();

    flashScreen();

    startCurrentExercise();

    return;

  }


  if (
    workoutPhaseType ===
    "round-rest"
  ) {

    currentRound++;

    currentExerciseIndex = 0;

    playRoundSound();

    flashScreen();

    startCurrentExercise();

  }

}


/* =========================================================
   FIN EXERCICE
========================================================= */

function completeCurrentExercise() {

  totalCompletedExercises++;

  updateWorkoutNumbers();


  const isLastExercise =
    currentExerciseIndex ===
    workoutConfig.exercises.length - 1;


  if (isLastExercise) {

    totalCompletedRounds++;

    updateWorkoutNumbers();


    const isLastRound =
      currentRound >=
      workoutConfig.rounds;


    if (isLastRound) {

      finishWorkout();

      return;

    }


    if (
      workoutConfig.roundRest >
      0
    ) {

      startRoundRest();

    } else {

      currentRound++;

      currentExerciseIndex = 0;

      playRoundSound();

      flashScreen();

      startCurrentExercise();

    }

    return;

  }


  if (
    workoutConfig.exerciseRest >
    0
  ) {

    startExerciseRest();

  } else {

    currentExerciseIndex++;

    playChangeSound();

    flashScreen();

    startCurrentExercise();

  }

}


/* =========================================================
   REPOS ENTRE EXERCICES
========================================================= */

function startExerciseRest() {

  workoutPhaseType =
    "exercise-rest";


  workoutPhase.textContent =
    "REPOS";


  workoutExerciseName.textContent =
    "Prochain : " +
    workoutConfig
      .exercises[
        currentExerciseIndex + 1
      ]
      .name;


  repsDisplay.hidden =
    true;

  finishRepsBtn.hidden =
    true;


  circuitWorkoutScreen.classList.remove(
    "phase-work",
    "phase-round-rest",
    "phase-paused"
  );

  circuitWorkoutScreen.classList.add(
    "phase-rest"
  );


  playRestSound();

  vibrate(100);

  flashScreen();


  startCountdown(
    workoutConfig.exerciseRest
  );

}


/* =========================================================
   REPOS ENTRE TOURS
========================================================= */

function startRoundRest() {

  workoutPhaseType =
    "round-rest";


  workoutPhase.textContent =
    "REPOS ENTRE LES TOURS";


  workoutExerciseName.textContent =
    `Tour ${currentRound} terminé`;


  repsDisplay.hidden =
    true;

  finishRepsBtn.hidden =
    true;


  circuitWorkoutScreen.classList.remove(
    "phase-work",
    "phase-rest",
    "phase-paused"
  );

  circuitWorkoutScreen.classList.add(
    "phase-round-rest"
  );


  playRoundSound();

  vibrate([
    100,
    80,
    100
  ]);

  flashScreen();


  startCountdown(
    workoutConfig.roundRest
  );

}


/* =========================================================
   EXERCICE EN RÉPÉTITIONS TERMINÉ
========================================================= */

finishRepsBtn.addEventListener(
  "click",
  () => {

    if (
      workoutPaused ||
      workoutPhaseType !==
      "exercise"
    ) {
      return;
    }

    const exercise =
      workoutConfig.exercises[
        currentExerciseIndex
      ];

    if (
      exercise.type !==
      "reps"
    ) {
      return;
    }

    playChangeSound();

    vibrate(80);

    flashScreen();

    completeCurrentExercise();

  }
);


/* =========================================================
   PAUSE CIRCUIT
========================================================= */

function pauseWorkout() {

  if (
    !workoutStarted ||
    workoutPaused ||
    !workoutRunning
  ) {
    return;
  }


  workoutPaused = true;

  workoutRunning = false;


  if (
    workoutInterval
  ) {

    phaseRemaining =
      Math.max(
        0,
        (
          phaseEndTime -
          performance.now()
        ) / 1000
      );

    stopWorkoutTimer();

  }


  workoutPauseBtn.disabled =
    true;

  workoutResumeBtn.disabled =
    false;


  circuitWorkoutScreen.classList.add(
    "phase-paused"
  );


  workoutPhase.dataset.previousText =
    workoutPhase.textContent;

  workoutPhase.textContent =
    "PAUSE";


  lastWorkoutTickTime =
    null;

}


/* =========================================================
   REPRENDRE CIRCUIT
========================================================= */

function resumeWorkout() {

  if (
    !workoutStarted ||
    !workoutPaused
  ) {
    return;
  }


  workoutPaused = false;

  workoutRunning = true;


  workoutPauseBtn.disabled =
    false;

  workoutResumeBtn.disabled =
    true;


  circuitWorkoutScreen.classList.remove(
    "phase-paused"
  );


  if (
    workoutPhase.dataset.previousText
  ) {

    workoutPhase.textContent =
      workoutPhase.dataset.previousText;

  }


  lastWorkoutTickTime =
    performance.now();


  const currentExercise =
    workoutConfig.exercises[
      currentExerciseIndex
    ];


  const needsTimer =
    workoutPhaseType !==
      "exercise" ||
    currentExercise.type ===
      "time";


  if (needsTimer) {

    phaseEndTime =
      performance.now() +
      phaseRemaining * 1000;

    workoutInterval =
      setInterval(
        workoutTick,
        100
      );

  }

}


/* =========================================================
   RESET CIRCUIT
========================================================= */

function resetWorkout() {

  const confirmed =
    confirm(
      "Recommencer le circuit depuis le début ?"
    );

  if (!confirmed) {
    return;
  }

  prepareWorkout();

}


/* =========================================================
   QUITTER CIRCUIT
========================================================= */

function quitWorkout() {

  const confirmed =
    confirm(
      "Quitter le circuit ? La séance en cours ne sera pas enregistrée."
    );

  if (!confirmed) {
    return;
  }

  stopWorkoutTimer();

  prepareWorkout();

  showScreen(
    circuitSetupScreen
  );

}


/* =========================================================
   COMMANDES CIRCUIT
========================================================= */

workoutStartBtn.addEventListener(
  "click",
  startWorkout
);

workoutPauseBtn.addEventListener(
  "click",
  pauseWorkout
);

workoutResumeBtn.addEventListener(
  "click",
  resumeWorkout
);

workoutResetBtn.addEventListener(
  "click",
  resetWorkout
);

quitWorkoutBtn.addEventListener(
  "click",
  quitWorkout
);


/* =========================================================
   ARRÊTER TIMER CIRCUIT
========================================================= */

function stopWorkoutTimer() {

  if (
    workoutInterval
  ) {

    clearInterval(
      workoutInterval
    );

    workoutInterval =
      null;

  }

}


/* =========================================================
   AFFICHAGE PROGRESSION
========================================================= */

function updateWorkoutNumbers() {

  if (!workoutConfig) {
    return;
  }


  workoutExerciseProgress.textContent =
    `${currentExerciseIndex + 1} / ${workoutConfig.exercises.length}`;


  workoutRoundProgress.textContent =
    `${currentRound} / ${workoutConfig.rounds}`;


  completedExercises.textContent =
    totalCompletedExercises;


  completedRounds.textContent =
    totalCompletedRounds;

}


/* =========================================================
   FIN DE LA SÉANCE
========================================================= */

function finishWorkout() {

  stopWorkoutTimer();

  workoutRunning = false;

  workoutPaused = false;


  playFinishSound();

  vibrate([
    150,
    100,
    150,
    100,
    250
  ]);

  flashScreen();


  const sessionDuration =
    calculateWorkoutDuration();


  saveWorkoutToHistory(
    sessionDuration
  );


  document.getElementById(
    "completeRounds"
  ).textContent =
    workoutConfig.rounds;


  document.getElementById(
    "completeExercises"
  ).textContent =
    totalCompletedExercises;


  document.getElementById(
    "completeDuration"
  ).textContent =
    formatDuration(
      sessionDuration
    );


  showScreen(
    workoutCompleteScreen
  );

}


/* =========================================================
   DURÉE RÉELLE SÉANCE
========================================================= */

function calculateWorkoutDuration() {

  let duration =
    workoutAccumulatedTime;


  if (
    workoutRunning &&
    lastWorkoutTickTime
  ) {

    duration +=
      (
        performance.now() -
        lastWorkoutTickTime
      ) / 1000;

  }


  return Math.max(
    1,
    Math.round(duration)
  );

}


/* =========================================================
   HISTORIQUE LOCAL STORAGE
========================================================= */

const HISTORY_KEY =
  "nexusMoveHistory";


function getHistory() {

  try {

    const data =
      localStorage.getItem(
        HISTORY_KEY
      );

    if (!data) {
      return [];
    }

    const parsed =
      JSON.parse(data);

    return Array.isArray(parsed)
      ? parsed
      : [];

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
   ENREGISTRER SÉANCE
========================================================= */

function saveWorkoutToHistory(
  duration
) {

  const history =
    getHistory();


  const workout = {

    id:
      Date.now(),

    date:
      new Date().toISOString(),

    rounds:
      workoutConfig.rounds,

    completedExercises:
      totalCompletedExercises,

    duration,

    exerciseRest:
      workoutConfig.exerciseRest,

    roundRest:
      workoutConfig.roundRest,

    exercises:
      workoutConfig.exercises.map(
        exercise => ({
          name:
            exercise.name,

          type:
            exercise.type,

          value:
            exercise.value
        })
      )

  };


  history.unshift(
    workout
  );


  saveHistory(
    history
  );


  updateHomeStats();

}


/* =========================================================
   ÉLÉMENTS HISTORIQUE
========================================================= */

const historyList =
  document.getElementById(
    "historyList"
  );

const emptyHistory =
  document.getElementById(
    "emptyHistory"
  );

const clearHistoryBtn =
  document.getElementById(
    "clearHistoryBtn"
  );

const historyWorkoutCount =
  document.getElementById(
    "historyWorkoutCount"
  );

const historyExerciseCount =
  document.getElementById(
    "historyExerciseCount"
  );

const historyTotalTime =
  document.getElementById(
    "historyTotalTime"
  );


/* =========================================================
   AFFICHER HISTORIQUE
========================================================= */

function renderHistory() {

  const history =
    getHistory();


  historyList.innerHTML = "";


  let totalExercises = 0;

  let totalTime = 0;


  history.forEach(workout => {

    totalExercises +=
      workout.completedExercises || 0;

    totalTime +=
      workout.duration || 0;

  });


  historyWorkoutCount.textContent =
    history.length;

  historyExerciseCount.textContent =
    totalExercises;

  historyTotalTime.textContent =
    formatDuration(totalTime);


  if (
    history.length === 0
  ) {

    historyList.appendChild(
      emptyHistory
    );

    clearHistoryBtn.style.display =
      "none";

    return;

  }


  clearHistoryBtn.style.display =
    "block";


  history.forEach(workout => {

    const item =
      document.createElement(
        "article"
      );

    item.className =
      "history-item";


    const date =
      new Date(
        workout.date
      );


    const dateText =
      date.toLocaleDateString(
        "fr-FR",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric"
        }
      );


    const timeText =
      date.toLocaleTimeString(
        "fr-FR",
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      );


    const exercisesText =
      workout.exercises
        .map(exercise => {

          if (
            exercise.type ===
            "time"
          ) {

            return (
              `${escapeHTML(exercise.name)} — ` +
              `${exercise.value} s`
            );

          }

          return (
            `${escapeHTML(exercise.name)} — ` +
            `${exercise.value} répétitions`
          );

        })
        .join("<br>");


    item.innerHTML = `

      <div class="history-item-header">

        <strong>
          Circuit • ${workout.rounds} tour${workout.rounds > 1 ? "s" : ""}
        </strong>

        <span class="history-date">
          ${timeText}
        </span>

      </div>

      <div class="history-item-details">

        <strong>
          ${capitalizeFirst(dateText)}
        </strong>

        <br><br>

        ${exercisesText}

        <br><br>

        Exercices réalisés :
        ${workout.completedExercises}

        <br>

        Durée :
        ${formatDuration(workout.duration)}

      </div>

    `;


    historyList.appendChild(
      item
    );

  });

}


/* =========================================================
   EFFACER HISTORIQUE
========================================================= */

clearHistoryBtn.addEventListener(
  "click",
  () => {

    const confirmed =
      confirm(
        "Effacer tout l'historique des entraînements ?"
      );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      HISTORY_KEY
    );

    renderHistory();

    updateHomeStats();

  }
);


/* =========================================================
   STATISTIQUES ACCUEIL
========================================================= */

const homeWorkoutCount =
  document.getElementById(
    "homeWorkoutCount"
  );

const homeExerciseCount =
  document.getElementById(
    "homeExerciseCount"
  );

const homeTotalTime =
  document.getElementById(
    "homeTotalTime"
  );


function updateHomeStats() {

  const history =
    getHistory();


  let totalExercises = 0;

  let totalTime = 0;


  history.forEach(workout => {

    totalExercises +=
      workout.completedExercises || 0;

    totalTime +=
      workout.duration || 0;

  });


  homeWorkoutCount.textContent =
    history.length;

  homeExerciseCount.textContent =
    totalExercises;

  homeTotalTime.textContent =
    formatHomeDuration(
      totalTime
    );

}


/* =========================================================
   FORMAT DURÉE ACCUEIL
========================================================= */

function formatHomeDuration(seconds) {

  seconds =
    Math.round(seconds);

  if (
    seconds < 60
  ) {

    return `${seconds} s`;

  }

  const minutes =
    Math.floor(seconds / 60);

  if (
    minutes < 60
  ) {

    return `${minutes} min`;

  }

  const hours =
    Math.floor(minutes / 60);

  const remainingMinutes =
    minutes % 60;

  if (
    remainingMinutes === 0
  ) {

    return `${hours} h`;

  }

  return (
    `${hours} h ${remainingMinutes}`
  );

}


/* =========================================================
   MAJ TEMPS RÉEL POUR EXERCICE RÉPÉTITIONS
========================================================= */

setInterval(() => {

  if (
    !workoutStarted ||
    !workoutRunning ||
    workoutPaused
  ) {
    return;
  }


  if (
    workoutPhaseType !==
    "exercise"
  ) {
    return;
  }


  if (!workoutConfig) {
    return;
  }


  const currentExercise =
    workoutConfig.exercises[
      currentExerciseIndex
    ];


  if (
    currentExercise.type !==
    "reps"
  ) {
    return;
  }


  const now =
    performance.now();


  if (lastWorkoutTickTime) {

    workoutAccumulatedTime +=
      (
        now -
        lastWorkoutTickTime
      ) / 1000;

  }

  lastWorkoutTickTime =
    now;

}, 250);


/* =========================================================
   CAPITAL PREMIÈRE LETTRE
========================================================= */

function capitalizeFirst(text) {

  if (!text) {
    return "";
  }

  return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
  );

}


/* =========================================================
   EMPÊCHER MISE EN VEILLE SI POSSIBLE
========================================================= */

let wakeLock = null;


async function requestWakeLock() {

  try {

    if (
      "wakeLock" in navigator
    ) {

      wakeLock =
        await navigator.wakeLock.request(
          "screen"
        );

    }

  } catch (error) {

    wakeLock =
      null;

  }

}


async function releaseWakeLock() {

  try {

    if (wakeLock) {

      await wakeLock.release();

      wakeLock =
        null;

    }

  } catch (error) {

    wakeLock =
      null;

  }

}


/* =========================================================
   WAKE LOCK CIRCUIT
========================================================= */

workoutStartBtn.addEventListener(
  "click",
  requestWakeLock
);


completeHomeBtn.addEventListener(
  "click",
  releaseWakeLock
);


quitWorkoutBtn.addEventListener(
  "click",
  releaseWakeLock
);


/* =========================================================
   RETOUR SUR L'APPLICATION
========================================================= */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.visibilityState ===
      "visible" &&
      workoutStarted &&
      !workoutPaused
    ) {

      requestWakeLock();

    }

  }
);


/* =========================================================
   INITIALISATION
========================================================= */

renderExerciseList();

updateHomeStats();

showScreen(homeScreen);


});
