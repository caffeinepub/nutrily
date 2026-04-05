export type ExerciseCategory = "beginner" | "muscleGain" | "fatLoss";

export interface ExerciseDetail {
  category: ExerciseCategory;
  steps: string[];
  muscles: { primary: string[]; secondary: string[] };
  mistakes: { mistake: string; fix: string }[];
}

const details: Record<string, ExerciseDetail> = {
  "push-ups": {
    category: "beginner",
    steps: [
      "Place hands slightly wider than shoulder-width apart",
      "Keep body in a straight line from head to toe",
      "Lower chest to floor with elbows at 45° angle",
      "Push back up fully extending arms",
      "Keep core braced throughout the movement",
    ],
    muscles: {
      primary: ["Chest", "Triceps"],
      secondary: ["Shoulders", "Core"],
    },
    mistakes: [
      {
        mistake: "Hips sagging down",
        fix: "Engage core and keep body straight",
      },
      {
        mistake: "Elbows flaring out wide",
        fix: "Keep elbows at 45° angle to body",
      },
      {
        mistake: "Partial range of motion",
        fix: "Chest should touch (or near) the floor",
      },
    ],
  },
  squats: {
    category: "muscleGain",
    steps: [
      "Stand feet shoulder-width apart, toes slightly out",
      "Keep chest up and back straight",
      "Lower hips until thighs are parallel to floor",
      "Drive through heels to stand back up",
      "Keep knees tracking over toes throughout",
    ],
    muscles: {
      primary: ["Quadriceps", "Glutes"],
      secondary: ["Hamstrings", "Core"],
    },
    mistakes: [
      { mistake: "Knees caving inward", fix: "Actively push knees outward" },
      {
        mistake: "Heels lifting off floor",
        fix: "Keep weight in heels throughout",
      },
      {
        mistake: "Rounding the back",
        fix: "Keep chest up and maintain neutral spine",
      },
    ],
  },
  plank: {
    category: "beginner",
    steps: [
      "Place forearms on floor with elbows under shoulders",
      "Body should form a straight line from head to heels",
      "Engage core, glutes, and quads simultaneously",
      "Breathe steadily — don't hold your breath",
      "Hold position without letting hips sag or rise",
    ],
    muscles: {
      primary: ["Core", "Transverse Abdominis"],
      secondary: ["Shoulders", "Glutes"],
    },
    mistakes: [
      {
        mistake: "Hips too high (piking up)",
        fix: "Lower hips to form a straight line",
      },
      { mistake: "Holding breath", fix: "Breathe rhythmically throughout" },
      {
        mistake: "Looking up/craning neck",
        fix: "Neutral neck — look at the floor",
      },
    ],
  },
  deadlift: {
    category: "muscleGain",
    steps: [
      "Feet hip-width apart, bar positioned over mid-foot",
      "Hinge at hips, grip bar just outside your legs",
      "Flat back, chest up, bar stays close to body",
      "Drive hips forward as you stand up fully",
      "Lower the bar with control along the same path",
    ],
    muscles: {
      primary: ["Hamstrings", "Glutes", "Lower Back"],
      secondary: ["Traps", "Core", "Forearms"],
    },
    mistakes: [
      {
        mistake: "Rounding lower back",
        fix: "Brace core and keep chest up before pulling",
      },
      {
        mistake: "Bar drifting away from body",
        fix: "Keep bar close to legs the whole way up",
      },
      {
        mistake: "Jerking the bar up",
        fix: "Smooth, steady pull — no sudden yanks",
      },
    ],
  },
  "bicep curl": {
    category: "muscleGain",
    steps: [
      "Stand feet shoulder-width, dumbbells at sides",
      "Palms facing forward, elbows fixed at sides",
      "Curl weights up to shoulder level",
      "Squeeze bicep at the top of movement",
      "Lower slowly with control (2 seconds down)",
    ],
    muscles: {
      primary: ["Biceps Brachii"],
      secondary: ["Forearms", "Brachialis"],
    },
    mistakes: [
      {
        mistake: "Swinging body for momentum",
        fix: "Keep elbows fixed at sides",
      },
      {
        mistake: "Incomplete range of motion",
        fix: "Full extension at bottom of each rep",
      },
      { mistake: "Rushing through reps", fix: "2 sec up, 2 sec down tempo" },
    ],
  },
  lunges: {
    category: "beginner",
    steps: [
      "Stand tall with hands on hips",
      "Step forward with one foot",
      "Lower back knee toward the floor",
      "Front thigh should be parallel to floor",
      "Push back to starting position, repeat other side",
    ],
    muscles: {
      primary: ["Quadriceps", "Glutes"],
      secondary: ["Hamstrings", "Calves"],
    },
    mistakes: [
      {
        mistake: "Front knee going past toes",
        fix: "Take a slightly shorter step",
      },
      {
        mistake: "Torso leaning too far forward",
        fix: "Keep torso upright throughout",
      },
      {
        mistake: "Back knee slamming the floor",
        fix: "Controlled descent all the way down",
      },
    ],
  },
  "shoulder press": {
    category: "muscleGain",
    steps: [
      "Hold dumbbells at shoulder height, palms facing forward",
      "Press overhead until arms are fully extended",
      "Keep core braced, slight soft bend in knees",
      "Lower slowly back to shoulder height",
      "Do not arch your lower back during the press",
    ],
    muscles: {
      primary: ["Deltoids", "Triceps"],
      secondary: ["Upper Trapezius", "Core"],
    },
    mistakes: [
      { mistake: "Arching lower back", fix: "Tighten core and engage glutes" },
      {
        mistake: "Wrists bending backward",
        fix: "Keep wrists neutral and stacked",
      },
      { mistake: "Not locking out at top", fix: "Fully extend arms at top" },
    ],
  },
  "mountain climbers": {
    category: "fatLoss",
    steps: [
      "Start in a high plank position",
      "Drive right knee toward chest",
      "Quickly switch legs in a running motion",
      "Keep hips level throughout",
      "Breathe with each rep — don't hold breath",
    ],
    muscles: {
      primary: ["Core", "Hip Flexors"],
      secondary: ["Shoulders", "Chest", "Legs"],
    },
    mistakes: [
      {
        mistake: "Hips bouncing up and down",
        fix: "Keep hips stable and flat",
      },
      { mistake: "Moving too slowly", fix: "Maintain a brisk, rhythmic pace" },
      {
        mistake: "Head dropping or craning",
        fix: "Neutral spine, look at floor",
      },
    ],
  },
  burpees: {
    category: "fatLoss",
    steps: [
      "Stand with feet hip-width apart",
      "Drop hands to floor, jump feet back to plank position",
      "Perform one full push-up",
      "Jump feet back to hands",
      "Explode up with a full jump, clap overhead",
    ],
    muscles: {
      primary: ["Full Body", "Chest", "Legs"],
      secondary: ["Core", "Shoulders", "Arms"],
    },
    mistakes: [
      {
        mistake: "Skipping the push-up",
        fix: "Do a full push-up every single rep",
      },
      {
        mistake: "Landing hard on jump down",
        fix: "Soft knees, controlled landing",
      },
      {
        mistake: "Weak jump at the top",
        fix: "Full explosive effort on every jump",
      },
    ],
  },
  "high knees": {
    category: "fatLoss",
    steps: [
      "Stand tall, arms slightly bent at sides",
      "Drive right knee up to hip height",
      "Quickly switch legs in a running motion",
      "Pump arms naturally with each stride",
      "Land softly on balls of feet",
    ],
    muscles: {
      primary: ["Hip Flexors", "Quads", "Calves"],
      secondary: ["Core", "Shoulders"],
    },
    mistakes: [
      { mistake: "Looking down", fix: "Eyes forward, keep head up" },
      { mistake: "Flat-footed landing", fix: "Land on balls of feet" },
      { mistake: "Slow, shuffling pace", fix: "Maintain fast rhythmic tempo" },
    ],
  },
};

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/bodyweight\s+/, "")
    .replace(/\s+\(.*\)/, "")
    .trim();
}

