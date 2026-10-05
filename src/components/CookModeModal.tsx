import React, { useState, useEffect } from 'react';
import { RecipeDiscovery } from '../types/recipe';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle2,
  Clock,
  ListFilter,
  Flame,
} from 'lucide-react';

interface CookModeModalProps {
  recipe: RecipeDiscovery;
  onClose: () => void;
}

export const CookModeModal: React.FC<CookModeModalProps> = ({ recipe, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);

  // Simple step timer state
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min default
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Play web audio chime
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 587.33; // D5
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.2);
      } catch (e) {
        // AudioContext silent fallback
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const currentStep = recipe.steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === recipe.steps.length - 1;

  const handleReadStep = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const text = `Step ${currentStep.stepNumber}. ${currentStep.instruction}. Notice this sensory cue: ${currentStep.sensoryCue}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0C0B0A] text-[#EDE8E1] flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      {/* Top Navigation Bar */}
      <div className="px-6 py-4 border-b border-[#2A2622] flex items-center justify-between bg-[#141211]">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-[#F59E0B]/20 text-[#F59E0B]">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-[#FAF7F2] line-clamp-1">
              {recipe.title}
            </h2>
            <div className="text-xs text-[#8C8276] font-mono">
              KITCHEN COMPANION · STEP {currentStepIndex + 1} OF {recipe.steps.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowIngredients(!showIngredients)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              showIngredients
                ? 'bg-[#F59E0B] text-black border-[#F59E0B]'
                : 'bg-[#221F1C] text-[#D1C7BA] border-[#38332D] hover:bg-[#2C2723]'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Pantry ({recipe.ingredients.length})</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-md text-[#8C8276] hover:text-[#EDE8E1] hover:bg-[#221F1C] transition-colors cursor-pointer"
            title="Exit Cook Mode"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Step Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Step Progression Canvas */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 md:p-16 max-w-4xl mx-auto overflow-y-auto">
          <div>
            {/* Step Header */}
            <div className="flex items-center justify-between mb-6">
              <span className="font-serif text-xl sm:text-2xl text-[#F59E0B] font-semibold">
                Step 0{currentStep.stepNumber}
              </span>

              {'speechSynthesis' in window && (
                <button
                  onClick={handleReadStep}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#221F1C] border border-[#38332D] hover:bg-[#2E2822] text-xs text-[#D1C7BA] transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-[#F59E0B]" />
                  <span>Read aloud</span>
                </button>
              )}
            </div>

            {/* Big Instruction Text */}
            <p className="text-xl sm:text-2xl md:text-3xl font-serif text-[#FAF7F2] leading-relaxed mb-8">
              {currentStep.instruction}
            </p>

            {/* Sensory Cue Box */}
            <div className="p-5 rounded-xl bg-[#1C1814] border border-[#D97706]/30 text-sm sm:text-base text-[#EDE8E1] space-y-1 mb-6">
              <div className="text-xs uppercase tracking-wider font-semibold text-[#F59E0B] flex items-center gap-1.5">
                <span>Sensory Guide</span>
              </div>
              <p className="italic text-[#D6CEBE]">"{currentStep.sensoryCue}"</p>
            </div>

            {currentStep.tip && (
              <div className="text-sm text-[#8C8276] italic">
                Ancestral note: {currentStep.tip}
              </div>
            )}
          </div>

          {/* Kitchen Timer Widget */}
          <div className="mt-8 pt-6 border-t border-[#26221E] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#F59E0B]" />
              <span className="font-mono text-2xl font-semibold tabular-nums text-[#FAF7F2]">
                {formatTimer(timerSeconds)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#26221E] hover:bg-[#332D28] text-xs font-medium rounded-md transition-colors cursor-pointer text-[#EDE8E1]"
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Start Timer</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(300);
                }}
                className="p-2 text-[#8C8276] hover:text-[#EDE8E1] hover:bg-[#26221E] rounded-md transition-colors cursor-pointer"
                title="Reset timer to 5 minutes"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setTimerSeconds((s) => s + 60)}
                className="px-2.5 py-1.5 text-xs bg-[#221F1C] hover:bg-[#2B2723] text-[#A69C8E] rounded transition-colors cursor-pointer font-mono"
              >
                +1m
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Ingredients Sidebar */}
        {showIngredients && (
          <aside className="w-80 border-l border-[#2A2622] bg-[#141211] p-6 overflow-y-auto hidden sm:block animate-in slide-in-from-right-4">
            <div className="text-xs uppercase tracking-wider font-semibold text-[#F59E0B] mb-4">
              Pantry Reference
            </div>
            <div className="space-y-3">
              {recipe.ingredients.map((ing, i) => (
                <div key={i} className="p-2.5 rounded bg-[#1C1A18] border border-[#2B2723] text-xs">
                  <div className="flex justify-between font-medium text-[#EDE8E1]">
                    <span>{ing.item}</span>
                    <span className="font-mono text-[#F59E0B] ml-2 shrink-0">{ing.amount}</span>
                  </div>
                  {ing.accessibleSub && (
                    <div className="text-[11px] text-[#8C8276] mt-1">
                      Sub: {ing.accessibleSub}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>

      {/* Step Navigation Bar */}
      <div className="px-6 py-4 border-t border-[#2A2622] bg-[#141211] flex items-center justify-between">
        <button
          onClick={() => setCurrentStepIndex((i) => Math.max(0, i - 1))}
          disabled={isFirstStep}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer ${
            isFirstStep
              ? 'opacity-30 cursor-not-allowed text-[#736B61]'
              : 'bg-[#221F1C] hover:bg-[#2E2822] text-[#EDE8E1]'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </button>

        <div className="flex items-center gap-1.5">
          {recipe.steps.map((st, i) => (
            <button
              key={st.stepNumber}
              onClick={() => setCurrentStepIndex(i)}
              className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                i === currentStepIndex
                  ? 'bg-[#F59E0B] scale-125'
                  : i < currentStepIndex
                  ? 'bg-[#B45309]'
                  : 'bg-[#332E29]'
              }`}
              title={`Go to Step ${st.stepNumber}`}
            />
          ))}
        </div>

        {isLastStep ? (
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-medium bg-[#10B981] hover:bg-[#059669] text-white rounded-md transition-colors cursor-pointer shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Feast Complete!</span>
          </button>
        ) : (
          <button
            onClick={() => setCurrentStepIndex((i) => Math.min(recipe.steps.length - 1, i + 1))}
            className="flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-medium bg-[#F59E0B] hover:bg-[#D97706] text-black rounded-md transition-colors cursor-pointer shadow-md"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );
};
