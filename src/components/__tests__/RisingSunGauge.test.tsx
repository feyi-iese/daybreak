import { render, screen } from '@testing-library/react';
import RisingSunGauge from '../RisingSunGauge';

describe('RisingSunGauge', () => {
  it('renders progress bar role and correct accessibility attributes', () => {
    render(<RisingSunGauge pct={45} lost="3.5 kg" remaining="4.2 kg" />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '45');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveAttribute('aria-label', '45% of weight goal achieved');
  });

  it('clamps pct values between 0 and 100 in rendering', () => {
    const { rerender } = render(<RisingSunGauge pct={-20} lost="0 kg" remaining="10 kg" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('0%')).toBeInTheDocument();

    rerender(<RisingSunGauge pct={150} lost="10 kg" remaining="0 kg" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('calculates the correct coordinates for the sun disc at 0%, 50%, and 100%', () => {
    const { container, rerender } = render(<RisingSunGauge pct={0} lost="0 kg" remaining="10 kg" />);
    
    // At 0%, angle is PI (180 deg).
    // sunX = 100 + 85 * cos(PI) = 100 - 85 = 15
    // sunY = 105 - 85 * sin(PI) = 105
    let circles = container.querySelectorAll('circle');
    expect(circles).toHaveLength(2);
    expect(circles[0]).toHaveAttribute('cx', '15');
    expect(circles[0]).toHaveAttribute('cy', '105');
    expect(circles[1]).toHaveAttribute('cx', '15');
    expect(circles[1]).toHaveAttribute('cy', '105');

    // At 50%, angle is PI/2 (90 deg).
    // sunX = 100 + 85 * cos(PI/2) = 100
    // sunY = 105 - 85 * sin(PI/2) = 105 - 85 = 20
    rerender(<RisingSunGauge pct={50} lost="5 kg" remaining="5 kg" />);
    circles = container.querySelectorAll('circle');
    expect(circles[0]).toHaveAttribute('cx', '100');
    expect(circles[0]).toHaveAttribute('cy', '20');
    expect(circles[1]).toHaveAttribute('cx', '100');
    expect(circles[1]).toHaveAttribute('cy', '20');

    // At 100%, angle is 0 (0 deg).
    // sunX = 100 + 85 * cos(0) = 100 + 85 = 185
    // sunY = 105 - 85 * sin(0) = 105
    rerender(<RisingSunGauge pct={100} lost="10 kg" remaining="0 kg" />);
    circles = container.querySelectorAll('circle');
    expect(circles[0]).toHaveAttribute('cx', '185');
    expect(circles[0]).toHaveAttribute('cy', '105');
    expect(circles[1]).toHaveAttribute('cx', '185');
    expect(circles[1]).toHaveAttribute('cy', '105');
  });

  it('renders lost and remaining text inside pills', () => {
    const { container } = render(<RisingSunGauge pct={75} lost="6.0 kg" remaining="2.0 kg" />);

    const chips = container.querySelectorAll('.chip');
    expect(chips).toHaveLength(2);
    expect(chips[0]).toHaveTextContent('↓ 6.0 kg lost');
    expect(chips[1]).toHaveTextContent('2.0 kg to go');
  });

  it('renders screen reader only text description', () => {
    render(<RisingSunGauge pct={80} lost="8 kg" remaining="2 kg" />);
    
    const srOnlyText = screen.getByText('80% of weight goal achieved. 8 kg lost, 2 kg to go.');
    expect(srOnlyText).toBeInTheDocument();
    expect(srOnlyText).toHaveClass('sr-only');
  });
});
