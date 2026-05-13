import React, { useState, useRef } from 'react';

const Tooltip = ({ content, children }) => {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef(null);

  const showTip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(true), 300);
  };
  const hideTip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
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

    if (
      type === 'button' ||
      type === 'a' ||
      type === 'input' ||
      type === 'select' ||
      type === 'textarea'
    ) {
      return true;
    }

    const typeName = typeof type === 'string' ? type : type.displayName || type.name;
    if (typeName === 'Button' || typeName === 'Input' || typeName === 'Textarea') {
        return true;
    }

    if (props.onClick || props.tabIndex !== undefined) {
      return true;
    }

    if (props.children) {
        return React.Children.toArray(props.children).some(isInteractive);
    }

    return false;
  };

  const checkDisabledChild = (element) => {
    if (!element || !React.isValidElement(element)) return false;
    const props = element.props || {};
    if (props.disabled || props['aria-disabled'] === true || props['aria-disabled'] === 'true') {
      return true;
    }
    if (props.children) {
      return React.Children.toArray(props.children).some(checkDisabledChild);
    }
    return false;
  };

  const childrenArray = React.Children.toArray(children);
  const hasInteractiveChild = childrenArray.some(isInteractive);
  const hasDisabledChild = childrenArray.some(checkDisabledChild);

  // If the child is already interactive, we don't want the wrapper to be a focus stop.
  // If the child is disabled, we make the wrapper focusable so the tooltip can be seen via keyboard.
  const tabIndex = hasDisabledChild ? 0 : (hasInteractiveChild ? undefined : 0);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
      onFocusCapture={showTip}
      onBlurCapture={hideTip}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
      aria-describedby={visible ? "tooltip-content" : undefined}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          id="tooltip-content"
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
