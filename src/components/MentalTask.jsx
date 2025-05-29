import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings, Trophy, Timer } from 'lucide-react';

const ChainedMathApp = () => {
  const [sequence, setSequence] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [sequenceLength, setSequenceLength] = useState(5);
  const [numberRange, setNumberRange] = useState('medium');
  const [showSettings, setShowSettings] = useState(false);
  const [displaySpeed, setDisplaySpeed] = useState(4000); // ms between numbers
  const [currentDisplay, setCurrentDisplay] = useState('');

  const ranges = {
    easy: { min: 1, max: 10 },
    medium: { min: 1, max: 15 },
    hard: { min: 1, max: 20 },
  };

  const operations = ['+', '-'];

  const generateSequence = () => {
    const { min, max } = ranges[numberRange];
    const newSequence = [];
    let runningTotal = Math.floor(Math.random() * 20) + 10; // Starting number 10-30

    newSequence.push({ number: runningTotal, operation: null, isFirst: true });

    for (let i = 1; i < sequenceLength; i++) {
      const operation =
        operations[Math.floor(Math.random() * operations.length)];
      const number = Math.floor(Math.random() * (max - min + 1)) + min;

      if (operation === '+') {
        runningTotal += number;
      } else {
        // Ensure we don't go negative
        if (runningTotal - number < 0) {
          runningTotal += number;
          newSequence.push({ number, operation: '+', isFirst: false });
        } else {
          runningTotal -= number;
          newSequence.push({ number, operation: '-', isFirst: false });
        }
      }

      if (operation === '+' && runningTotal >= 0) {
        newSequence.push({ number, operation: '+', isFirst: false });
      }
    }

    return { sequence: newSequence, finalAnswer: runningTotal };
  };

  const startNewSequence = () => {
    const { sequence: newSeq, finalAnswer } = generateSequence();
    setSequence(newSeq);
    setCorrectAnswer(finalAnswer);
    setCurrentStep(0);
    setShowInput(false);
    setUserAnswer('');
    setFeedback('');
    setCurrentDisplay('');
    setIsPlaying(true);
  };

  const displayNextStep = () => {
    if (currentStep < sequence.length) {
      const step = sequence[currentStep];
      if (step.isFirst) {
        setCurrentDisplay(`${step.number}`);
      } else {
        setCurrentDisplay(`${step.operation} ${step.number}`);
      }
      setCurrentStep((prev) => prev + 1);
    } else {
      // Sequence complete, show input
      setShowInput(true);
      setIsPlaying(false);
      setCurrentDisplay('= ?');
    }
  };

  // Auto-advance through sequence
  useEffect(() => {
    let timer;
    if (isPlaying && currentStep < sequence.length) {
      timer = setTimeout(() => {
        displayNextStep();
      }, displaySpeed);
    } else if (currentStep >= sequence.length && sequence.length > 0) {
      timer = setTimeout(() => {
        setShowInput(true);
        setIsPlaying(false);
        setCurrentDisplay('= ?');
      }, displaySpeed);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, sequence.length, displaySpeed]);

  const submitAnswer = () => {
    const userNum = parseInt(userAnswer);
    setTotalQuestions((prev) => prev + 1);

    if (userNum === correctAnswer) {
      setScore((prev) => prev + 1);
      setFeedback(
        `Correct! 🎉 The sequence was: ${getFullSequence()} = ${correctAnswer}`
      );
    } else {
      setFeedback(
        `Incorrect. The sequence was: ${getFullSequence()} = ${correctAnswer} (you entered ${userNum})`
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && showInput) {
      submitAnswer();
    }
  };

  const reset = () => {
    setSequence([]);
    setCurrentStep(0);
    setIsPlaying(false);
    setShowInput(false);
    setCurrentDisplay('');
    setUserAnswer('');
    setFeedback('');
    setScore(0);
    setTotalQuestions(0);
  };

  const getFullSequence = () => {
    return sequence
      .map((step) => {
        if (step.isFirst) {
          return step.number.toString();
        } else {
          return ` ${step.operation} ${step.number}`;
        }
      })
      .join('');
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4'>
      <div className='max-w-3xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-purple-800 mb-2'>
            Chained Mental Math
          </h1>
          <p className='text-gray-600'>
            Keep track of the running total as numbers appear
          </p>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
            <h3 className='text-xl font-semibold mb-4 flex items-center gap-2'>
              <Settings className='w-5 h-5' />
              Settings
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Number Range
                </label>
                <select
                  value={numberRange}
                  onChange={(e) => setNumberRange(e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500'
                >
                  <option value='easy'>Easy (1-10)</option>
                  <option value='medium'>Medium (1-15)</option>
                  <option value='hard'>Hard (1-20)</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Sequence Length
                </label>
                <select
                  value={sequenceLength}
                  onChange={(e) => setSequenceLength(parseInt(e.target.value))}
                  className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500'
                >
                  <option value='3'>3 numbers</option>
                  <option value='4'>4 numbers</option>
                  <option value='5'>5 numbers</option>
                  <option value='6'>6 numbers</option>
                  <option value='7'>7 numbers</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Display Speed
                </label>
                <select
                  value={displaySpeed}
                  onChange={(e) => setDisplaySpeed(parseInt(e.target.value))}
                  className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500'
                >
                  <option value='3000'>Fast (3s)</option>
                  <option value='4000'>Medium (4s)</option>
                  <option value='5000'>Slow (5s)</option>
                  <option value='6000'>Very Slow (6s)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className='mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
            >
              Done
            </button>
          </div>
        )}

        {/* Score Display */}
        <div className='bg-white rounded-xl shadow-lg p-4 mb-6'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <Trophy className='w-5 h-5 text-yellow-500' />
              <span className='font-semibold'>
                Score: {score}/{totalQuestions}
              </span>
            </div>

            <div className='flex gap-2'>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className='p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors'
              >
                <Settings className='w-5 h-5' />
              </button>
              <button
                onClick={reset}
                className='p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
              >
                <RotateCcw className='w-5 h-5' />
              </button>
            </div>
          </div>
        </div>

        {/* Main Display Area */}
        <div className='bg-white rounded-xl shadow-lg p-12 mb-6'>
          {sequence.length === 0 ? (
            <div className='text-center'>
              <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                Ready for a mental challenge?
              </h2>
              <p className='text-gray-600 mb-6'>
                Numbers will appear one by one. Keep track of the running total
                in your head!
              </p>
              <button
                onClick={startNewSequence}
                className='px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-lg font-semibold flex items-center gap-2 mx-auto'
              >
                <Play className='w-5 h-5' />
                Start Sequence
              </button>
            </div>
          ) : (
            <div className='text-center'>
              {/* Current number display */}
              <div className='text-8xl font-bold text-purple-800 mb-6 min-h-[120px] flex items-center justify-center'>
                {currentDisplay}
              </div>

              {/* Progress indicator */}
              <div className='mb-6'>
                <div className='text-sm text-gray-500 mb-2'>
                  Step {Math.min(currentStep, sequence.length)} of{' '}
                  {sequence.length}
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-purple-600 h-2 rounded-full transition-all duration-300'
                    style={{
                      width: `${(currentStep / sequence.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Show sequence so far (for reference) - REMOVED */}
              {/* Only show the sequence after answering in feedback */}

              {/* Answer input */}
              {showInput && (
                <div className='flex justify-center items-center gap-4 mb-6'>
                  <input
                    type='number'
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder='Final answer'
                    className='text-2xl text-center p-4 border-2 border-gray-300 rounded-xl w-48 focus:border-purple-500 focus:outline-none'
                    autoFocus
                  />
                  <button
                    onClick={submitAnswer}
                    disabled={userAnswer === ''}
                    className='px-6 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg font-semibold'
                  >
                    Submit
                  </button>
                </div>
              )}

              {/* Feedback */}
              {feedback && (
                <div
                  className={`text-xl font-semibold mb-4 ${
                    feedback.includes('Correct')
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {feedback}
                </div>
              )}

              {/* Next button after feedback */}
              {feedback && (
                <button
                  onClick={startNewSequence}
                  className='px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
                >
                  Next Sequence
                </button>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className='bg-white rounded-xl shadow-lg p-6'>
          <h3 className='text-lg font-semibold mb-3'>How to Play:</h3>
          <ul className='text-gray-600 space-y-1'>
            <li>• Numbers and operations will appear one at a time</li>
            <li>• Keep track of the running total in your head</li>
            <li>• When the sequence ends, enter the final answer</li>
            <li>• Adjust sequence length and speed in settings</li>
            <li>• Only addition and subtraction are used</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChainedMathApp;
