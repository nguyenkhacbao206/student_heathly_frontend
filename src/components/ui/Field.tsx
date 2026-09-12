import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { useId } from 'react'

interface FieldShellProps {
  label: string
  required?: boolean
  error?: string
  hint?: string
  htmlFor?: string
  children: ReactNode
}

function FieldShell({ label, required, error, hint, htmlFor, children }: FieldShellProps) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={htmlFor}>
        {label}
        {required && <span className="field__required"> *</span>}
      </label>
      {children}
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && <span className="field__error">{error}</span>}
    </div>
  )
}

function controlClass(error?: string): string {
  return error ? 'field__control field__control--invalid' : 'field__control'
}

// ------------------------------------------------------------------- input
interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  error?: string
  hint?: string
}

export function TextField({ label, error, hint, required, ...rest }: TextFieldProps) {
  const id = useId()
  return (
    <FieldShell label={label} required={required} error={error} hint={hint} htmlFor={id}>
      <input
        id={id}
        className={controlClass(error)}
        required={required}
        aria-invalid={Boolean(error)}
        {...rest}
      />
    </FieldShell>
  )
}

// ------------------------------------------------------------------ select
interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string
  error?: string
  hint?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export function SelectField({
  label,
  error,
  hint,
  options,
  placeholder,
  required,
  ...rest
}: SelectFieldProps) {
  const id = useId()
  return (
    <FieldShell label={label} required={required} error={error} hint={hint} htmlFor={id}>
      <select
        id={id}
        className={controlClass(error)}
        required={required}
        aria-invalid={Boolean(error)}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

// ---------------------------------------------------------------- textarea
interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string
  error?: string
  hint?: string
}

export function TextAreaField({ label, error, hint, required, ...rest }: TextAreaFieldProps) {
  const id = useId()
  return (
    <FieldShell label={label} required={required} error={error} hint={hint} htmlFor={id}>
      <textarea
        id={id}
        className={controlClass(error)}
        required={required}
        aria-invalid={Boolean(error)}
        rows={3}
        {...rest}
      />
    </FieldShell>
  )
}

export { FieldShell as Field }
