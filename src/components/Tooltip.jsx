import React, { useState, useRef } from 'react';

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

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      hideTip();
    }
  };

  const isInteractive = (element) => {
    if (!element || !React.isValidElement(element)) return false;
    const type = element.type;
    const props = element.props || {};

    // Check for HTML elements
    if (
      type === 'button' ||
      type === 'a' ||
      type === 'input' ||
      type === 'select' ||
      type === 'textarea'
    ) {
      return true;
    }

    // Check for common component names that are interactive
    // Note: type.name/displayName might be minified in production,
    // but this serves as a best-effort for development.
    const typeName = typeof type === 'string' ? type : type.displayName || type.name;
    if (typeName === 'Button' || typeName === 'Input' || typeName === 'Textarea') {
        return true;
    }

    // Check for interactive props
    if (props.onClick || props.tabIndex !== undefined) {
      return true;
    }

    // Recursively check children if it's a Fragment or another component that might just be a wrapper
    if (props.children) {
        return React.Children.toArray(props.children).some(isInteractive);
    }

    return false;
  };

  const hasInteractiveChild = React.Children.toArray(children).some(isInteractive);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
      onFocusCapture={showTip}
      onBlurCapture={hideTip}
      onKeyDown={handleKeyDown}
      tabIndex={hasInteractiveChild ? -1 : 0}
      aria-describedby={visible ? "tooltip" : undefined}
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