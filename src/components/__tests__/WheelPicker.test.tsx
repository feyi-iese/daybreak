import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WheelPicker from '../onboarding/WheelPicker';

// Ensure JSDOM environments don't crash on Pointer Capture APIs
beforeEach(() => {
  if (typeof window.HTMLElement.prototype.setPointerCapture !== 'function') {
    window.HTMLElement.prototype.setPointerCapture = vi.fn();
  }
  if (typeof window.HTMLElement.prototype.releasePointerCapture !== 'function') {
    window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  }
});

function createPointerEvent(type: string, props: { clientY: number; pointerId: number }) {
  // Use window.MouseEvent since window.PointerEvent constructor is not available in JSDOM
  const event = new window.MouseEvent(type, {
    bubbles: true,
    cancelable: true,
  } as unknown as MouseEventInit);
  Object.defineProperty(event, 'clientY', { value: props.clientY });
  Object.defineProperty(event, 'pointerId', { value: props.pointerId });
  return event;
}

describe('WheelPicker component', () => {
  const defaultProps = {
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    onChange: vi.fn(),
    formatValue: (v: number) => `${v}`,
    ariaLabel: 'Test Picker',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders current and neighbor values correctly', () => {
    render(<WheelPicker {...defaultProps} />);

    // Current value
    expect(screen.getByText('50')).toBeInTheDocument();
    // Neighbor values (value + offset * step) -> 48, 49, 51, 52
    expect(screen.getByText('48')).toBeInTheDocument();
    expect(screen.getByText('49')).toBeInTheDocument();
    expect(screen.getByText('51')).toBeInTheDocument();
    expect(screen.getByText('52')).toBeInTheDocument();
  });

  it('allows clicking a neighbor value to trigger onChange', () => {
    const onChange = vi.fn();
    render(<WheelPicker {...defaultProps} onChange={onChange} />);

    const button51 = screen.getByText('51');
    fireEvent.click(button51);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(51);
  });

  it('allows keyboard events to trigger onChange', () => {
    const onChange = vi.fn();
    render(<WheelPicker {...defaultProps} onChange={onChange} />);

    const container = screen.getByRole('spinbutton');
    container.focus();

    // ArrowUp -> adjust(1) -> value + 1 = 51
    fireEvent.keyDown(container, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenLastCalledWith(51);

    // ArrowDown -> adjust(-1) -> value - 1 = 49
    fireEvent.keyDown(container, { key: 'ArrowDown' });
    expect(onChange).toHaveBeenLastCalledWith(49);
  });

  it('allows pointer drag to trigger onChange', () => {
    const onChange = vi.fn();
    render(<WheelPicker {...defaultProps} onChange={onChange} />);

    const container = screen.getByRole('spinbutton');

    // Drag up by 35px -> should increase by 1 step
    fireEvent(container, createPointerEvent('pointerdown', { clientY: 200, pointerId: 1 }));
    fireEvent(container, createPointerEvent('pointermove', { clientY: 165, pointerId: 1 }));
    expect(onChange).toHaveBeenLastCalledWith(51);

    // Drag down by 35px from start -> should decrease by 1 step
    fireEvent(container, createPointerEvent('pointermove', { clientY: 235, pointerId: 1 }));
    expect(onChange).toHaveBeenLastCalledWith(49);

    // End drag
    fireEvent(container, createPointerEvent('pointerup', { clientY: 235, pointerId: 1 }));
    onChange.mockClear();

    // Moving pointer after pointerUp should do nothing
    fireEvent(container, createPointerEvent('pointermove', { clientY: 100, pointerId: 1 }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('prevents click selection on neighbors if drag occurred', () => {
    const onChange = vi.fn();
    render(<WheelPicker {...defaultProps} onChange={onChange} />);

    const container = screen.getByRole('spinbutton');
    const button51 = screen.getByText('51');

    // Simulate drag start and move
    fireEvent(container, createPointerEvent('pointerdown', { clientY: 200, pointerId: 1 }));
    fireEvent(container, createPointerEvent('pointermove', { clientY: 195, pointerId: 1 })); // small movement
    fireEvent(container, createPointerEvent('pointerup', { clientY: 195, pointerId: 1 }));

    // The click event is simulated after pointerUp
    fireEvent.click(button51);

    // Because a drag was detected (wasDraggingRef.current = true), the click should be ignored
    expect(onChange).not.toHaveBeenCalled();
  });

  it('handles mouse wheel to trigger onChange', () => {
    const onChange = vi.fn();
    render(<WheelPicker {...defaultProps} onChange={onChange} />);

    const container = screen.getByRole('spinbutton');

    // Scroll up (deltaY < 0) -> adjust(step) -> 51
    fireEvent.wheel(container, { deltaY: -100 });
    expect(onChange).toHaveBeenLastCalledWith(51);

    // Scroll down (deltaY > 0) -> adjust(-step) -> 49
    fireEvent.wheel(container, { deltaY: 100 });
    expect(onChange).toHaveBeenLastCalledWith(49);
  });
});
