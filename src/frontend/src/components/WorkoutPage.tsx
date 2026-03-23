import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Dumbbell, Home } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import CalorieBurnCalculator from "./CalorieBurnCalculator";
import ExerciseOfDayCard from "./ExerciseOfDayCard";
import WorkoutHistory, { saveWorkoutHistory } from "./WorkoutHistory";
import WorkoutTimer from "./WorkoutTimer";

interface WorkoutPageProps {
  onBack: () => void;
}

type Audience = "male" | "female" | "kids" | "teens" | "adults" | "seniors";
type Environment = "home" | "gym";
type Difficulty = "Beginner" | "Intermediate" | "Advanced";

interface Exercise {
  name: string;
  emoji: string;
  muscle: string;
  sets: string;
  rest: string;
  difficulty: Difficulty;
  tip: string;
}

interface DaySchedule {
  day: string;
  focus: string;
}

interface WorkoutPlan {
  exercises: Exercise[];
  schedule: DaySchedule[];
}

const workoutData: Record<Audience, Record<Environment, WorkoutPlan>> = {
  male: {
    home: {
      exercises: [
        {
          name: "Push-ups",
          emoji: "💪",
          muscle: "Chest, Triceps",
          sets: "4×15",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Keep core tight, body in a straight line",
        },
        {
          name: "Diamond Push-ups",
          emoji: "🔷",
          muscle: "Triceps, Inner Chest",
          sets: "3×12",
          rest: "60s",
          difficulty: "Intermediate",
          tip: "Form a diamond shape with thumbs and index fingers",
        },
        {
          name: "Pike Push-ups",
          emoji: "🔺",
          muscle: "Shoulders",
          sets: "3×10",
          rest: "60s",
          difficulty: "Intermediate",
          tip: "Hips high, lower head toward floor",
        },
        {
          name: "Pull-ups / Door Row",
          emoji: "🚪",
          muscle: "Back, Biceps",
          sets: "3×8",
          rest: "90s",
          difficulty: "Intermediate",
          tip: "Squeeze shoulder blades at the top",
        },
        {
          name: "Bodyweight Squats",
          emoji: "🦵",
          muscle: "Quads, Glutes",
          sets: "4×20",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Push knees out, keep chest up",
        },
        {
          name: "Bulgarian Split Squat",
          emoji: "🏋️",
          muscle: "Legs, Glutes",
          sets: "3×12 each",
          rest: "90s",
          difficulty: "Intermediate",
          tip: "Keep front shin vertical, go deep",
        },
        {
          name: "Plank",
          emoji: "⚡",
          muscle: "Core, Shoulders",
          sets: "3×60s",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Don't let hips sag, breathe steadily",
        },
        {
          name: "Mountain Climbers",
          emoji: "🏔️",
          muscle: "Cardio, Core",
          sets: "3×30s",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Drive knees toward chest alternately",
        },
        {
          name: "Burpees",
          emoji: "🔥",
          muscle: "Full Body, Cardio",
          sets: "3×10",
          rest: "60s",
          difficulty: "Advanced",
          tip: "Explode up with both feet, land softly",
        },
        {
          name: "Jump Squats",
          emoji: "🦘",
          muscle: "Quads, Glutes, Cardio",
          sets: "3×15",
          rest: "60s",
          difficulty: "Intermediate",
          tip: "Land with soft knees, absorb the impact",
        },
      ],
      schedule: [
        { day: "Day 1", focus: "Chest + Triceps" },
        { day: "Day 2", focus: "Back + Biceps" },
        { day: "Day 3", focus: "Legs + Glutes" },
        { day: "Day 4", focus: "Shoulders + Core" },
        { day: "Day 5", focus: "Full Body HIIT" },
        { day: "Day 6", focus: "Active Rest (Walk/Stretch)" },
        { day: "Day 7", focus: "Rest & Recovery" },
      ],
    },
    gym: {
      exercises: [
        {
          name: "Bench Press",
          emoji: "🏋️",
          muscle: "Chest, Triceps",
          sets: "4×8",
          rest: "90s",
          difficulty: "Intermediate",
          tip: "Keep shoulder blades retracted, bar touches lower chest",
        },
        {
          name: "Incline Dumbbell Press",
          emoji: "📐",
          muscle: "Upper Chest",
          sets: "3×10",
          rest: "75s",
          difficulty: "Intermediate",
          tip: "45° incline, control the eccentric",
        },
        {
          name: "Lat Pulldown",
          emoji: "🔽",
          muscle: "Back, Lats",
          sets: "4×10",
          rest: "75s",
          difficulty: "Beginner",
          tip: "Pull to upper chest, lean slightly back",
        },
        {
          name: "Barbell Row",
          emoji: "🎣",
          muscle: "Back, Rhomboids",
          sets: "4×8",
          rest: "90s",
          difficulty: "Intermediate",
          tip: "Hinge at hips, drive elbows back",
        },
        {
          name: "Overhead Press",
          emoji: "🏅",
          muscle: "Shoulders, Triceps",
          sets: "4×8",
          rest: "90s",
          difficulty: "Intermediate",
          tip: "Press bar in a slight arc, lock out at top",
        },
        {
          name: "Lateral Raises",
          emoji: "🦅",
          muscle: "Side Delts",
          sets: "3×15",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Slight elbow bend, don't shrug shoulders",
        },
        {
          name: "Barbell Squat",
          emoji: "👑",
          muscle: "Quads, Glutes",
          sets: "4×6",
          rest: "2min",
          difficulty: "Advanced",
          tip: "Bar on traps, break parallel, chest up",
        },
        {
          name: "Romanian Deadlift",
          emoji: "🔩",
          muscle: "Hamstrings, Glutes",
          sets: "3×10",
          rest: "90s",
          difficulty: "Intermediate",
          tip: "Push hips back, keep bar close to shins",
        },
        {
          name: "Leg Press",
          emoji: "🦾",
          muscle: "Quads, Glutes",
          sets: "3×12",
          rest: "75s",
          difficulty: "Beginner",
          tip: "Feet hip-width, don't lock knees fully",
        },
        {
          name: "Cable Curl",
          emoji: "💪",
          muscle: "Biceps",
          sets: "3×12",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Keep elbows fixed, squeeze at top",
        },
        {
          name: "Tricep Pushdown",
          emoji: "⬇️",
          muscle: "Triceps",
          sets: "3×12",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Keep elbows at sides, full extension",
        },
        {
          name: "Deadlift",
          emoji: "⚔️",
          muscle: "Full Posterior Chain",
          sets: "3×5",
          rest: "3min",
          difficulty: "Advanced",
          tip: "Neutral spine, push floor away, don't round back",
        },
      ],
      schedule: [
        { day: "Day 1", focus: "Chest + Triceps" },
        { day: "Day 2", focus: "Back + Biceps" },
        { day: "Day 3", focus: "Legs (Quads Focus)" },
        { day: "Day 4", focus: "Shoulders + Arms" },
        { day: "Day 5", focus: "Legs (Hamstrings + Glutes) + Deadlift" },
        { day: "Day 6", focus: "Active Rest / Cardio" },
        { day: "Day 7", focus: "Rest & Recovery" },
      ],
    },
  },
  female: {
    home: {
      exercises: [
        {
          name: "Glute Bridges",
          emoji: "🍑",
          muscle: "Glutes, Core",
          sets: "4×20",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Squeeze glutes at the top, hold 1 second",
        },
        {
          name: "Donkey Kicks",
          emoji: "🦶",
          muscle: "Glutes",
          sets: "3×15 each",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Keep hips square, don't rotate",
        },
        {
          name: "Hip Thrusts",
          emoji: "🔥",
          muscle: "Glutes, Hamstrings",
          sets: "4×15",
          rest: "60s",
          difficulty: "Intermediate",
          tip: "Drive through heels, full hip extension",
        },
        {
          name: "Sumo Squats",
          emoji: "🦵",
          muscle: "Inner Thighs, Glutes",
          sets: "4×15",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Wide stance, toes pointing out at 45°",
        },
        {
          name: "Reverse Lunges",
          emoji: "🚶",
          muscle: "Quads, Glutes",
          sets: "3×12 each",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Step back, front knee over ankle",
        },
        {
          name: "Wall Sit",
          emoji: "🧱",
          muscle: "Quads, Endurance",
          sets: "3×45s",
          rest: "60s",
          difficulty: "Beginner",
          tip: "90° angle at knees, back flat on wall",
        },
        {
          name: "Knee Push-ups",
          emoji: "💕",
          muscle: "Chest, Triceps",
          sets: "3×12",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Straight back from knees, lower chest to floor",
        },
        {
          name: "Tricep Dips (Chair)",
          emoji: "🪑",
          muscle: "Triceps, Shoulders",
          sets: "3×12",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Fingers forward, lower slowly",
        },
        {
          name: "Plank",
          emoji: "⚡",
          muscle: "Core, Shoulders",
          sets: "3×45s",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Keep body in a straight line, breathe",
        },
        {
          name: "Side Plank",
          emoji: "↔️",
          muscle: "Obliques, Core",
          sets: "3×30s each",
          rest: "30s",
          difficulty: "Intermediate",
          tip: "Stack feet or stagger for balance",
        },
        {
          name: "Jump Rope / High Knees",
          emoji: "🪢",
          muscle: "Cardio, Calves",
          sets: "3×60s",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Stay light on your feet, drive knees up",
        },
      ],
      schedule: [
        { day: "Day 1", focus: "Glutes + Hamstrings" },
        { day: "Day 2", focus: "Upper Body Tone" },
        { day: "Day 3", focus: "Full Body + Cardio" },
        { day: "Day 4", focus: "Glutes + Core" },
        { day: "Day 5", focus: "Legs + Cardio HIIT" },
        { day: "Day 6", focus: "Yoga / Stretching" },
        { day: "Day 7", focus: "Rest & Recovery" },
      ],
    },
    gym: {
      exercises: [
        {
          name: "Smith Machine Squat",
          emoji: "🏋️",
          muscle: "Quads, Glutes",
          sets: "4×12",
          rest: "75s",
          difficulty: "Intermediate",
          tip: "Feet slightly forward, controlled descent",
        },
        {
          name: "Leg Press",
          emoji: "🦾",
          muscle: "Quads, Glutes",
          sets: "3×15",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Feet shoulder-width, press through heels",
        },
        {
          name: "Hip Thrust Machine",
          emoji: "🍑",
          muscle: "Glutes",
          sets: "4×15",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Full hip extension, squeeze at top",
        },
        {
          name: "Cable Kickback",
          emoji: "🔗",
          muscle: "Glutes",
          sets: "3×15 each",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Small controlled movement, don't swing",
        },
        {
          name: "Dumbbell Romanian Deadlift",
          emoji: "🏅",
          muscle: "Hamstrings, Glutes",
          sets: "3×12",
          rest: "75s",
          difficulty: "Intermediate",
          tip: "Hinge at hips, slight knee bend, back straight",
        },
        {
          name: "Seated Row",
          emoji: "🎣",
          muscle: "Back, Biceps",
          sets: "3×12",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Drive elbows back, squeeze shoulder blades",
        },
        {
          name: "Lat Pulldown",
          emoji: "🔽",
          muscle: "Back, Lats",
          sets: "3×10",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Wide grip, pull to upper chest",
        },
        {
          name: "Dumbbell Shoulder Press",
          emoji: "☝️",
          muscle: "Shoulders",
          sets: "3×12",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Press overhead, don't arch lower back",
        },
        {
          name: "Pec Fly Machine",
          emoji: "🦋",
          muscle: "Chest",
          sets: "3×12",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Slight elbow bend, controlled squeeze",
        },
        {
          name: "Cable Crunch",
          emoji: "🔥",
          muscle: "Core, Abs",
          sets: "3×15",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Round back, crunch down, hold briefly",
        },
        {
          name: "Treadmill HIIT",
          emoji: "🏃",
          muscle: "Cardio, Full Body",
          sets: "20 min",
          rest: "—",
          difficulty: "Intermediate",
          tip: "Alternate 30s sprint / 90s walk, stay tall",
        },
      ],
      schedule: [
        { day: "Day 1", focus: "Glutes + Legs" },
        { day: "Day 2", focus: "Upper Body (Back + Arms)" },
        { day: "Day 3", focus: "Glutes + Hamstrings" },
        { day: "Day 4", focus: "Shoulders + Chest" },
        { day: "Day 5", focus: "Full Body + HIIT Cardio" },
        { day: "Day 6", focus: "Stretching / Yoga" },
        { day: "Day 7", focus: "Rest" },
      ],
    },
  },
  kids: {
    home: {
      exercises: [
        {
          name: "Star Jumps",
          emoji: "⭐",
          muscle: "Full Body, Cardio",
          sets: "3×20",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Jump and spread arms and legs wide — like a star!",
        },
        {
          name: "Bear Crawl",
          emoji: "🐻",
          muscle: "Core, Shoulders",
          sets: "3×30s",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Keep hips low, move opposite hand and foot",
        },
        {
          name: "Frog Jumps",
          emoji: "🐸",
          muscle: "Legs, Core",
          sets: "3×10",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Squat low and jump forward like a frog!",
        },
        {
          name: "Crab Walk",
          emoji: "🦀",
          muscle: "Arms, Core, Legs",
          sets: "3×20s",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Belly up, hands and feet on floor, walk sideways",
        },
        {
          name: "Hula Hoop",
          emoji: "⭕",
          muscle: "Core, Balance",
          sets: "3×60s",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Keep hips moving in circles, have fun!",
        },
        {
          name: "Skipping / Jump Rope",
          emoji: "🪢",
          muscle: "Cardio, Coordination",
          sets: "3×60s",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Stay on the balls of your feet, keep rhythm",
        },
        {
          name: "Obstacle Course (DIY)",
          emoji: "🧩",
          muscle: "Full Body, Agility",
          sets: "3 rounds",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Use pillows, chairs — make it fun and creative!",
        },
        {
          name: "Dance Cardio",
          emoji: "💃",
          muscle: "Full Body, Cardio",
          sets: "10 min",
          rest: "—",
          difficulty: "Beginner",
          tip: "Turn on your favourite song and just move!",
        },
        {
          name: "Yoga Poses (Tree, Warrior)",
          emoji: "🧘",
          muscle: "Balance, Flexibility",
          sets: "5 poses",
          rest: "20s",
          difficulty: "Beginner",
          tip: "Breathe slowly, hold each pose for 5-10 seconds",
        },
        {
          name: "Bicycle Crunches",
          emoji: "🚴",
          muscle: "Core, Abs",
          sets: "2×10",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Slow and controlled, touch elbow to opposite knee",
        },
      ],
      schedule: [
        { day: "Day 1", focus: "Fun Cardio (Dance + Jumps)" },
        { day: "Day 2", focus: "Animal Walks + Balance" },
        { day: "Day 3", focus: "Active Play + Yoga" },
        { day: "Day 4", focus: "Rest or Light Walk" },
        { day: "Day 5", focus: "Obstacle Course + Skipping" },
        { day: "Day 6", focus: "Sports / Outdoor Play" },
        { day: "Day 7", focus: "Rest & Play" },
      ],
    },
    gym: {
      exercises: [
        {
          name: "Bodyweight Squat",
          emoji: "🦵",
          muscle: "Legs, Glutes",
          sets: "3×15",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Feet shoulder-width, go slow and controlled",
        },
        {
          name: "Assisted Pull-up",
          emoji: "🏋️",
          muscle: "Back, Arms",
          sets: "3×5",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Use assisted machine, full range of motion",
        },
        {
          name: "Light Dumbbell Curl (1–2kg)",
          emoji: "💪",
          muscle: "Biceps",
          sets: "2×10",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Very light weight, slow and controlled",
        },
        {
          name: "Balance Board",
          emoji: "🏄",
          muscle: "Balance, Core",
          sets: "3×30s",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Arms out for balance, look ahead",
        },
        {
          name: "Mini Trampoline",
          emoji: "🎪",
          muscle: "Cardio, Legs",
          sets: "5 min",
          rest: "—",
          difficulty: "Beginner",
          tip: "Bounce lightly, it's supposed to be fun!",
        },
        {
          name: "Resistance Band Row",
          emoji: "🔗",
          muscle: "Back, Arms",
          sets: "2×12",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Light band, keep back straight",
        },
        {
          name: "Core Plank",
          emoji: "⚡",
          muscle: "Core",
          sets: "2×20s",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Hold still, breathe, keep body straight",
        },
        {
          name: "Agility Ladder Drills",
          emoji: "🪜",
          muscle: "Speed, Coordination",
          sets: "3 rounds",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Quick feet, stay light on your toes",
        },
      ],
      schedule: [
        { day: "Day 1", focus: "Legs + Balance" },
        { day: "Day 2", focus: "Upper Body (Light)" },
        { day: "Day 3", focus: "Cardio + Agility" },
        { day: "Day 4", focus: "Rest or Outdoor Play" },
        { day: "Day 5", focus: "Full Body Fun Circuit" },
        { day: "Day 6", focus: "Sports / Active Play" },
        { day: "Day 7", focus: "Rest" },
      ],
    },
  },
  teens: {
    home: {
      exercises: [
        {
          name: "Push-ups",
          emoji: "💪",
          muscle: "Chest, Triceps",
          sets: "3×12",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Keep body straight, lower chest to floor",
        },
        {
          name: "Bodyweight Squats",
          emoji: "🦵",
          muscle: "Quads, Glutes",
          sets: "3×15",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Knees out, chest up, go to parallel",
        },
        {
          name: "Jump Rope / High Knees",
          emoji: "🪢",
          muscle: "Cardio, Coordination",
          sets: "3×60s",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Light on feet, maintain a fast rhythm",
        },
        {
          name: "Glute Bridges",
          emoji: "🍑",
          muscle: "Glutes, Core",
          sets: "3×15",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Squeeze at top, drive through heels",
        },
        {
          name: "Plank Hold",
          emoji: "⚡",
          muscle: "Core, Full Body",
          sets: "3×30s",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Don't hold breath, keep body in one line",
        },
        {
          name: "Lunges",
          emoji: "🚶",
          muscle: "Legs, Balance",
          sets: "3×10 each",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Step forward, knee at 90°, push back up",
        },
        {
          name: "Tricep Dips (Chair)",
          emoji: "🪑",
          muscle: "Triceps",
          sets: "3×10",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Lower slowly, full extension at top",
        },
        {
          name: "Mountain Climbers",
          emoji: "🏔️",
          muscle: "Cardio, Core",
          sets: "3×30s",
          rest: "30s",
          difficulty: "Intermediate",
          tip: "Fast pace, keep hips level",
        },
        {
          name: "Burpees",
          emoji: "🔥",
          muscle: "Full Body, Cardio",
          sets: "3×8",
          rest: "60s",
          difficulty: "Intermediate",
          tip: "Explosive jump at the top",
        },
      ],
      schedule: [
        { day: "Day 1", focus: "Upper Body + Core" },
        { day: "Day 2", focus: "Legs + Cardio" },
        { day: "Day 3", focus: "Full Body Circuit" },
        { day: "Day 4", focus: "Rest or Outdoor Sports" },
        { day: "Day 5", focus: "HIIT Cardio" },
        { day: "Day 6", focus: "Flexibility / Stretching" },
        { day: "Day 7", focus: "Rest" },
      ],
    },
    gym: {
      exercises: [
        {
          name: "Dumbbell Bench Press",
          emoji: "🏋️",
          muscle: "Chest, Triceps",
          sets: "3×10",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Light weight, full range of motion",
        },
        {
          name: "Lat Pulldown",
          emoji: "🔽",
          muscle: "Back, Lats",
          sets: "3×10",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Pull to chest, lean slightly back",
        },
        {
          name: "Leg Press (Moderate)",
          emoji: "🦾",
          muscle: "Quads, Glutes",
          sets: "3×12",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Moderate weight, full range of motion",
        },
        {
          name: "Dumbbell Shoulder Press",
          emoji: "☝️",
          muscle: "Shoulders",
          sets: "3×10",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Light weight, press directly overhead",
        },
        {
          name: "Cable Row",
          emoji: "🎣",
          muscle: "Back, Biceps",
          sets: "3×12",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Sit tall, drive elbows back",
        },
        {
          name: "Goblet Squat",
          emoji: "🥤",
          muscle: "Quads, Core",
          sets: "3×12",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Hold dumbbell at chest, squat deep",
        },
        {
          name: "Dumbbell Curl",
          emoji: "💪",
          muscle: "Biceps",
          sets: "3×12",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Controlled movement, full extension",
        },
        {
          name: "Tricep Pushdown",
          emoji: "⬇️",
          muscle: "Triceps",
          sets: "3×12",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Elbows fixed, full extension",
        },
        {
          name: "Plank / Ab Wheel",
          emoji: "⚡",
          muscle: "Core",
          sets: "3×30s",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Steady and controlled",
        },
        {
          name: "Treadmill / Bike",
          emoji: "🏃",
          muscle: "Cardio",
          sets: "15–20 min",
          rest: "—",
          difficulty: "Beginner",
          tip: "Moderate pace, warm up and cool down",
        },
      ],
      schedule: [
        { day: "Day 1", focus: "Chest + Triceps" },
        { day: "Day 2", focus: "Back + Biceps" },
        { day: "Day 3", focus: "Legs + Cardio" },
        { day: "Day 4", focus: "Shoulders + Core" },
        { day: "Day 5", focus: "Full Body Circuit" },
        { day: "Day 6", focus: "Cardio / Sports" },
        { day: "Day 7", focus: "Rest" },
      ],
    },
  },
  adults: {
    home: {
      exercises: [
        {
          name: "Push-ups (Variations)",
          emoji: "💪",
          muscle: "Chest, Shoulders, Triceps",
          sets: "4×15",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Progress from knee to full to archer push-ups",
        },
        {
          name: "Jump Squats",
          emoji: "🦘",
          muscle: "Quads, Glutes, Cardio",
          sets: "3×15",
          rest: "60s",
          difficulty: "Intermediate",
          tip: "Soft landing, absorb with knees",
        },
        {
          name: "Bulgarian Split Squat",
          emoji: "🏋️",
          muscle: "Legs, Glutes",
          sets: "3×12 each",
          rest: "75s",
          difficulty: "Intermediate",
          tip: "Back foot elevated, front knee tracks toes",
        },
        {
          name: "Hip Thrusts (Floor)",
          emoji: "🔥",
          muscle: "Glutes, Hamstrings",
          sets: "4×20",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Full hip extension, squeeze glutes",
        },
        {
          name: "Plank to Push-up",
          emoji: "⚡",
          muscle: "Core, Chest, Arms",
          sets: "3×10",
          rest: "45s",
          difficulty: "Intermediate",
          tip: "One arm at a time, keep hips stable",
        },
        {
          name: "Burpees",
          emoji: "🔥",
          muscle: "Full Body",
          sets: "3×12",
          rest: "60s",
          difficulty: "Intermediate",
          tip: "Land softly, maintain pace",
        },
        {
          name: "Bicycle Crunches",
          emoji: "🚴",
          muscle: "Core, Obliques",
          sets: "3×20",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Slow and deliberate, full rotation",
        },
        {
          name: "Reverse Lunges",
          emoji: "🚶",
          muscle: "Legs, Balance",
          sets: "3×12 each",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Step back, maintain upright torso",
        },
        {
          name: "Pike Push-ups",
          emoji: "🔺",
          muscle: "Shoulders",
          sets: "3×10",
          rest: "60s",
          difficulty: "Intermediate",
          tip: "Hips high, head toward floor",
        },
        {
          name: "HIIT Cardio (Tabata)",
          emoji: "⏱️",
          muscle: "Cardio, Full Body",
          sets: "8 rounds 20s on/10s off",
          rest: "—",
          difficulty: "Advanced",
          tip: "Max effort for 20s, full rest 10s",
        },
      ],
      schedule: [
        { day: "Day 1", focus: "Upper Body Strength" },
        { day: "Day 2", focus: "Lower Body + Glutes" },
        { day: "Day 3", focus: "HIIT Cardio" },
        { day: "Day 4", focus: "Core + Flexibility" },
        { day: "Day 5", focus: "Full Body Circuit" },
        { day: "Day 6", focus: "Active Recovery" },
        { day: "Day 7", focus: "Rest" },
      ],
    },
    gym: {
      exercises: [
        {
          name: "Barbell Bench Press",
          emoji: "🏋️",
          muscle: "Chest, Triceps",
          sets: "4×8",
          rest: "90s",
          difficulty: "Intermediate",
          tip: "Bar touches lower chest, elbows at 45°",
        },
        {
          name: "Pull-ups / Assisted",
          emoji: "🔝",
          muscle: "Back, Biceps",
          sets: "4×8",
          rest: "90s",
          difficulty: "Intermediate",
          tip: "Full hang to chin over bar",
        },
        {
          name: "Barbell Squat",
          emoji: "👑",
          muscle: "Quads, Glutes",
          sets: "4×8",
          rest: "2min",
          difficulty: "Advanced",
          tip: "Break parallel, bar on upper traps",
        },
        {
          name: "Overhead Press",
          emoji: "☝️",
          muscle: "Shoulders",
          sets: "3×10",
          rest: "90s",
          difficulty: "Intermediate",
          tip: "Press in front of face, full lockout",
        },
        {
          name: "Deadlift",
          emoji: "⚔️",
          muscle: "Full Body",
          sets: "3×6",
          rest: "3min",
          difficulty: "Advanced",
          tip: "Neutral spine, bar over mid-foot, big breath",
        },
        {
          name: "Cable Row",
          emoji: "🎣",
          muscle: "Back",
          sets: "3×12",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Tall posture, drive elbows back",
        },
        {
          name: "Romanian Deadlift",
          emoji: "🔩",
          muscle: "Hamstrings",
          sets: "3×10",
          rest: "75s",
          difficulty: "Intermediate",
          tip: "Hinge at hips, bar close to legs",
        },
        {
          name: "Lateral Raises",
          emoji: "🦅",
          muscle: "Shoulders",
          sets: "3×15",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Controlled, no momentum",
        },
        {
          name: "Tricep Dips (Parallel Bars)",
          emoji: "🏅",
          muscle: "Triceps, Chest",
          sets: "3×10",
          rest: "60s",
          difficulty: "Intermediate",
          tip: "Lean forward for more chest, upright for triceps",
        },
        {
          name: "Ab Wheel Rollout",
          emoji: "⚡",
          muscle: "Core",
          sets: "3×10",
          rest: "45s",
          difficulty: "Advanced",
          tip: "From knees, don't let hips sag",
        },
      ],
      schedule: [
        { day: "Day 1", focus: "Chest + Triceps" },
        { day: "Day 2", focus: "Back + Biceps" },
        { day: "Day 3", focus: "Legs (Squat Focus)" },
        { day: "Day 4", focus: "Shoulders + Core" },
        { day: "Day 5", focus: "Deadlift + Accessories" },
        { day: "Day 6", focus: "Cardio / Active Recovery" },
        { day: "Day 7", focus: "Rest" },
      ],
    },
  },
  seniors: {
    home: {
      exercises: [
        {
          name: "Chair Sit-to-Stand",
          emoji: "🪑",
          muscle: "Quads, Glutes",
          sets: "3×10",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Lean slightly forward, push through heels, use arms if needed",
        },
        {
          name: "Wall Push-ups",
          emoji: "🧱",
          muscle: "Chest, Shoulders",
          sets: "3×10",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Arms at chest height, lower slowly",
        },
        {
          name: "Heel Raises",
          emoji: "👟",
          muscle: "Calves, Balance",
          sets: "3×15",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Hold chair for balance, rise up on toes slowly",
        },
        {
          name: "Seated Leg Raises",
          emoji: "🦵",
          muscle: "Core, Hip Flexors",
          sets: "3×10 each",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Sit tall, lift leg straight, hold 2 seconds",
        },
        {
          name: "Side Steps with Band",
          emoji: "↔️",
          muscle: "Glutes, Hips",
          sets: "3×10 each",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Light band around ankles, stay bent",
        },
        {
          name: "Shoulder Rolls",
          emoji: "🌀",
          muscle: "Shoulders, Mobility",
          sets: "2×10 each direction",
          rest: "20s",
          difficulty: "Beginner",
          tip: "Slow circles, breathe throughout",
        },
        {
          name: "Neck Rolls",
          emoji: "🔄",
          muscle: "Neck, Mobility",
          sets: "2×10 each direction",
          rest: "20s",
          difficulty: "Beginner",
          tip: "Gentle and slow, never force",
        },
        {
          name: "Standing Marching",
          emoji: "🚶",
          muscle: "Balance, Core",
          sets: "3×30s",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Hold wall if needed, lift knees to hip height",
        },
        {
          name: "Gentle Yoga / Stretching",
          emoji: "🧘",
          muscle: "Flexibility, Full Body",
          sets: "10 min",
          rest: "—",
          difficulty: "Beginner",
          tip: "Hold each stretch 20–30 seconds, breathe deeply",
        },
        {
          name: "Walking",
          emoji: "🌿",
          muscle: "Cardio, Joints",
          sets: "30 min",
          rest: "—",
          difficulty: "Beginner",
          tip: "Brisk walking recommended daily — best medicine!",
        },
      ],
      schedule: [
        { day: "Day 1", focus: "Strength (Legs + Balance)" },
        { day: "Day 2", focus: "Walk 30 min" },
        { day: "Day 3", focus: "Upper Body + Mobility" },
        { day: "Day 4", focus: "Rest or Gentle Yoga" },
        { day: "Day 5", focus: "Full Body + Stretching" },
        { day: "Day 6", focus: "Walk 30 min" },
        { day: "Day 7", focus: "Rest & Relaxation" },
      ],
    },
    gym: {
      exercises: [
        {
          name: "Leg Press Machine (Low Load)",
          emoji: "🦾",
          muscle: "Quads, Glutes",
          sets: "3×12",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Light weight, full range, slow and controlled",
        },
        {
          name: "Seated Row Machine",
          emoji: "🎣",
          muscle: "Back, Biceps",
          sets: "3×10",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Upright posture, squeeze back at end",
        },
        {
          name: "Chest Press Machine",
          emoji: "🏋️",
          muscle: "Chest, Shoulders",
          sets: "3×10",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Light setting, never lock elbows fully",
        },
        {
          name: "Cable Machine Pull-down",
          emoji: "🔽",
          muscle: "Back, Lats",
          sets: "3×10",
          rest: "60s",
          difficulty: "Beginner",
          tip: "Wide grip, pull to chest height",
        },
        {
          name: "Recumbent Bike",
          emoji: "🚴",
          muscle: "Cardio, Legs",
          sets: "15–20 min",
          rest: "—",
          difficulty: "Beginner",
          tip: "Comfortable pace, low resistance",
        },
        {
          name: "Resistance Band Exercises",
          emoji: "🔗",
          muscle: "Full Body, Light Toning",
          sets: "3 rounds",
          rest: "45s",
          difficulty: "Beginner",
          tip: "Light band, focus on smooth movement",
        },
        {
          name: "Balance Board / Beam",
          emoji: "🏄",
          muscle: "Balance, Core",
          sets: "3×30s",
          rest: "30s",
          difficulty: "Beginner",
          tip: "Stand near wall for safety, focus ahead",
        },
        {
          name: "Treadmill (Slow Walk)",
          emoji: "🌿",
          muscle: "Cardio, Joints",
          sets: "15 min",
          rest: "—",
          difficulty: "Beginner",
          tip: "Slow and steady, hold rails if needed",
        },
      ],
      schedule: [
        { day: "Day 1", focus: "Lower Body Machines" },
        { day: "Day 2", focus: "Recumbent Bike + Walk" },
        { day: "Day 3", focus: "Upper Body Machines" },
        { day: "Day 4", focus: "Rest" },
        { day: "Day 5", focus: "Full Body Circuit (Light)" },
        { day: "Day 6", focus: "Treadmill + Stretching" },
        { day: "Day 7", focus: "Rest" },
      ],
    },
  },
};