export function getExerciseDetail(name: string): ExerciseDetail {
  const key = normalize(name);
  // direct match
  if (details[key]) return details[key];
  // partial match
  const found = Object.keys(details).find(
    (k) => key.includes(k) || k.includes(key),
  );
  if (found) return details[found];

  // infer category from muscle name
  const lk = key;
  let category: ExerciseCategory = "beginner";
  if (
    lk.includes("deadlift") ||
    lk.includes("bench") ||
    lk.includes("press") ||
    lk.includes("row") ||
    lk.includes("curl") ||
    lk.includes("pull")
  )
    category = "muscleGain";
  else if (
    lk.includes("jump") ||
    lk.includes("sprint") ||
    lk.includes("hiit") ||
    lk.includes("cardio") ||
    lk.includes("burpee")
  )
    category = "fatLoss";

  return {
    category,
    steps: [
      "Set up in correct starting position",
      "Maintain proper posture and alignment",
      "Perform the movement with control",
      "Focus on the target muscle group",
      "Return to start and repeat",
    ],
    muscles: {
      primary: ["Target Muscles"],
      secondary: ["Stabilizer Muscles", "Core"],
    },
    mistakes: [
      { mistake: "Rushing through reps", fix: "Slow down, focus on form" },
      { mistake: "Incorrect posture", fix: "Keep spine neutral throughout" },
      { mistake: "Holding breath", fix: "Breathe steadily with each rep" },
    ],
  };
}
