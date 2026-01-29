import React from "react";

const InputField = ({ param, value, onChange }) => {
  const handleChange = (e) => {
    let newValue;
    if (param.type === "number") {
      // Allow empty string so user can clear the field
      if (e.target.value === "") {
        newValue = "";
      } else if (param.num_type?.includes("int")) {
        newValue = parseInt(e.target.value, 10);
        if (isNaN(newValue)) newValue = "";
      } else {
        newValue = parseFloat(e.target.value);
        if (isNaN(newValue)) newValue = "";
      }
    } else if (param.type === "bool") {
      newValue = e.target.checked;
    } else {
      // For text/select, allow empty string
      newValue = e.target.value === "" ? "" : e.target.value;
    }
    onChange(param.id, newValue);
  };

  const getInputElement = () => {
    switch (param.type) {
      case "number":
        return (
          <input
            type="number"
            id={param.id}
            value={value === undefined ? param.default ?? "" : value}
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
            value={value === undefined ? param.default ?? "" : value}
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
