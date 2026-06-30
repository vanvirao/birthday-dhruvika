import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface JokeQuestion {
  id: number;
  clue: string;
  options: string[];
  correctIndex: number;
  correctReaction: string;
  wrongReaction: string;
}

const questions: JokeQuestion[] = [
  {
    id: 1,
    clue: 'you want it? you like it?',
    options: ['keep it bro', 'keeeeeeeep it bro', 'i miss my ex'],
    correctIndex: 1,
    correctReaction: 'you da real art',
    wrongReaction: 'not so humble of u',
  },
  {
    id: 2,
    clue: 'what will dhruvika be when she gets older?',
    options: ['single rich aunt', 'married(ew)'],
    correctIndex: 0,
    correctReaction: 'YAYYY fuck shaurya',
    wrongReaction: 'eweweweweweweweweweweweweew',
  },
  {
    id: 3,
    clue: 'vanvis favourite ship-',
    options: [
      'harry potter and draco malfoy',
      'dhruvika and mudit',
      'laung laachi',
    ],
    correctIndex: 2,
    correctReaction: 'vanvi is lame right?',
    wrongReaction: 'ehhh wrong',
  },
  {
    id: 4,
    clue: 'dhruvika say it',
    options: ['i love my mumma :(', 'tototoday', 'faaalllll'],
    correctIndex: 0,
    correctReaction: 'good girl',
    wrongReaction: 'count your days',
  },
];

export default function InsideJokesApp() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  const current = questions[currentIndex]!;

  const handleAnswer = (index: number) => {
    if (answered) return;

    setSelectedOption(index);
    setIsCorrect(index === current.correctIndex);
    setAnswered(true);
  };

  const handleNext = () => {
    setAnswered(false);
    setSelectedOption(null);
    setIsCorrect(false);
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  };

  return (
    <div className="h-full flex flex-col bg-[#F5F5F7] rounded-b-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-black/5">
        <Gamepad2 className="w-4 h-4 text-[#5B8DEF]" />
        <span className="text-xs font-semibold text-[#1D1D1F]">
          Inside Jokes
        </span>
        <span className="text-xs text-[#6E6E73] ml-auto">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Quiz Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            className="w-full max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Clue Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-black/5 mb-5">
              <p className="text-[15px] font-medium text-[#1D1D1F] text-center leading-relaxed">
                {current.clue}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {current.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrectAnswer = index === current.correctIndex;
                const showCorrect = answered && isCorrectAnswer;
                const showWrong = answered && isSelected && !isCorrectAnswer;

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={answered}
                    className={`w-full text-left px-4 py-3 rounded-xl text-[14px] font-medium transition-all cursor-pointer border ${
                      showCorrect
                        ? 'bg-[#28C840]/10 border-[#28C840]/30 text-[#28C840]'
                        : showWrong
                        ? 'bg-[#FF5F57]/10 border-[#FF5F57]/30 text-[#FF5F57]'
                        : isSelected
                        ? 'bg-[#5B8DEF]/10 border-[#5B8DEF]/30 text-[#5B8DEF]'
                        : 'bg-white border-black/5 text-[#1D1D1F] hover:bg-black/5'
                    }`}
                    whileHover={!answered ? { scale: 1.02 } : {}}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>

                      {showCorrect && (
                        <CheckCircle2 className="w-5 h-5" />
                      )}

                      {showWrong && (
                        <XCircle className="w-5 h-5" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Reaction */}
            <AnimatePresence>
              {answered && (
                <motion.div
                  className="mt-5 text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 20,
                  }}
                >
                  <p
                    className={`text-[15px] font-semibold ${
                      isCorrect ? 'text-[#28C840]' : 'text-[#FF5F57]'
                    }`}
                  >
                    {isCorrect
                      ? current.correctReaction
                      : current.wrongReaction}
                  </p>

                  <button
                    onClick={handleNext}
                    className="mt-3 inline-flex items-center gap-2 px-5 py-2 bg-[#5B8DEF] text-white rounded-full text-sm font-medium hover:bg-[#5B8DEF]/90 transition-colors cursor-pointer"
                  >
                    Next joke
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
