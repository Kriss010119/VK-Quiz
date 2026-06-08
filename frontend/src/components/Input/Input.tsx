import React from 'react';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = ({ label, error, id, ...props } : InputProps) => {
  const inputId = id || label.toLowerCase().replace(/\s/g, '-');

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      {error && <span className={styles.error}>{error}</span>}
      <input
        id={inputId}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        {...props}
      />
    </div>
  );
};