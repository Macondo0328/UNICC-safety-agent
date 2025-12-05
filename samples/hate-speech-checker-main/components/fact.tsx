'use client';

import cx from 'classnames';
import { useEffect, useState } from 'react';

interface FactItem {
  index: number;
  sentence: string;
  claim_score: number;
  label: string;
}

const SAMPLE_FACTS: FactItem[] = [
  {
    index: 1,
    sentence: 'The Earth revolves around the Sun.',
    claim_score: 0.95,
    label: 'true',
  },
  {
    index: 2,
    sentence: 'The Moon is made of cheese.',
    claim_score: 0.1,
    label: 'false',
  },
  {
    index: 3,
    sentence: 'There might be life on Mars.',
    claim_score: 0.5,
    label: 'uncertain',
  },
  {
    index: 4,
    sentence: 'Water boils at 100°C at sea level.',
    claim_score: 0.99,
    label: 'true',
  },
  {
    index: 5,
    sentence: 'Humans can breathe underwater unaided.',
    claim_score: 0.05,
    label: 'false',
  },
];

export function Fact({ facts = SAMPLE_FACTS }: { facts?: FactItem[] }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const factsToShow = isMobile ? 3 : 5; // Show fewer facts on mobile
  const displayedFacts = facts.slice(0, factsToShow);

  return (
    <div className="flex flex-col gap-4 rounded-2xl p-4 skeleton-bg max-w-[500px] bg-gray-100">
      <h2 className="text-xl font-bold text-gray-800">Facts</h2>
      <div className="flex flex-col gap-2">
        {displayedFacts.map((fact) => (
          <div
            key={fact.index}
            className={cx(
              'p-3 rounded-lg shadow-md',
              {
                'bg-green-100': fact.label === 'true',
              },
              {
                'bg-red-100': fact.label === 'false',
              },
              {
                'bg-yellow-100': fact.label === 'uncertain',
              },
            )}
          >
            <p className="text-gray-800 text-sm">{fact.sentence}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-600">
                Claim Score: {fact.claim_score.toFixed(2)}
              </span>
              <span
                className={cx(
                  'text-xs font-semibold px-2 py-1 rounded',
                  {
                    'bg-green-200 text-green-800': fact.label === 'true',
                  },
                  {
                    'bg-red-200 text-red-800': fact.label === 'false',
                  },
                  {
                    'bg-yellow-200 text-yellow-800': fact.label === 'uncertain',
                  },
                )}
              >
                {fact.label.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
