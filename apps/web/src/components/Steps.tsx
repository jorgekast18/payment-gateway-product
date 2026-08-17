interface StepsProps {
  current: number;
  total?: number;
}

export const Steps = ({ current, total = 4 }: StepsProps) => (
  <div className="steps" aria-label={`Step ${current} of ${total}`}>
    {Array.from({ length: total }, (_, index) => (
      <span
        key={index}
        className={`steps__item${index < current ? ' steps__item--active' : ''}`}
      />
    ))}
  </div>
);
