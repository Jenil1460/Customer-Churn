import React from 'react';

const FormSegmentedControl = ({ label, sublabel, options, value, onChange }) => {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="segmented-control">
        {options.map((option) => {
          const optValue = typeof option === 'object' ? option.value : option;
          const optLabel = typeof option === 'object' ? option.label : option;
          const isActive = value === optValue;

          return (
            <div
              key={String(optValue)}
              className={`segmented-option ${isActive ? 'active' : ''}`}
              onClick={() => onChange(optValue)}
            >
              {optLabel}
            </div>
          );
        })}
      </div>
      {sublabel && <div className="form-sublabel">{sublabel}</div>}
    </div>
  );
};

export default FormSegmentedControl;
