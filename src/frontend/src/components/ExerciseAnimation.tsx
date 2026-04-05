import React from "react";

interface ExerciseAnimationProps {
  name: string;
  size?: number;
  speed?: 0.5 | 1 | 1.5;
  mirror?: boolean;
}

type AnimationType =
  | "pushup"
  | "squat"
  | "lunge"
  | "plank"
  | "crunch"
  | "jumpingjack"
  | "jump"
  | "run"
  | "curl"
  | "press"
  | "row"
  | "pullup"
  | "dip"
  | "deadlift"
  | "generic";

function getAnimationType(name: string): AnimationType {
  const n = name.toLowerCase();
  if (n.includes("push")) return "pushup";
  if (n.includes("squat")) return "squat";
  if (n.includes("lunge")) return "lunge";
  if (n.includes("plank")) return "plank";
  if (n.includes("crunch") || n.includes("sit-up") || n.includes("situp"))
    return "crunch";
  if (n.includes("jumping jack") || n.includes("jumping-jack"))
    return "jumpingjack";
  if (n.includes("jump") || n.includes("burpee")) return "jump";
  if (n.includes("run") || n.includes("jog") || n.includes("sprint"))
    return "run";
  if (n.includes("curl") || n.includes("bicep")) return "curl";
  if (n.includes("press") || n.includes("shoulder") || n.includes("overhead"))
    return "press";
  if (n.includes("row") || n.includes("rowing")) return "row";
  if (
    n.includes("pull-up") ||
    n.includes("pullup") ||
    n.includes("pull up") ||
    n.includes("chin-up")
  )
    return "pullup";
  if (n.includes("dip")) return "dip";
  if (n.includes("deadlift") || n.includes("rdl")) return "deadlift";
  return "generic";
}

const BLUE = "#3B82F6";
const DARK = "#1E3A8A";

function PushUpAnimation({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
    >
      <style>{`
        @keyframes ${id}_pushup {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        #${id}_body { animation: ${id}_pushup 1.2s ease-in-out infinite; transform-origin: 40px 50px; }
      `}</style>
      <g id={`${id}_body`}>
        {/* head */}
        <circle cx="62" cy="32" r="7" fill={BLUE} />
        {/* torso horizontal */}
        <line
          x1="55"
          y1="36"
          x2="20"
          y2="44"
          stroke={BLUE}
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* right arm down */}
        <line
          x1="52"
          y1="38"
          x2="48"
          y2="52"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* left arm down */}
        <line
          x1="28"
          y1="43"
          x2="24"
          y2="57"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* legs back */}
        <line
          x1="20"
          y1="44"
          x2="12"
          y2="50"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="18"
          y1="43"
          x2="10"
          y2="52"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* floor dots */}
        <circle cx="48" cy="54" r="3" fill={DARK} opacity="0.3" />
        <circle cx="24" cy="59" r="3" fill={DARK} opacity="0.3" />
      </g>
    </svg>
  );
}

function SquatAnimation({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
    >
      <style>{`
        @keyframes ${id}_squat {
          0%, 100% { transform: translateY(-10px) scaleY(1.1); }
          50% { transform: translateY(8px) scaleY(0.85); }
        }
        #${id}_figure { animation: ${id}_squat 1.4s ease-in-out infinite; transform-origin: 40px 50px; }
      `}</style>
      <g id={`${id}_figure`}>
        <circle cx="40" cy="18" r="8" fill={BLUE} />
        <line
          x1="40"
          y1="26"
          x2="40"
          y2="46"
          stroke={BLUE}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="34"
          x2="26"
          y2="30"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="34"
          x2="54"
          y2="30"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="46"
          x2="28"
          y2="62"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="46"
          x2="52"
          y2="62"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="28" cy="64" r="3" fill={BLUE} opacity="0.6" />
        <circle cx="52" cy="64" r="3" fill={BLUE} opacity="0.6" />
      </g>
    </svg>
  );
}

function LungeAnimation({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
    >
      <style>{`
        @keyframes ${id}_lunge {
          0%, 100% { transform: translateX(0) scaleY(1); }
          50% { transform: translateX(6px) scaleY(0.9); }
        }
        #${id}_lunge_fig { animation: ${id}_lunge 1.4s ease-in-out infinite; transform-origin: 40px 40px; }
      `}</style>
      <g id={`${id}_lunge_fig`}>
        <circle cx="40" cy="14" r="7" fill={BLUE} />
        <line
          x1="40"
          y1="21"
          x2="40"
          y2="42"
          stroke={BLUE}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="28"
          x2="28"
          y2="22"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="28"
          x2="54"
          y2="24"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* front leg bent */}
        <line
          x1="40"
          y1="42"
          x2="52"
          y2="58"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="52"
          y1="58"
          x2="60"
          y2="68"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* back leg extended */}
        <line
          x1="40"
          y1="42"
          x2="26"
          y2="58"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="26"
          y1="58"
          x2="18"
          y2="50"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

