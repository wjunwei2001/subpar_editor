import { useEffect, useState } from 'react';

const SYMBOLS = ['7', 'BAR', '$', '!', '?', '*'];

export function PullAnimation() {
  const [slots, setSlots] = useState(['?', '?', '?']);
  const [spinning, setSpinning] = useState(true);

  useEffect(() => {
    if (!spinning) return;

    const interval = setInterval(() => {
      setSlots([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]);
    }, 100);

    return () => clearInterval(interval);
  }, [spinning]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSpinning(false);
      setSlots(['7', '7', '7']);
    }, 1800);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="pull-animation">
      <div className="slot-machine">
        <div className="slots-container">
          {slots.map((symbol, i) => (
            <div key={i} className={`slot ${spinning ? 'spinning' : 'stopped'}`}>
              {symbol}
            </div>
          ))}
        </div>
      </div>
      <p className="pulling-text">
        {spinning ? 'Pulling...' : 'JACKPOT!'}
      </p>
    </div>
  );
}
