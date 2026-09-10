import React from 'react';

interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

export const Field: React.FC<FieldProps> = ({
  orientation = 'vertical',
  className = '',
  children,
  ...props
}) => {
  const orientationClasses =
    orientation === 'horizontal'
      ? 'flex items-center justify-between gap-4'
      : 'flex flex-col gap-1.5';

  return (
    <div className={`${orientationClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const FieldContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1 flex-1 min-w-0 ${className}`} {...props}>
      {children}
    </div>
  );
};

interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const FieldLabel: React.FC<FieldLabelProps> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <label
      className={`text-sm font-semibold text-slate-800 select-none cursor-pointer transition-colors duration-200 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};

export const FieldDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <p className={`text-xs text-slate-500 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
};