const audienceConfig = [
  { id: "male" as Audience, label: "👨 Male", ageRange: "All ages" },
  { id: "female" as Audience, label: "👩 Female", ageRange: "All ages" },
  { id: "kids" as Audience, label: "🧒 Kids", ageRange: "6–14 yrs" },
  { id: "teens" as Audience, label: "🧑 Teens", ageRange: "15–17 yrs" },
  { id: "adults" as Audience, label: "🧑‍💼 Adults", ageRange: "18–55 yrs" },
  { id: "seniors" as Audience, label: "👴 Seniors", ageRange: "55+ yrs" },
];

const difficultyColors: Record<
  Difficulty,
  { border: string; badge: string; dot: string }
> = {
  Beginner: {
    border: "border-l-emerald-500",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  Intermediate: {
    border: "border-l-blue-500",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  Advanced: {
    border: "border-l-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    dot: "bg-red-500",
  },
};

function getAutoAudience(): Audience {
  try {
    const raw = localStorage.getItem("doitepic-user");
    if (!raw) return "adults";
    const profile = JSON.parse(raw);
    const age = Number.parseInt(profile.age ?? "25", 10);
    const gender = (profile.gender ?? "male").toLowerCase();
    if (age >= 6 && age <= 14) return "kids";
    if (age >= 15 && age <= 17) return "teens";
    if (age >= 55) return "seniors";
    return gender === "female" ? "female" : "male";
  } catch {
    return "adults";
  }
}

function ExerciseCard({
  exercise,
  index,
}: { exercise: Exercise; index: number }) {
  const colors = difficultyColors[exercise.difficulty];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={`bg-card border border-border border-l-4 ${colors.border} rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{exercise.emoji}</span>
          <div>
            <h4 className="font-semibold text-foreground text-sm leading-tight">
              {exercise.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {exercise.muscle}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${colors.badge}`}
        >
          {exercise.difficulty}
        </span>
      </div>
      <div className="flex gap-3 flex-wrap mt-3">
        <div className="flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1">
          <span className="text-xs font-mono font-bold text-foreground">
            {exercise.sets}
          </span>
          <span className="text-xs text-muted-foreground">sets/reps</span>
        </div>
        <div className="flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1">
          <span className="text-xs font-mono font-bold text-foreground">
            {exercise.rest}
          </span>
          <span className="text-xs text-muted-foreground">rest</span>
        </div>
      </div>
      <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/40">
        <p className="text-xs text-amber-800 dark:text-amber-300">
          <span className="font-semibold">💡 Tip: </span>
          {exercise.tip}
        </p>
      </div>
    </motion.div>
  );
}

function WeeklySchedule({ schedule }: { schedule: DaySchedule[] }) {
  const colors = [
    "bg-blue-600",
    "bg-indigo-600",
    "bg-violet-600",
    "bg-emerald-600",
    "bg-amber-600",
    "bg-orange-500",
    "bg-slate-400",
  ];
  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={18} className="text-primary" />
        <h3 className="font-bold text-foreground text-base">Weekly Schedule</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
        {schedule.map((day, i) => (
          <div
            key={day.day}
            className="bg-card border border-border rounded-xl p-3 text-center"
          >
            <div
              className={`w-8 h-8 rounded-full ${colors[i % colors.length]} flex items-center justify-center mx-auto mb-2`}
            >
              <span className="text-white text-xs font-bold">{i + 1}</span>
            </div>
            <p className="text-xs font-semibold text-foreground">{day.day}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-tight">
              {day.focus}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WorkoutPage({ onBack }: WorkoutPageProps) {
  const [audience, setAudience] = useState<Audience>(getAutoAudience);
  const [env, setEnv] = useState<Environment>("home");
  const [showTimer, setShowTimer] = useState(false);
  const [timerPlanName, setTimerPlanName] = useState("");
  const [timerAudience, setTimerAudience] = useState<Audience>("adults");
  const [timerEnv, setTimerEnv] = useState<Environment>("home");
  const [bodyPartFilter, setBodyPartFilter] = useState<string>("All");

  const plan = workoutData[audience][env];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <button
            type="button"
            data-ocid="workout.back_button"
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Dumbbell size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">MoveEpic</h1>
              <p className="text-blue-100 text-sm">
                Your complete workout guide — Home & Gym
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 text-sm">
            {[
              "6 Audience Types",
              "Home & Gym Plans",
              "Technique Tips",
              "Weekly Schedules",
            ].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-white/15 rounded-full text-white/90 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Audience Tabs */}
        <ExerciseOfDayCard />
        <CalorieBurnCalculator />

        <div data-ocid="workout.tab" className="mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Select Your Group
          </p>
          <div className="flex flex-wrap gap-2">
            {audienceConfig.map((a) => (
              <button
                key={a.id}
                type="button"
                data-ocid={`workout.${a.id}_tab`}
                onClick={() => setAudience(a.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  audience === a.id
                    ? "bg-[#1E3A8A] text-white shadow-md scale-105"
                    : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {a.label}
                <span
                  className={`ml-1.5 text-xs ${audience === a.id ? "text-blue-200" : "text-muted-foreground/60"}`}
                >
                  ({a.ageRange})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Environment Toggle */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-muted rounded-xl w-fit">
          <button
            type="button"
            data-ocid="workout.home_toggle"
            onClick={() => setEnv("home")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              env === "home"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home size={15} />
            Home Workout
          </button>
          <button
            type="button"
            data-ocid="workout.gym_toggle"
            onClick={() => setEnv("gym")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              env === "gym"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Dumbbell size={15} />
            Gym Workout
          </button>
        </div>

        {/* Body Part Filter */}
        <div className="mb-4" data-ocid="workout.tab">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Filter by Muscle Group
          </p>
          <div className="flex flex-wrap gap-2">
            {["All", "Arms", "Legs", "Core", "Back", "Chest", "Full Body"].map(
              (bp) => (
                <button
                  key={bp}
                  type="button"
                  onClick={() => setBodyPartFilter(bp)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    bodyPartFilter === bp
                      ? "bg-[#1E3A8A] text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  {bp}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Difficulty Legend */}
        <div className="flex items-center gap-4 mb-5 text-xs text-muted-foreground">
          <span className="font-medium">Difficulty:</span>
          {(["Beginner", "Intermediate", "Advanced"] as Difficulty[]).map(
            (d) => (
              <div key={d} className="flex items-center gap-1.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${difficultyColors[d].dot}`}
                />
                {d}
              </div>
            ),
          )}
        </div>

        {/* Exercise Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${audience}-${env}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Start Workout Button */}
            <div className="flex justify-center mb-6">
              <button
                type="button"
                data-ocid="workout.primary_button"
                onClick={() => {
                  setTimerPlanName(
                    `${audienceConfig.find((a) => a.id === audience)?.label ?? audience} – ${env === "home" ? "Home" : "Gym"} Workout`,
                  );
                  setTimerAudience(audience);
                  setTimerEnv(env);
                  setShowTimer(true);
                }}
                className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] hover:from-[#1e40af] hover:to-[#2563eb] text-white font-bold rounded-full shadow-lg text-sm transition-all active:scale-95"
              >
                <span className="text-base">▶</span>
                Start Workout
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.exercises
                .filter((ex) => {
                  if (bodyPartFilter === "All") return true;
                  const m = ex.muscle.toLowerCase();
                  if (bodyPartFilter === "Arms")
                    return (
                      m.includes("bicep") ||
                      m.includes("tricep") ||
                      m.includes("arm") ||
                      m.includes("forearm")
                    );
                  if (bodyPartFilter === "Legs")
                    return (
                      m.includes("quad") ||
                      m.includes("glute") ||
                      m.includes("hamstring") ||
                      m.includes("calf") ||
                      m.includes("leg")
                    );
                  if (bodyPartFilter === "Core")
                    return (
                      m.includes("core") ||
                      m.includes("abs") ||
                      m.includes("oblique")
                    );
                  if (bodyPartFilter === "Back")
                    return (
                      m.includes("back") ||
                      m.includes("lat") ||
                      m.includes("rhomboid")
                    );
                  if (bodyPartFilter === "Chest")
                    return m.includes("chest") || m.includes("pec");
                  if (bodyPartFilter === "Full Body")
                    return m.includes("full body");
                  return true;
                })
                .map((ex, i) => (
                  <ExerciseCard key={ex.name} exercise={ex} index={i} />
                ))}
            </div>

            {/* Weekly Schedule */}
            <WeeklySchedule schedule={plan.schedule} />
          </motion.div>
        </AnimatePresence>

        {/* Workout History */}
        <WorkoutHistory />

        {/* Safety Note */}
        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-bold">⚠️ Safety Note: </span>
            Always warm up for 5–10 minutes before any workout. Stop if you feel
            pain. Consult a doctor before starting a new exercise program,
            especially if you have health conditions.
          </p>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground mt-10 pb-6">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="underline hover:text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </footer>
      </div>

      {/* Workout Timer Overlay */}
      <AnimatePresence>
        {showTimer && (
          <WorkoutTimer
            exercises={plan.exercises}
            planName={timerPlanName}
            onClose={() => setShowTimer(false)}
            onSaveHistory={(durationSeconds) => {
              const entry = {
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                date: new Date().toISOString(),
                planName: timerPlanName,
                audience: timerAudience,
                workoutType: timerEnv === "gym" ? "Gym" : "Home",
                durationSeconds,
                xpEarned: 20,
              } as const;
              saveWorkoutHistory(entry);
              window.dispatchEvent(new Event("doitepic_workout_saved"));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
