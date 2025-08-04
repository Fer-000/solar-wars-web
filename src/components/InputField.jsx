import React from "react";

const InputField = ({ param, value, onChange }) => {
  const handleChange = (e) => {
    const newValue =
      param.type === "number"
        ? param.num_type?.includes("int")
          ? parseInt(e.target.value) || 0
          : parseFloat(e.target.value) || 0
        : param.type === "bool"
        ? e.target.checked
        : e.target.value;

    onChange(param.id, newValue);
  };

  const getInputElement = () => {
    switch (param.type) {
      case "number":
        return (
          <input
            type="number"
            id={param.id}
            value={value || param.default || 0}
            onChange={handleChange}
            min={param.range?.min}
            max={param.range?.max}
            step={param.step || (param.num_type?.includes("int") ? 1 : 0.1)}
            className="rate-input"
          />
        );

      case "select":
        return (
          <select
            id={param.id}
            value={value || param.default || ""}
            onChange={handleChange}
            className="rate-select"
          >
            {Object.entries(param.options).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        );

      case "bool":
        return (
          <input
            type="checkbox"
            id={param.id}
            checked={value || param.default || false}
            onChange={handleChange}
            className="rate-checkbox"
          />
        );

      case "text":
        return (
          <input
            type="text"
            id={param.id}
            value={value || param.default || ""}
            onChange={handleChange}
            className="rate-input"
            placeholder={param.label}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="input-field">
      <label htmlFor={param.id} className="input-label">
        {param.label}
      </label>
      {getInputElement()}
    </div>
  );
};

export default InputField;
