type ScoreBadgeProps = {
  score: number;
  maxScore: number;
};

const getScoreColor = (pct: number): string => {
  if (pct >= 90) return 'bg-emerald-100 text-emerald-700';
  if (pct >= 75) return 'bg-blue-100 text-blue-700';
  if (pct >= 60) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
};

export const ScoreBadge = ({ score, maxScore }: ScoreBadgeProps) => {
  const pct = Math.round((score / maxScore) * 100);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getScoreColor(pct)}`}
    >
      {score}/{maxScore}
    </span>
  );
};