function PlankAnimation({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
    >
      <style>{`
        @keyframes ${id}_plank {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        #${id}_plank_fig { animation: ${id}_plank 2s ease-in-out infinite; transform-origin: 40px 44px; }
      `}</style>
      <g id={`${id}_plank_fig`}>
        <circle cx="62" cy="30" r="7" fill={BLUE} />
        <line
          x1="55"
          y1="35"
          x2="14"
          y2="43"
          stroke={BLUE}
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* forearms */}
        <line
          x1="50"
          y1="37"
          x2="46"
          y2="50"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="26"
          y1="42"
          x2="22"
          y2="54"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* feet */}
        <line
          x1="14"
          y1="43"
          x2="8"
          y2="48"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="16"
          y1="44"
          x2="10"
          y2="50"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

function CrunchAnimation({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
    >
      <style>{`
        @keyframes ${id}_crunch {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-30deg); }
        }
        #${id}_torso { animation: ${id}_crunch 1.4s ease-in-out infinite; transform-origin: 40px 52px; }
      `}</style>
      <g>
        {/* legs on floor */}
        <line
          x1="40"
          y1="52"
          x2="24"
          y2="66"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="52"
          x2="58"
          y2="66"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="24" cy="68" r="3" fill={BLUE} opacity="0.5" />
        <circle cx="58" cy="68" r="3" fill={BLUE} opacity="0.5" />
      </g>
      <g id={`${id}_torso`}>
        <circle cx="40" cy="26" r="8" fill={BLUE} />
        <line
          x1="40"
          y1="34"
          x2="40"
          y2="52"
          stroke={BLUE}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="40"
          x2="28"
          y2="36"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="40"
          x2="52"
          y2="36"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

function JumpingJackAnimation({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
    >
      <style>{`
        @keyframes ${id}_arms {
          0%, 100% { transform: rotate(-45deg); }
          50% { transform: rotate(45deg); }
        }
        @keyframes ${id}_legs {
          0%, 100% { transform: rotate(-20deg); }
          50% { transform: rotate(20deg); }
        }
        #${id}_arm_l { animation: ${id}_arms 0.8s ease-in-out infinite; transform-origin: 38px 34px; }
        #${id}_arm_r { animation: ${id}_arms 0.8s ease-in-out infinite reverse; transform-origin: 42px 34px; }
        #${id}_leg_l { animation: ${id}_legs 0.8s ease-in-out infinite; transform-origin: 38px 52px; }
        #${id}_leg_r { animation: ${id}_legs 0.8s ease-in-out infinite reverse; transform-origin: 42px 52px; }
      `}</style>
      <circle cx="40" cy="18" r="8" fill={BLUE} />
      <line
        x1="40"
        y1="26"
        x2="40"
        y2="52"
        stroke={BLUE}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        id={`${id}_arm_l`}
        x1="38"
        y1="34"
        x2="22"
        y2="28"
        stroke={BLUE}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        id={`${id}_arm_r`}
        x1="42"
        y1="34"
        x2="58"
        y2="28"
        stroke={BLUE}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        id={`${id}_leg_l`}
        x1="38"
        y1="52"
        x2="22"
        y2="68"
        stroke={BLUE}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        id={`${id}_leg_r`}
        x1="42"
        y1="52"
        x2="58"
        y2="68"
        stroke={BLUE}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function JumpAnimation({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
    >
      <style>{`
        @keyframes ${id}_jump {
          0%, 100% { transform: translateY(14px); }
          40% { transform: translateY(-8px); }
          50% { transform: translateY(-12px); }
          90% { transform: translateY(12px); }
        }
        #${id}_jumper { animation: ${id}_jump 1s cubic-bezier(.36,.07,.19,.97) infinite; transform-origin: 40px 40px; }
      `}</style>
      <g id={`${id}_jumper`}>
        <circle cx="40" cy="14" r="8" fill={BLUE} />
        <line
          x1="40"
          y1="22"
          x2="40"
          y2="44"
          stroke={BLUE}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="30"
          x2="26"
          y2="38"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="30"
          x2="54"
          y2="38"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="44"
          x2="30"
          y2="58"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="44"
          x2="50"
          y2="58"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

function RunAnimation({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
    >
      <style>{`
        @keyframes ${id}_run_body {
          0%, 100% { transform: rotate(-5deg) translateX(-2px); }
          50% { transform: rotate(5deg) translateX(2px); }
        }
        @keyframes ${id}_leg_f {
          0%, 100% { transform: rotate(-30deg); }
          50% { transform: rotate(30deg); }
        }
        @keyframes ${id}_leg_b {
          0%, 100% { transform: rotate(30deg); }
          50% { transform: rotate(-30deg); }
        }
        @keyframes ${id}_arm_f {
          0%, 100% { transform: rotate(40deg); }
          50% { transform: rotate(-40deg); }
        }
        @keyframes ${id}_arm_b {
          0%, 100% { transform: rotate(-40deg); }
          50% { transform: rotate(40deg); }
        }
        #${id}_run_body { animation: ${id}_run_body 0.6s ease-in-out infinite; transform-origin: 40px 35px; }
        #${id}_lf { animation: ${id}_leg_f 0.6s ease-in-out infinite; transform-origin: 40px 50px; }
        #${id}_lb { animation: ${id}_leg_b 0.6s ease-in-out infinite; transform-origin: 40px 50px; }
        #${id}_af { animation: ${id}_arm_f 0.6s ease-in-out infinite; transform-origin: 40px 34px; }
        #${id}_ab { animation: ${id}_arm_b 0.6s ease-in-out infinite; transform-origin: 40px 34px; }
      `}</style>
      <g id={`${id}_run_body`}>
        <circle cx="40" cy="18" r="7" fill={BLUE} />
        <line
          x1="40"
          y1="25"
          x2="40"
          y2="50"
          stroke={BLUE}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          id={`${id}_af`}
          x1="40"
          y1="34"
          x2="28"
          y2="44"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          id={`${id}_ab`}
          x1="40"
          y1="34"
          x2="52"
          y2="44"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          id={`${id}_lf`}
          x1="40"
          y1="50"
          x2="30"
          y2="66"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          id={`${id}_lb`}
          x1="40"
          y1="50"
          x2="52"
          y2="66"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

function CurlAnimation({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
    >
      <style>{`
        @keyframes ${id}_curl {
          0%, 100% { transform: rotate(30deg); }
          50% { transform: rotate(-60deg); }
        }
        #${id}_forearm { animation: ${id}_curl 1.2s ease-in-out infinite; transform-origin: 50px 44px; }
      `}</style>
      <circle cx="40" cy="14" r="7" fill={BLUE} />
      <line
        x1="40"
        y1="21"
        x2="40"
        y2="44"
        stroke={BLUE}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* passive left arm */}
      <line
        x1="40"
        y1="32"
        x2="28"
        y2="46"
        stroke={BLUE}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* right arm shoulder */}
      <line
        x1="40"
        y1="32"
        x2="50"
        y2="44"
        stroke={BLUE}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* forearm curling */}
      <g id={`${id}_forearm`}>
        <line
          x1="50"
          y1="44"
          x2="56"
          y2="62"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* dumbbell */}
        <rect
          x="52"
          y="60"
          width="12"
          height="5"
          rx="2"
          fill={DARK}
          opacity="0.7"
        />
      </g>
      {/* legs */}
      <line
        x1="40"
        y1="44"
        x2="32"
        y2="64"
        stroke={BLUE}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="40"
        y1="44"
        x2="48"
        y2="64"
        stroke={BLUE}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PressAnimation({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
    >
      <style>{`
        @keyframes ${id}_press {
          0%, 100% { transform: translateY(8px); }
          50% { transform: translateY(-6px); }
        }
        #${id}_arms { animation: ${id}_press 1.2s ease-in-out infinite; transform-origin: 40px 36px; }
      `}</style>
      <circle cx="40" cy="18" r="7" fill={BLUE} />
      <line
        x1="40"
        y1="25"
        x2="40"
        y2="50"
        stroke={BLUE}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <g id={`${id}_arms`}>
        <line
          x1="40"
          y1="36"
          x2="22"
          y2="28"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="36"
          x2="58"
          y2="28"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* barbell */}
        <rect
          x="14"
          y="20"
          width="52"
          height="5"
          rx="2"
          fill={DARK}
          opacity="0.7"
        />
        <circle cx="14" cy="22" r="4" fill={DARK} opacity="0.5" />
        <circle cx="66" cy="22" r="4" fill={DARK} opacity="0.5" />
      </g>
      <line
        x1="40"
        y1="50"
        x2="32"
        y2="68"
        stroke={BLUE}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="40"
        y1="50"
        x2="48"
        y2="68"
        stroke={BLUE}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RowAnimation({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
    >
      <style>{`
        @keyframes ${id}_row {
          0%, 100% { transform: translateX(6px); }
          50% { transform: translateX(-4px); }
        }
        #${id}_arm_row { animation: ${id}_row 1.2s ease-in-out infinite; transform-origin: 36px 38px; }
      `}</style>
      {/* torso bent forward */}
      <circle cx="58" cy="24" r="7" fill={BLUE} />
      <line
        x1="52"
        y1="29"
        x2="20"
        y2="44"
        stroke={BLUE}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* static back arm */}
      <line
        x1="46"
        y1="33"
        x2="40"
        y2="48"
        stroke={BLUE}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* pulling arm */}
      <g id={`${id}_arm_row`}>
        <line
          x1="36"
          y1="38"
          x2="20"
          y2="50"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <rect
          x="12"
          y="47"
          width="12"
          height="5"
          rx="2"
          fill={DARK}
          opacity="0.7"
        />
      </g>
      {/* legs */}
      <line
        x1="20"
        y1="44"
        x2="14"
        y2="62"
        stroke={BLUE}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="22"
        y1="44"
        x2="30"
        y2="62"
        stroke={BLUE}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PullUpAnimation({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
    >
      <style>{`
        @keyframes ${id}_pullup {
          0%, 100% { transform: translateY(10px); }
          50% { transform: translateY(-6px); }
        }
        #${id}_pu_body { animation: ${id}_pullup 1.4s ease-in-out infinite; transform-origin: 40px 40px; }
      `}</style>
      {/* bar */}
      <rect
        x="10"
        y="8"
        width="60"
        height="5"
        rx="2.5"
        fill={DARK}
        opacity="0.6"
      />
      <g id={`${id}_pu_body`}>
        {/* arms gripping bar */}
        <line
          x1="28"
          y1="13"
          x2="28"
          y2="30"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="52"
          y1="13"
          x2="52"
          y2="30"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="40" cy="38" r="8" fill={BLUE} />
        <line
          x1="40"
          y1="46"
          x2="40"
          y2="62"
          stroke={BLUE}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="52"
          x2="28"
          y2="60"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="52"
          x2="52"
          y2="60"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="62"
          x2="34"
          y2="74"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="62"
          x2="46"
          y2="74"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

function DipAnimation({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
    >
      <style>{`
        @keyframes ${id}_dip {
          0%, 100% { transform: translateY(-4px); }
          50% { transform: translateY(10px); }
        }
        #${id}_dip_body { animation: ${id}_dip 1.3s ease-in-out infinite; transform-origin: 40px 40px; }
      `}</style>
      {/* parallel bars */}
      <rect
        x="8"
        y="18"
        width="26"
        height="4"
        rx="2"
        fill={DARK}
        opacity="0.5"
      />
      <rect
        x="46"
        y="18"
        width="26"
        height="4"
        rx="2"
        fill={DARK}
        opacity="0.5"
      />
      <line
        x1="14"
        y1="22"
        x2="14"
        y2="72"
        stroke={DARK}
        strokeWidth="3"
        opacity="0.3"
      />
      <line
        x1="28"
        y1="22"
        x2="28"
        y2="72"
        stroke={DARK}
        strokeWidth="3"
        opacity="0.3"
      />
      <line
        x1="52"
        y1="22"
        x2="52"
        y2="72"
        stroke={DARK}
        strokeWidth="3"
        opacity="0.3"
      />
      <line
        x1="66"
        y1="22"
        x2="66"
        y2="72"
        stroke={DARK}
        strokeWidth="3"
        opacity="0.3"
      />
      <g id={`${id}_dip_body`}>
        <circle cx="40" cy="28" r="7" fill={BLUE} />
        <line
          x1="40"
          y1="35"
          x2="40"
          y2="54"
          stroke={BLUE}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="40"
          x2="20"
          y2="32"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="40"
          x2="60"
          y2="32"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="54"
          x2="32"
          y2="68"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="54"
          x2="48"
          y2="68"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

function DeadliftAnimation({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
    >
      <style>{`
        @keyframes ${id}_dl {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(35deg); }
        }
        #${id}_dl_upper { animation: ${id}_dl 1.4s ease-in-out infinite; transform-origin: 40px 50px; }
      `}</style>
      <g>
        {/* legs stay still */}
        <line
          x1="40"
          y1="50"
          x2="30"
          y2="70"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="50"
          x2="50"
          y2="70"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="30" cy="72" r="3" fill={BLUE} opacity="0.5" />
        <circle cx="50" cy="72" r="3" fill={BLUE} opacity="0.5" />
      </g>
      <g id={`${id}_dl_upper`}>
        <circle cx="40" cy="22" r="7" fill={BLUE} />
        <line
          x1="40"
          y1="29"
          x2="40"
          y2="50"
          stroke={BLUE}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="38"
          x2="26"
          y2="48"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="40"
          y1="38"
          x2="54"
          y2="48"
          stroke={BLUE}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* barbell at hands */}
        <rect
          x="18"
          y="48"
          width="44"
          height="5"
          rx="2"
          fill={DARK}
          opacity="0.6"
        />
        <circle cx="18" cy="50" r="5" fill={DARK} opacity="0.4" />
        <circle cx="62" cy="50" r="5" fill={DARK} opacity="0.4" />
      </g>
    </svg>
  );
}

function GenericAnimation({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
    >
      <style>{`
        @keyframes ${id}_pulse {
          0%, 100% { transform: scale(0.85); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes ${id}_spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        #${id}_star { animation: ${id}_pulse 1.2s ease-in-out infinite; transform-origin: 40px 40px; }
        #${id}_ring { animation: ${id}_spin 3s linear infinite; transform-origin: 40px 40px; }
      `}</style>
      <g id={`${id}_ring`}>
        <circle
          cx="40"
          cy="40"
          r="28"
          fill="none"
          stroke={BLUE}
          strokeWidth="3"
          strokeDasharray="12 8"
          opacity="0.4"
        />
      </g>
      <g id={`${id}_star`}>
        <circle cx="40" cy="26" r="5" fill={BLUE} />
        <circle cx="40" cy="54" r="5" fill={BLUE} />
        <circle cx="26" cy="40" r="5" fill={BLUE} />
        <circle cx="54" cy="40" r="5" fill={BLUE} />
        <circle cx="29" cy="29" r="4" fill={BLUE} opacity="0.6" />
        <circle cx="51" cy="29" r="4" fill={BLUE} opacity="0.6" />
        <circle cx="29" cy="51" r="4" fill={BLUE} opacity="0.6" />
        <circle cx="51" cy="51" r="4" fill={BLUE} opacity="0.6" />
        <circle cx="40" cy="40" r="8" fill={BLUE} />
      </g>
    </svg>
  );
}

let _animCounter = 0;

export function ExerciseAnimation({
  name,
  size = 80,
  speed = 1,
  mirror = false,
}: ExerciseAnimationProps) {
  const [animId] = React.useState(() => `ea${++_animCounter}`);
  const type = getAnimationType(name);

  const renderAnim = () => {
    switch (type) {
      case "pushup":
        return <PushUpAnimation id={animId} />;
      case "squat":
        return <SquatAnimation id={animId} />;
      case "lunge":
        return <LungeAnimation id={animId} />;
      case "plank":
        return <PlankAnimation id={animId} />;
      case "crunch":
        return <CrunchAnimation id={animId} />;
      case "jumpingjack":
        return <JumpingJackAnimation id={animId} />;
      case "jump":
        return <JumpAnimation id={animId} />;
      case "run":
        return <RunAnimation id={animId} />;
      case "curl":
        return <CurlAnimation id={animId} />;
      case "press":
        return <PressAnimation id={animId} />;
      case "row":
        return <RowAnimation id={animId} />;
      case "pullup":
        return <PullUpAnimation id={animId} />;
      case "dip":
        return <DipAnimation id={animId} />;
      case "deadlift":
        return <DeadliftAnimation id={animId} />;
      default:
        return <GenericAnimation id={animId} />;
    }
  };

  // Inject CSS override to control animation speed via animation-duration hack
  const speedStyle =
    speed !== 1 ? (
      <style>{`#${animId}_body, [id^="${animId}_"] { animation-duration: ${(1.2 / speed).toFixed(2)}s !important; }`}</style>
    ) : null;

  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        transform: mirror ? "scaleX(-1)" : undefined,
      }}
      aria-hidden="true"
      title={name}
    >
      {speedStyle}
      {renderAnim()}
    </div>
  );
}

export default ExerciseAnimation;
