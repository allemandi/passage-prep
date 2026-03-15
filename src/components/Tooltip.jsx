import { useState, useRef } from 'react';

const Tooltip = ({ content, children }) => {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef(null);

  const showTip = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), 300);
  };
  const hideTip = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
      onFocus={showTip}
      onBlur={hideTip}
      tabIndex={0}
      aria-describedby="tooltip"
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          id="tooltip"
          className="
            absolute bottom-full mb-3 left-1/2 -translate-x-1/2
            bg-app-text text-app-surface text-xs font-bold rounded-lg px-3 py-1.5
            whitespace-nowrap z-50
            pointer-events-none
            shadow-xl
            animate-in fade-in zoom-in-95 duration-200
          "
        >
          {content}
        </span>
      )}
    </span>
  );
};

export default Tooltip;