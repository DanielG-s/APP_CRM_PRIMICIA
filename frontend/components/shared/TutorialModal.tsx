"use client";

import React, { useState, ReactNode } from 'react';
import { X, Check } from 'lucide-react';

export interface TutorialStep {
  badge: string;
  title: string;
  content: ReactNode;
  icon: ReactNode;
  color: string;
  bgElement: string;
}

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  storageKey: string;
  steps: TutorialStep[];
  finishLabel?: string;
}

export function TutorialModal({ isOpen, onClose, storageKey, steps, finishLabel = 'Começar a Usar' }: TutorialModalProps) {
  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else handleFinish();
  };

  const handleFinish = () => {
    if (dontShowAgain) {
      localStorage.setItem(storageKey, 'true');
    } else {
      localStorage.removeItem(storageKey);
    }
    onClose();
    setTimeout(() => setStep(0), 300);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row min-h-[500px] animate-in slide-in-from-bottom-4 duration-500">

        {/* ESQUERDA */}
        <div className={`${currentStep.color} md:w-5/12 relative overflow-hidden transition-colors duration-500 flex flex-col items-center justify-center p-10 text-center`}>
          <div className={`absolute top-0 right-0 w-64 h-64 ${currentStep.bgElement} rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2`} />
          <div className={`absolute bottom-0 left-0 w-48 h-48 ${currentStep.bgElement} rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2`} />

          <div className="relative z-10 mb-6 transform transition-all duration-500 hover:scale-110">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/20">
              {currentStep.icon}
            </div>
          </div>

          <h3 className="text-white font-bold text-2xl relative z-10">{currentStep.badge}</h3>
          <div className="mt-2 text-white/60 text-sm font-medium tracking-widest uppercase">
            Passo {step + 1} de {steps.length}
          </div>
        </div>

        {/* DIREITA */}
        <div className="flex-1 p-10 flex flex-col justify-between relative bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="mt-4 animate-in fade-in slide-in-from-right-4 duration-300" key={step}>
            <h2 className="text-3xl font-bold text-slate-800 mb-6">{currentStep.title}</h2>
            {currentStep.content}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === step ? `w-8 ${currentStep.color}` : 'w-2 bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-4">
                {step > 0 ? (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors"
                  >
                    Voltar
                  </button>
                ) : (
                  <div
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => setDontShowAgain(!dontShowAgain)}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      dontShowAgain ? 'bg-slate-800 border-slate-800' : 'border-slate-300'
                    }`}>
                      {dontShowAgain && <Check size={10} className="text-white" />}
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-slate-600 select-none">
                      Não mostrar mais
                    </span>
                  </div>
                )}

                <button
                  onClick={handleNext}
                  className={`px-8 py-3 rounded-xl text-white font-bold shadow-lg transform hover:-translate-y-0.5 transition-all ${
                    step === steps.length - 1
                      ? 'bg-slate-900 hover:bg-slate-800'
                      : `${currentStep.color} hover:opacity-90`
                  }`}
                >
                  {step === steps.length - 1 ? finishLabel : 'Próximo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
