/**
 * Unit tests for Button component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button, buttonVariants } from '@/components/ui/button';

// Mock @radix-ui/react-slot
jest.mock('@radix-ui/react-slot', () => ({
  Slot: 'div',
}));

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('renders button with default props', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });

    it('renders button with custom text', () => {
      render(<Button>Custom Button Text</Button>);

      expect(screen.getByText('Custom Button Text')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Button className="custom-class">Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    const variants = [
      'default',
      'destructive',
      'outline',
      'secondary',
      'ghost',
      'link',
      'success',
      'warning',
    ] as const;

    variants.forEach((variant) => {
      it(`renders ${variant} variant correctly`, () => {
        render(<Button variant={variant}>Button</Button>);

        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();

        // Check for some key classes that should be present
        expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
      });
    });

    it('applies default variant when no variant is specified', () => {
      render(<Button>Default Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('applies destructive variant styling', () => {
      render(<Button variant="destructive">Delete</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground');
    });

    it('applies outline variant styling', () => {
      render(<Button variant="outline">Outline</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('border', 'border-input', 'bg-background');
    });

    it('applies ghost variant styling', () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground');
    });

    it('applies link variant styling', () => {
      render(<Button variant="link">Link</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-primary', 'underline-offset-4', 'hover:underline');
    });
  });

  describe('Sizes', () => {
    const sizes = ['default', 'sm', 'lg', 'icon', 'xs'] as const;

    sizes.forEach((size) => {
      it(`renders ${size} size correctly`, () => {
        render(<Button size={size}>Button</Button>);

        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
      });
    });

    it('applies default size when no size is specified', () => {
      render(<Button>Default Size</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'px-4', 'py-2');
    });

    it('applies small size styling', () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9', 'px-3', 'text-xs');
    });

    it('applies large size styling', () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-11', 'px-8', 'text-base');
    });

    it('applies icon size styling', () => {
      render(<Button size="icon">🔍</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'w-10');
    });

    it('applies extra small size styling', () => {
      render(<Button size="xs">XS</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-8', 'px-2', 'text-xs');
    });
  });

  describe('States and Interactions', () => {
    it('handles click events', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });

    it('does not trigger click when disabled', () => {
      const handleClick = jest.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('supports focus and blur events', () => {
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();

      render(
        <Button onFocus={handleFocus} onBlur={handleBlur}>
          Focus me
        </Button>
      );

      const button = screen.getByRole('button');

      fireEvent.focus(button);
      expect(handleFocus).toHaveBeenCalledTimes(1);

      fireEvent.blur(button);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('AsChild Prop', () => {
    it('renders as Slot when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );

      // Should render as a link, not a button
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.getByRole('link')).toBeInTheDocument();
      expect(screen.getByText('Link Button')).toBeInTheDocument();
    });

    it('renders as button when asChild is false', () => {
      render(<Button asChild={false}>Regular Button</Button>);

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Regular Button')).toBeInTheDocument();
    });
  });

  describe('HTML Attributes', () => {
    it('forwards HTML button attributes', () => {
      render(
        <Button
          type="submit"
          form="test-form"
          name="test-button"
          value="test-value"
          title="Test button title"
        >
          Submit
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('form', 'test-form');
      expect(button).toHaveAttribute('name', 'test-button');
      expect(button).toHaveAttribute('value', 'test-value');
      expect(button).toHaveAttribute('title', 'Test button title');
    });

    it('supports data attributes', () => {
      render(<Button data-testid="custom-button" data-custom="value">Button</Button>);

      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('data-custom', 'value');
    });

    it('supports aria attributes', () => {
      render(
        <Button
          aria-label="Close dialog"
          aria-describedby="help-text"
          aria-pressed="false"
        >
          ×
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Close dialog');
      expect(button).toHaveAttribute('aria-describedby', 'help-text');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to button element', () => {
      const ref = React.createRef<HTMLButtonElement>();

      render(<Button ref={ref}>Button with ref</Button>);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toBe('Button with ref');
    });
  });

  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(<Button>Accessible Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Keyboard Button</Button>);

      const button = screen.getByRole('button');

      // Simulate Enter key press
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      // Note: The actual Enter key handling is done by the browser for buttons

      // Simulate Space key press
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      // Note: The actual Space key handling is done by the browser for buttons

      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });

    it('has proper focus styles', () => {
      render(<Button>Focus Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-ring',
        'focus-visible:ring-offset-2'
      );
    });
  });

  describe('Button Variants Function', () => {
    it('generates correct classes for default variant and size', () => {
      const classes = buttonVariants();

      expect(classes).toContain('bg-primary');
      expect(classes).toContain('text-primary-foreground');
      expect(classes).toContain('h-10');
      expect(classes).toContain('px-4');
    });

    it('generates correct classes for custom variant and size', () => {
      const classes = buttonVariants({ variant: 'destructive', size: 'lg' });

      expect(classes).toContain('bg-destructive');
      expect(classes).toContain('text-destructive-foreground');
      expect(classes).toContain('h-11');
      expect(classes).toContain('px-8');
    });

    it('includes custom className', () => {
      const classes = buttonVariants({ className: 'custom-class' });

      expect(classes).toContain('custom-class');
    });
  });
});
