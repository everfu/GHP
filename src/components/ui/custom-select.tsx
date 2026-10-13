'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { ReferenceMenu } from './reference-motion';

export interface SelectOption<Value extends string = string> {
  value: Value;
  label: string;
  disabled?: boolean;
}

export interface CustomSelectProps<Value extends string = string> {
  label: string;
  value: Value;
  options: readonly SelectOption<Value>[];
  onChange: (value: Value) => void;
  active?: boolean;
  disabled?: boolean;
}

export function CustomSelect<Value extends string>({
  label,
  value,
  options,
  onChange,
  active = false,
  disabled = false,
}: CustomSelectProps<Value>) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const typeahead = useRef({ text: '', time: 0 });
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<Value | null>(null);
  const [position, setPosition] = useState({
    left: 0,
    top: 0,
    width: 160,
    maxHeight: 240,
    above: false,
  });
  const enabled = options
    .map((option, index) => (option.disabled ? -1 : index))
    .filter((index) => index !== -1);
  const selected = options.find((option) => option.value === value);
  const disabledControl = disabled || enabled.length === 0;
  const highlightedIndex = options.findIndex(
    (option) => option.value === highlighted && !option.disabled,
  );
  const selectedIndex = options.findIndex((option) => option.value === value && !option.disabled);
  const currentIndex =
    highlightedIndex !== -1 ? highlightedIndex : selectedIndex !== -1 ? selectedIndex : enabled[0];
  const expanded = open && !disabledControl;

  useLayoutEffect(() => {
    if (!expanded) return;
    let frame = 0;
    function place() {
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect) return;
      const viewport = window.visualViewport;
      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportLeft = viewport?.offsetLeft ?? 0;
      const viewportWidth = viewport?.width ?? window.innerWidth;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const below = viewportTop + viewportHeight - rect.bottom - 12;
      const above = rect.top - viewportTop - 12;
      const useAbove = below < 160 && above > below;
      const maxHeight = Math.max(36, Math.min(240, useAbove ? above : below));
      const width = Math.min(Math.max(160, rect.width), viewportWidth - 16);
      const left = Math.max(
        viewportLeft + 8,
        Math.min(rect.left, viewportLeft + viewportWidth - width - 8),
      );
      const next = {
        left,
        top: useAbove ? rect.top - 4 : rect.bottom + 4,
        width,
        maxHeight,
        above: useAbove,
      };
      setPosition((previous) =>
        previous.left === next.left &&
        previous.top === next.top &&
        previous.width === next.width &&
        previous.maxHeight === next.maxHeight &&
        previous.above === next.above
          ? previous
          : next,
      );
    }
    // The result's entrance transform moves the anchor without firing scroll/resize.
    function followEntrance() {
      place();
      const reveal = trigger.current?.closest('[data-motion-reveal]');
      if (reveal?.getAnimations().some((animation) => animation.playState === 'running')) {
        frame = requestAnimationFrame(followEntrance);
      }
    }
    followEntrance();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    window.visualViewport?.addEventListener('resize', place);
    window.visualViewport?.addEventListener('scroll', place);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      window.visualViewport?.removeEventListener('resize', place);
      window.visualViewport?.removeEventListener('scroll', place);
    };
  }, [expanded]);

  useLayoutEffect(() => {
    if (expanded)
      popup.current
        ?.querySelector<HTMLElement>(`[data-option-index="${currentIndex}"]`)
        ?.scrollIntoView({ block: 'nearest' });
  }, [expanded, currentIndex, position.maxHeight]);

  useEffect(() => {
    if (!expanded) return;
    function dismiss(event: PointerEvent) {
      const target = event.target as Node;
      if (!trigger.current?.contains(target) && !popup.current?.contains(target)) setOpen(false);
    }
    function escape(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
    }
    document.addEventListener('pointerdown', dismiss);
    window.addEventListener('keydown', escape, true);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      window.removeEventListener('keydown', escape, true);
    };
  }, [expanded]);

  function choose(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }

  function keyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.nativeEvent.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Tab') {
      setOpen(false);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (expanded) choose(currentIndex);
      else {
        setHighlighted(selected?.value ?? null);
        setOpen(true);
      }
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const offset = enabled.indexOf(currentIndex);
      const next =
        event.key === 'Home'
          ? enabled[0]
          : event.key === 'End'
            ? enabled.at(-1)
            : !expanded
              ? selectedIndex !== -1
                ? selectedIndex
                : event.key === 'ArrowUp'
                  ? enabled.at(-1)
                  : enabled[0]
              : enabled[
                  (offset + (event.key === 'ArrowDown' ? 1 : enabled.length - 1)) % enabled.length
                ];
      if (next !== undefined) setHighlighted(options[next].value);
      setOpen(true);
      return;
    }
    if (event.key.length !== 1) return;
    event.preventDefault();
    const char = event.key.toLocaleLowerCase();
    const text = Date.now() - typeahead.current.time < 600 ? typeahead.current.text + char : char;
    typeahead.current = { text, time: Date.now() };
    const query = Array.from(text).every((letter) => letter === char) ? char : text;
    for (let step = 1; step <= options.length; step++) {
      const index = (currentIndex + step) % options.length;
      if (!options[index].disabled && options[index].label.toLocaleLowerCase().startsWith(query)) {
        setHighlighted(options[index].value);
        setOpen(true);
        break;
      }
    }
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        role="combobox"
        className={`custom-select ${active ? 'is-active' : ''}`}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={expanded}
        aria-controls={expanded ? id : undefined}
        aria-activedescendant={expanded ? `${id}-${currentIndex}` : undefined}
        disabled={disabledControl}
        onKeyDown={keyDown}
        onBlur={(event) => {
          if (event.relatedTarget && !popup.current?.contains(event.relatedTarget as Node))
            setOpen(false);
        }}
        onClick={() => {
          setHighlighted(selected?.value ?? null);
          setOpen(!expanded);
        }}
      >
        <span>{selected?.label ?? label}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      {typeof document !== 'undefined'
        ? createPortal(
            <div
              className="select-popup-position"
              style={{
                left: position.left,
                top: position.top,
                width: position.width,
                transform: position.above ? 'translateY(-100%)' : undefined,
              }}
            >
              <AnimatePresence>
                {expanded ? (
                  <ReferenceMenu
                    key={id}
                    ref={popup}
                    id={id}
                    role="listbox"
                    aria-label={label}
                    className="select-popup"
                    data-select-popup
                    side={position.above ? 'top' : 'bottom'}
                    data-side={position.above ? 'top' : 'bottom'}
                    style={{ maxHeight: position.maxHeight }}
                  >
                    {options.map((option, index) => (
                      <div
                        key={option.value}
                        id={`${id}-${index}`}
                        role="option"
                        aria-selected={option.value === value}
                        aria-disabled={option.disabled || undefined}
                        className="select-option"
                        data-option-index={index}
                        data-highlighted={index === currentIndex}
                        onPointerMove={(event) => {
                          if (event.pointerType !== 'touch' && !option.disabled)
                            setHighlighted(option.value);
                        }}
                        onPointerDown={(event) => {
                          if (event.pointerType === 'mouse') event.preventDefault();
                        }}
                        onClick={() => choose(index)}
                      >
                        <span>{option.label}</span>
                        {option.value === value ? <Check size={14} aria-hidden="true" /> : null}
                      </div>
                    ))}
                  </ReferenceMenu>
                ) : null}
              </AnimatePresence>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
