export default function Field({ label, name, error, hint, as: Tag = 'input', children, ...props }) {
  return (
    <div className="field">
      <label htmlFor={name}>
        {label}
        {props.required ? <span className="required"> *</span> : null}
      </label>
      <Tag
        id={name}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        {...props}
      >
        {children}
      </Tag>
      {error ? (
        <p className="field-error" id={`${name}-error`}>
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint" id={`${name}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
