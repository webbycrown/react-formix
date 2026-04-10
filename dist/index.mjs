// src/components/Form.jsx
import React3, { useState as useState3 } from "react";

// src/hooks/useForm.js
import { useState } from "react";

// src/core/validate.js
var validateField = (value, rules = {}) => {
  if (!rules) return "";
  if (rules.required) {
    const isEmpty = value === "" || value === null || value === void 0 || Array.isArray(value) && value.length === 0;
    if (isEmpty) {
      return rules.requiredMessage || "This field is Required";
    }
  }
  if (rules.minLength && (!value || value.length < rules.minLength)) {
    return `Minimum ${rules.minLength} characters required`;
  }
  if (rules.maxLength && (value == null ? void 0 : value.length) > rules.maxLength) {
    return `Maximum ${rules.maxLength} characters allowed`;
  }
  if (rules.email && value && !/\S+@\S+\.\S+/.test(value)) {
    return "Invalid email";
  }
  if (rules.pattern && value && !rules.pattern.test(value)) {
    return rules.patternMessage || "Invalid format";
  }
  if (rules.validate) {
    const result = rules.validate(value);
    if (result !== true) return result || "Invalid value";
  }
  return "";
};

// src/hooks/useForm.js
var useForm = (fields) => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const handleChange = (name, value) => {
    var _a;
    setValues((prev) => ({ ...prev, [name]: value }));
    const error = validateField(value, (_a = fields[name]) == null ? void 0 : _a.rules);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };
  const validateAll = () => {
    let newErrors = {};
    Object.keys(fields).forEach((key) => {
      var _a;
      const error = validateField(values[key], (_a = fields[key]) == null ? void 0 : _a.rules);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  return { values, errors, handleChange, validateAll };
};

// src/core/renderField.jsx
import React2 from "react";

// src/components/CustomeMultiSelect.jsx
import React, { useState as useState2, useEffect, useRef } from "react";
var CustomMultiSelect = ({ value = [], onChange, options, placeholder }) => {
  const [open, setOpen] = useState2(false);
  const ref = useRef();
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  const toggleOption = (val) => {
    let updated;
    if (value.includes(val)) {
      updated = value.filter((v) => v !== val);
    } else {
      updated = [...value, val];
    }
    onChange({ target: { value: updated } });
  };
  const removeItem = (val) => {
    const updated = value.filter((v) => v !== val);
    onChange({ target: { value: updated } });
  };
  const getLabel = (val) => {
    var _a;
    return (_a = options == null ? void 0 : options.find((o) => o.value === val)) == null ? void 0 : _a.label;
  };
  return /* @__PURE__ */ React.createElement("div", { className: "custom-select", ref }, /* @__PURE__ */ React.createElement("div", { className: "select-box", onClick: () => setOpen(!open) }, value.length === 0 && /* @__PURE__ */ React.createElement("span", { className: "placeholder" }, placeholder || "Select"), /* @__PURE__ */ React.createElement("div", { className: "tags" }, value.map((val) => /* @__PURE__ */ React.createElement("span", { key: val, className: "tag" }, getLabel(val), /* @__PURE__ */ React.createElement(
    "span",
    {
      className: "remove",
      onClick: (e) => {
        e.stopPropagation();
        removeItem(val);
      }
    },
    "\xD7"
  )))), /* @__PURE__ */ React.createElement("span", { className: "arrow" }, "\u25BE")), open && /* @__PURE__ */ React.createElement("div", { className: "dropdown" }, options == null ? void 0 : options.map((opt, i) => {
    const isSelected = value.includes(opt.value);
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: i,
        className: `option ${isSelected ? "active" : ""}`,
        onClick: () => toggleOption(opt.value)
      },
      /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: isSelected, readOnly: true }),
      opt.label
    );
  })));
};
var CustomeMultiSelect_default = CustomMultiSelect;

// src/core/renderField.jsx
var fieldMap = {
  text: (props) => /* @__PURE__ */ React2.createElement("input", { type: "text", ...props }),
  email: (props) => /* @__PURE__ */ React2.createElement("input", { type: "email", ...props }),
  password: (props) => /* @__PURE__ */ React2.createElement("input", { type: "password", ...props }),
  textarea: (props) => /* @__PURE__ */ React2.createElement("textarea", { ...props }),
  // ✅ NEW: DATE FIELD
  date: (props) => /* @__PURE__ */ React2.createElement("input", { type: "date", ...props }),
  // ✅ NEW: TIME FIELD
  time: (props) => /* @__PURE__ */ React2.createElement("input", { type: "time", ...props }),
  // ✅ SELECT
  // select: (props, config) => (
  //   <select {...props}>
  //     <option value="">Select</option>
  //     {config.options?.map((opt, i) => (
  //       <option key={i} value={opt.value}>
  //         {opt.label}
  //       </option>
  //     ))}
  //   </select>
  // ),
  select: (props, config) => {
    var _a;
    if (config.multiSelect) {
      return /* @__PURE__ */ React2.createElement(
        CustomeMultiSelect_default,
        {
          value: props.value || [],
          onChange: props.onChange,
          options: config.options,
          placeholder: config.placeholder
        }
      );
    }
    return /* @__PURE__ */ React2.createElement("select", { ...props }, /* @__PURE__ */ React2.createElement("option", { value: "" }, "Select"), (_a = config.options) == null ? void 0 : _a.map((opt, i) => /* @__PURE__ */ React2.createElement("option", { key: i, value: opt.value }, opt.label)));
  },
  // ✅ CHECKBOX (FIXED UI)
  checkbox: (props, config) => {
    var _a;
    return /* @__PURE__ */ React2.createElement("div", { className: "checkbox-group" }, (_a = config.options) == null ? void 0 : _a.map((opt, i) => {
      var _a2;
      const checked = (_a2 = props.value) == null ? void 0 : _a2.includes(opt.value);
      return /* @__PURE__ */ React2.createElement(
        "label",
        {
          key: i,
          className: `selection-item ${checked ? "active" : ""}`
        },
        /* @__PURE__ */ React2.createElement(
          "input",
          {
            type: "checkbox",
            checked,
            onChange: (e) => {
              let newValue = props.value || [];
              if (e.target.checked) {
                newValue = [...newValue, opt.value];
              } else {
                newValue = newValue.filter((v) => v !== opt.value);
              }
              props.onChange({ target: { value: newValue } });
            }
          }
        ),
        /* @__PURE__ */ React2.createElement("span", { className: "custom-box" }),
        opt.image ? /* @__PURE__ */ React2.createElement(
          "img",
          {
            src: opt.image,
            alt: opt.label || "option",
            className: "checkbox-image"
          }
        ) : opt.icon ? /* @__PURE__ */ React2.createElement("span", { className: "checkbox-image" }, opt.icon) : /* @__PURE__ */ React2.createElement("span", { className: "label-text" }, opt.label)
      );
    }));
  },
  // ✅ RADIO (FIXED UI)
  radio: (props, config) => {
    var _a;
    return /* @__PURE__ */ React2.createElement("div", { className: "radio-group" }, (_a = config.options) == null ? void 0 : _a.map((opt, i) => {
      const checked = props.value === opt.value;
      return /* @__PURE__ */ React2.createElement(
        "label",
        {
          key: i,
          className: `selection-item ${checked ? "active" : ""}`
        },
        /* @__PURE__ */ React2.createElement(
          "input",
          {
            type: "radio",
            name: props.name,
            value: opt.value,
            checked,
            onChange: (e) => props.onChange({ target: { value: e.target.value } })
          }
        ),
        /* @__PURE__ */ React2.createElement("span", { className: "custom-radio" }),
        opt.image ? /* @__PURE__ */ React2.createElement(
          "img",
          {
            src: opt.image,
            alt: opt.label || "option",
            className: "radio-image"
          }
        ) : opt.icon ? /* @__PURE__ */ React2.createElement("span", { className: "radio-image" }, opt.icon) : /* @__PURE__ */ React2.createElement("span", { className: "label-text" }, opt.label)
      );
    }));
  },
  // ✅ FILE
  file: (props, config) => /* @__PURE__ */ React2.createElement(
    "input",
    {
      type: "file",
      accept: config.accept || "*",
      className: props.className,
      onChange: (e) => props.onChange({ target: { value: e.target.files[0] } })
    }
  ),
  // ✅ DROPZONE
  dropzone: (props, config) => {
    var _a;
    return /* @__PURE__ */ React2.createElement(
      "div",
      {
        className: "dropzone",
        onDragOver: (e) => e.preventDefault(),
        onDrop: (e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          props.onChange({ target: { value: file } });
        }
      },
      /* @__PURE__ */ React2.createElement("p", null, ((_a = props.value) == null ? void 0 : _a.name) ? `\u{1F4C4} ${props.value.name}` : "Drag & Drop file here or click to upload"),
      /* @__PURE__ */ React2.createElement(
        "input",
        {
          type: "file",
          accept: config.accept || "*",
          onChange: (e) => props.onChange({ target: { value: e.target.files[0] } }),
          className: "dropzone-input"
        }
      )
    );
  }
};
var renderField = (name, config, value, onChange, error, errorType = "afterField") => {
  const FieldComponent = fieldMap[config.type];
  if (!FieldComponent) return null;
  const commonProps = {
    name,
    value: value ?? (config.type === "checkbox" || config.type === "select" && config.multiSelect ? [] : ""),
    placeholder: config.placeholder || "",
    className: error ? "input error" : "input",
    onChange: (e) => onChange(name, e.target.value)
  };
  const ErrorUI = error && (typeof error === "string" ? /* @__PURE__ */ React2.createElement("p", { className: "error-text" }, config.errorIcon && /* @__PURE__ */ React2.createElement("span", { className: "error-icon" }, config.errorIcon), config.errorImage && /* @__PURE__ */ React2.createElement("img", { src: config.errorImage, alt: "error", className: "error-image" }), /* @__PURE__ */ React2.createElement("span", null, error)) : /* @__PURE__ */ React2.createElement("div", { className: "error-text" }, config.errorIcon && /* @__PURE__ */ React2.createElement("span", { className: "error-icon" }, config.errorIcon), config.errorImage && /* @__PURE__ */ React2.createElement("img", { src: config.errorImage, alt: "error", className: "error-image" }), error, " "));
  return /* @__PURE__ */ React2.createElement("div", { className: "form-group", key: name }, config.label && /* @__PURE__ */ React2.createElement("label", { className: "label" }, config.label), FieldComponent(commonProps, config), error && errorType === "afterField" && ErrorUI);
};

// src/components/Form.jsx
var Form = ({
  schema,
  onSubmit,
  apiError,
  loading,
  errorType,
  type,
  gridType = 2
}) => {
  const { fields } = schema;
  const { values, errors, handleChange, validateAll } = useForm(fields);
  const [submittedData, setSubmittedData] = useState3(null);
  const [showPopup, setShowPopup] = useState3(true);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      setShowPopup(true);
      return;
    }
    const res = await onSubmit(values);
    if (!apiError && res !== false) {
      setSubmittedData(values);
    }
  };
  if (loading) {
    return /* @__PURE__ */ React3.createElement("div", { className: "form-wrapper" }, /* @__PURE__ */ React3.createElement("div", { className: "form-container loader-box" }, /* @__PURE__ */ React3.createElement("div", { className: "loader-spinner" }), /* @__PURE__ */ React3.createElement("p", { className: "loader-text" }, "Processing...")));
  }
  if (apiError) {
    return /* @__PURE__ */ React3.createElement("div", { className: "form-wrapper" }, /* @__PURE__ */ React3.createElement("div", { className: "form-container error-box" }, /* @__PURE__ */ React3.createElement("h2", { className: "error-title" }, "\u274C Error"), /* @__PURE__ */ React3.createElement("p", { className: "error-message" }, apiError)));
  }
  if (submittedData && !apiError) {
    return /* @__PURE__ */ React3.createElement("div", { className: "form-wrapper" }, /* @__PURE__ */ React3.createElement("div", { className: "form-container success-box" }, /* @__PURE__ */ React3.createElement("h2", { className: "success-title" }, "\u2705 Submitted Data"), /* @__PURE__ */ React3.createElement("div", { className: "summary-list" }, Object.keys(submittedData).map((key) => {
      const value = submittedData[key];
      return /* @__PURE__ */ React3.createElement("div", { key, className: "summary-item" }, /* @__PURE__ */ React3.createElement("span", { className: "summary-label" }, key), /* @__PURE__ */ React3.createElement("span", { className: "summary-value" }, (() => {
        if (value instanceof File) return value.name;
        if (Array.isArray(value)) return value.join(", ");
        if (typeof value === "object" && value !== null)
          return "-";
        return (value == null ? void 0 : value.toString()) || "-";
      })()));
    }))));
  }
  if (type === "layoutTwo") {
    const hasErrors = Object.values(errors).some((msg) => msg);
    return /* @__PURE__ */ React3.createElement("div", { className: "fv2-wrapper" }, /* @__PURE__ */ React3.createElement("div", { className: "fv2-container" }, errorType === "popup" && showPopup && hasErrors && /* @__PURE__ */ React3.createElement("div", { className: "fv-popup-overlay" }, /* @__PURE__ */ React3.createElement("div", { className: "fv-popup" }, /* @__PURE__ */ React3.createElement("div", { className: "fv-popup-header" }, /* @__PURE__ */ React3.createElement("h3", null, "\u26A0\uFE0F Please fix the following errors"), /* @__PURE__ */ React3.createElement(
      "button",
      {
        className: "fv-popup-close",
        onClick: () => setShowPopup(false)
      },
      "\u2715"
    )), /* @__PURE__ */ React3.createElement("ul", { className: "fv-popup-list" }, Object.entries(errors).map(([field, message]) => {
      var _a;
      if (!message) return null;
      return /* @__PURE__ */ React3.createElement("li", { key: field }, /* @__PURE__ */ React3.createElement("strong", null, ((_a = fields[field]) == null ? void 0 : _a.label) || field, ":"), " ", message);
    })))), /* @__PURE__ */ React3.createElement("form", { onSubmit: handleSubmit, className: "fv2-form" }, Object.keys(errors).length > 0 && errorType === "beforField" && /* @__PURE__ */ React3.createElement("div", { className: "fv-error-summary" }, /* @__PURE__ */ React3.createElement("ul", null, Object.entries(errors).map(([field, message]) => {
      var _a;
      if (!message) return null;
      return /* @__PURE__ */ React3.createElement("li", { key: field }, /* @__PURE__ */ React3.createElement("strong", null, ((_a = fields[field]) == null ? void 0 : _a.label) || field, ":"), " ", message);
    }))), /* @__PURE__ */ React3.createElement(
      "div",
      {
        className: "fv2-grid",
        style: {
          gridTemplateColumns: `repeat(${gridType}, 1fr)`
        }
      },
      Object.keys(fields).map((name) => /* @__PURE__ */ React3.createElement("div", { className: "fv2-field", key: name }, renderField(
        name,
        fields[name],
        values[name],
        handleChange,
        errors[name],
        errorType
      )))
    ), /* @__PURE__ */ React3.createElement("div", { className: "fv2-footer" }, /* @__PURE__ */ React3.createElement("button", { type: "submit", className: "fv2-btn" }, "Submit Details")))));
  } else if (type === "layoutThree") {
    const hasErrors = Object.values(errors).some((msg) => msg);
    return /* @__PURE__ */ React3.createElement("div", { className: "fv4-wrapper" }, /* @__PURE__ */ React3.createElement("div", { className: "fv4-container" }, errorType === "popup" && showPopup && hasErrors && /* @__PURE__ */ React3.createElement("div", { className: "fv-popup-overlay" }, /* @__PURE__ */ React3.createElement("div", { className: "fv-popup" }, /* @__PURE__ */ React3.createElement("div", { className: "fv-popup-header" }, /* @__PURE__ */ React3.createElement("h3", null, "\u26A0\uFE0F Please fix the following errors"), /* @__PURE__ */ React3.createElement(
      "button",
      {
        className: "fv-popup-close",
        onClick: () => setShowPopup(false)
      },
      "\u2715"
    )), /* @__PURE__ */ React3.createElement("ul", { className: "fv-popup-list" }, Object.entries(errors).map(([field, message]) => {
      var _a;
      if (!message) return null;
      return /* @__PURE__ */ React3.createElement("li", { key: field }, /* @__PURE__ */ React3.createElement("strong", null, ((_a = fields[field]) == null ? void 0 : _a.label) || field, ":"), " ", message);
    })))), /* @__PURE__ */ React3.createElement("form", { onSubmit: handleSubmit, className: "fv4-form" }, Object.keys(errors).length > 0 && errorType === "beforField" && /* @__PURE__ */ React3.createElement("div", { className: "fv-error-summary" }, /* @__PURE__ */ React3.createElement("ul", null, Object.entries(errors).map(([field, message]) => {
      var _a;
      if (!message) return null;
      return /* @__PURE__ */ React3.createElement("li", { key: field }, /* @__PURE__ */ React3.createElement("strong", null, ((_a = fields[field]) == null ? void 0 : _a.label) || field, ":"), " ", message);
    }))), /* @__PURE__ */ React3.createElement("div", { className: "fv4-fields" }, Object.keys(fields).map((name) => /* @__PURE__ */ React3.createElement("div", { className: "fv4-field-box", key: name }, renderField(
      name,
      fields[name],
      values[name],
      handleChange,
      errors[name],
      errorType
    )))), /* @__PURE__ */ React3.createElement("div", { className: "fv4-footer" }, /* @__PURE__ */ React3.createElement("button", { type: "submit", className: "fv4-submit" }, "Submit Form")))));
  } else {
    const hasErrors = Object.values(errors).some((msg) => msg);
    return /* @__PURE__ */ React3.createElement("div", { className: "form-wrapper" }, /* @__PURE__ */ React3.createElement("div", { className: "form-container" }, errorType === "popup" && showPopup && hasErrors && /* @__PURE__ */ React3.createElement("div", { className: "fv-popup-overlay" }, /* @__PURE__ */ React3.createElement("div", { className: "fv-popup" }, /* @__PURE__ */ React3.createElement("div", { className: "fv-popup-header" }, /* @__PURE__ */ React3.createElement("h3", null, "\u26A0\uFE0F Please fix the following errors"), /* @__PURE__ */ React3.createElement(
      "button",
      {
        className: "fv-popup-close",
        onClick: () => setShowPopup(false)
      },
      "\u2715"
    )), /* @__PURE__ */ React3.createElement("ul", { className: "fv-popup-list" }, Object.entries(errors).map(([field, message]) => {
      var _a;
      if (!message) return null;
      return /* @__PURE__ */ React3.createElement("li", { key: field }, /* @__PURE__ */ React3.createElement("strong", null, ((_a = fields[field]) == null ? void 0 : _a.label) || field, ":"), " ", message);
    })))), /* @__PURE__ */ React3.createElement("form", { onSubmit: handleSubmit, className: "form-content" }, Object.keys(errors).length > 0 && errorType === "beforField" && /* @__PURE__ */ React3.createElement("div", { className: "fv-error-summary" }, /* @__PURE__ */ React3.createElement("ul", null, Object.entries(errors).map(([field, message]) => {
      var _a;
      if (!message) return null;
      return /* @__PURE__ */ React3.createElement("li", { key: field }, /* @__PURE__ */ React3.createElement("strong", null, ((_a = fields[field]) == null ? void 0 : _a.label) || field, ":"), " ", message);
    }))), /* @__PURE__ */ React3.createElement("div", { className: "fields-grid" }, Object.keys(fields).map(
      (name) => renderField(
        name,
        fields[name],
        values[name],
        handleChange,
        errors[name],
        errorType
      )
    )), /* @__PURE__ */ React3.createElement("button", { type: "submit", className: "submit-btn" }, "Submit Details"))));
  }
};
var Form_default = Form;

// src/components/StepForm.jsx
import React4, { useState as useState4 } from "react";
var StepForm = ({
  schema,
  onSubmit,
  apiError,
  loading,
  type,
  stepShow,
  errorType
}) => {
  const [step, setStep] = useState4(0);
  const [submittedData, setSubmittedData] = useState4(null);
  const currentFields = schema.steps[step].fields;
  const { values, errors, handleChange, validateAll } = useForm(currentFields);
  const [showPopup, setShowPopup] = useState4(false);
  const next = () => {
    const isValid = validateAll();
    if (!isValid) {
      setShowPopup(true);
      return;
    }
    setStep((prev2) => prev2 + 1);
  };
  const prev = () => setStep((prev2) => prev2 - 1);
  const handleSubmit = async () => {
    const isValid = validateAll();
    if (!isValid) {
      setShowPopup(true);
      return;
    }
    const res = await onSubmit(values);
    if (!apiError && res !== false) {
      setSubmittedData(values);
    }
  };
  if (loading) {
    return /* @__PURE__ */ React4.createElement("div", { className: "stepper-wrapper" }, /* @__PURE__ */ React4.createElement("div", { className: "stepper-container loader-box" }, /* @__PURE__ */ React4.createElement("div", { className: "loader-spinner" }), /* @__PURE__ */ React4.createElement("p", { className: "loader-text" }, "Processing...")));
  }
  if (apiError) {
    return /* @__PURE__ */ React4.createElement("div", { className: "stepper-wrapper" }, /* @__PURE__ */ React4.createElement("div", { className: "stepper-container error-box" }, /* @__PURE__ */ React4.createElement("h2", { className: "error-title" }, "\u274C Error"), /* @__PURE__ */ React4.createElement("p", { className: "error-message" }, apiError)));
  }
  if (submittedData && !apiError) {
    return /* @__PURE__ */ React4.createElement("div", { className: "stepper-wrapper" }, /* @__PURE__ */ React4.createElement("div", { className: "stepper-container success-box" }, /* @__PURE__ */ React4.createElement("h2", { className: "success-title" }, "\u2705 Submitted Data"), /* @__PURE__ */ React4.createElement("div", { className: "summary-list" }, Object.keys(submittedData).map((key) => {
      const value = submittedData[key];
      return /* @__PURE__ */ React4.createElement("div", { key, className: "summary-item" }, /* @__PURE__ */ React4.createElement("span", { className: "summary-label" }, key), /* @__PURE__ */ React4.createElement("span", { className: "summary-value" }, (() => {
        if (value instanceof File) return value.name;
        if (Array.isArray(value)) return value.join(", ");
        if (typeof value === "object" && value !== null)
          return "-";
        return (value == null ? void 0 : value.toString()) || "-";
      })()));
    }))));
  }
  if (type === "layoutTwo") {
    const hasErrors = Object.entries(errors).some(
      ([field, msg]) => msg && currentFields[field]
    );
    return /* @__PURE__ */ React4.createElement("div", { className: "fv-wrapper" }, /* @__PURE__ */ React4.createElement("div", { className: "fv-container" }, errorType === "popup" && showPopup && hasErrors && /* @__PURE__ */ React4.createElement("div", { className: "fv-popup-overlay" }, /* @__PURE__ */ React4.createElement("div", { className: "fv-popup" }, /* @__PURE__ */ React4.createElement("div", { className: "fv-popup-header" }, /* @__PURE__ */ React4.createElement("h3", null, "\u26A0\uFE0F Please fix the following errors"), /* @__PURE__ */ React4.createElement(
      "button",
      {
        className: "fv-popup-close",
        onClick: () => setShowPopup(false)
      },
      "\u2715"
    )), /* @__PURE__ */ React4.createElement("ul", { className: "fv-popup-list" }, Object.entries(errors).filter(([field, msg]) => msg && currentFields[field]).map(([field, message]) => {
      var _a;
      return /* @__PURE__ */ React4.createElement("li", { key: field }, /* @__PURE__ */ React4.createElement("strong", null, ((_a = currentFields[field]) == null ? void 0 : _a.label) || field, ":"), " ", message);
    })))), stepShow && /* @__PURE__ */ React4.createElement("div", { className: "fv-header" }, schema.steps.map((_, index) => /* @__PURE__ */ React4.createElement(React4.Fragment, { key: index }, /* @__PURE__ */ React4.createElement("div", { className: "fv-step-item" }, /* @__PURE__ */ React4.createElement(
      "div",
      {
        className: `fv-step-circle ${index === step ? "active" : index < step ? "completed" : ""}`
      },
      index < step ? "\u2713" : index + 1
    ), /* @__PURE__ */ React4.createElement(
      "span",
      {
        className: `fv-step-label ${index === step ? "active" : ""}`
      },
      "Step ",
      index + 1
    )), index !== schema.steps.length - 1 && /* @__PURE__ */ React4.createElement(
      "div",
      {
        className: `fv-step-line ${index < step ? "active" : ""}`
      }
    )))), errorType === "beforField" && Object.entries(errors).some(
      ([field, msg]) => msg && currentFields[field]
    ) && /* @__PURE__ */ React4.createElement("div", { className: "fv-error-summary" }, /* @__PURE__ */ React4.createElement("ul", null, Object.entries(errors).filter(([field, msg]) => msg && currentFields[field]).map(([field, message]) => {
      var _a;
      return /* @__PURE__ */ React4.createElement("li", { key: field }, /* @__PURE__ */ React4.createElement("strong", null, ((_a = currentFields[field]) == null ? void 0 : _a.label) || field, ":"), " ", message);
    }))), /* @__PURE__ */ React4.createElement("div", { className: "fv-body" }, /* @__PURE__ */ React4.createElement("h2", { className: "fv-title" }, schema.steps[step].title), /* @__PURE__ */ React4.createElement("div", { className: "fv-fields" }, Object.keys(currentFields).map(
      (name) => renderField(
        name,
        currentFields[name],
        values[name],
        handleChange,
        errors[name],
        errorType
      )
    ))), /* @__PURE__ */ React4.createElement("div", { className: "fv-footer" }, step > 0 ? /* @__PURE__ */ React4.createElement("button", { className: "fv-btn fv-btn-back", onClick: prev }, "Previous") : /* @__PURE__ */ React4.createElement("div", null), step < schema.steps.length - 1 ? /* @__PURE__ */ React4.createElement("button", { className: "fv-btn fv-btn-next", onClick: next }, "Continue") : /* @__PURE__ */ React4.createElement("button", { className: "fv-btn fv-btn-submit", onClick: handleSubmit }, "Complete Registration"))));
  } else if (type === "layoutThree") {
    const hasErrors = Object.entries(errors).some(
      ([field, msg]) => msg && currentFields[field]
    );
    return /* @__PURE__ */ React4.createElement("div", { className: "step3-wrapper" }, /* @__PURE__ */ React4.createElement("div", { className: "step3-container" }, errorType === "popup" && showPopup && hasErrors && /* @__PURE__ */ React4.createElement("div", { className: "fv-popup-overlay" }, /* @__PURE__ */ React4.createElement("div", { className: "fv-popup" }, /* @__PURE__ */ React4.createElement("div", { className: "fv-popup-header" }, /* @__PURE__ */ React4.createElement("h3", null, "\u26A0\uFE0F Please fix the following errors"), /* @__PURE__ */ React4.createElement(
      "button",
      {
        className: "fv-popup-close",
        onClick: () => setShowPopup(false)
      },
      "\u2715"
    )), /* @__PURE__ */ React4.createElement("ul", { className: "fv-popup-list" }, Object.entries(errors).filter(([field, msg]) => msg && currentFields[field]).map(([field, message]) => {
      var _a;
      return /* @__PURE__ */ React4.createElement("li", { key: field }, /* @__PURE__ */ React4.createElement("strong", null, ((_a = currentFields[field]) == null ? void 0 : _a.label) || field, ":"), " ", message);
    })))), stepShow && /* @__PURE__ */ React4.createElement("div", { className: "step3-progress" }, /* @__PURE__ */ React4.createElement(
      "div",
      {
        className: "step3-progress-bar",
        style: {
          width: `${(step + 1) / schema.steps.length * 100}%`
        }
      }
    )), errorType === "beforField" && Object.entries(errors).some(
      ([field, msg]) => msg && currentFields[field]
    ) && /* @__PURE__ */ React4.createElement("div", { className: "fv-error-summary" }, /* @__PURE__ */ React4.createElement("ul", null, Object.entries(errors).filter(([field, msg]) => msg && currentFields[field]).map(([field, message]) => {
      var _a;
      return /* @__PURE__ */ React4.createElement("li", { key: field }, /* @__PURE__ */ React4.createElement("strong", null, ((_a = currentFields[field]) == null ? void 0 : _a.label) || field, ":"), " ", message);
    }))), /* @__PURE__ */ React4.createElement("div", { className: "step3-header" }, /* @__PURE__ */ React4.createElement("h2", { className: "step3-title" }, schema.steps[step].title), stepShow && /* @__PURE__ */ React4.createElement("p", { className: "step3-subtitle" }, "Step ", step + 1, " of ", schema.steps.length)), /* @__PURE__ */ React4.createElement("div", { className: "step3-fields" }, Object.keys(currentFields).map(
      (name) => renderField(
        name,
        currentFields[name],
        values[name],
        handleChange,
        errors[name],
        errorType
      )
    )), /* @__PURE__ */ React4.createElement("div", { className: "step3-footer" }, step > 0 ? /* @__PURE__ */ React4.createElement("button", { className: "step3-btn back", onClick: prev }, "\u2190 Back") : /* @__PURE__ */ React4.createElement("div", null), step < schema.steps.length - 1 ? /* @__PURE__ */ React4.createElement("button", { className: "step3-btn next", onClick: next }, "Next \u2192") : /* @__PURE__ */ React4.createElement("button", { className: "step3-btn submit", onClick: handleSubmit }, "Finish \u2713"))));
  } else {
    const hasErrors = Object.entries(errors).some(
      ([field, msg]) => msg && currentFields[field]
    );
    return /* @__PURE__ */ React4.createElement("div", { className: "stepper-wrapper" }, /* @__PURE__ */ React4.createElement("div", { className: "stepper-container" }, errorType === "popup" && showPopup && hasErrors && /* @__PURE__ */ React4.createElement("div", { className: "fv-popup-overlay" }, /* @__PURE__ */ React4.createElement("div", { className: "fv-popup" }, /* @__PURE__ */ React4.createElement("div", { className: "fv-popup-header" }, /* @__PURE__ */ React4.createElement("h3", null, "\u26A0\uFE0F Please fix the following errors"), /* @__PURE__ */ React4.createElement(
      "button",
      {
        className: "fv-popup-close",
        onClick: () => setShowPopup(false)
      },
      "\u2715"
    )), /* @__PURE__ */ React4.createElement("ul", { className: "fv-popup-list" }, Object.entries(errors).filter(([field, msg]) => msg && currentFields[field]).map(([field, message]) => {
      var _a;
      return /* @__PURE__ */ React4.createElement("li", { key: field }, /* @__PURE__ */ React4.createElement("strong", null, ((_a = currentFields[field]) == null ? void 0 : _a.label) || field, ":"), " ", message);
    })))), stepShow && /* @__PURE__ */ React4.createElement("div", { className: "stepper-header" }, schema.steps.map((_, index) => /* @__PURE__ */ React4.createElement(React4.Fragment, { key: index }, /* @__PURE__ */ React4.createElement("div", { className: "stepper-item" }, /* @__PURE__ */ React4.createElement(
      "div",
      {
        className: `stepper-circle ${index === step ? "active" : index < step ? "completed" : ""}`
      },
      index < step ? "\u2713" : index + 1
    ), /* @__PURE__ */ React4.createElement(
      "span",
      {
        className: `stepper-label ${index === step ? "active" : ""}`
      },
      "Step ",
      index + 1
    )), index !== schema.steps.length - 1 && /* @__PURE__ */ React4.createElement(
      "div",
      {
        className: `stepper-line ${index < step ? "active" : ""}`
      }
    )))), errorType === "beforField" && Object.entries(errors).some(
      ([field, msg]) => msg && currentFields[field]
    ) && /* @__PURE__ */ React4.createElement("div", { className: "fv-error-summary" }, /* @__PURE__ */ React4.createElement("ul", null, Object.entries(errors).filter(([field, msg]) => msg && currentFields[field]).map(([field, message]) => {
      var _a;
      return /* @__PURE__ */ React4.createElement("li", { key: field }, /* @__PURE__ */ React4.createElement("strong", null, ((_a = currentFields[field]) == null ? void 0 : _a.label) || field, ":"), " ", message);
    }))), /* @__PURE__ */ React4.createElement("div", { className: "stepper-body" }, /* @__PURE__ */ React4.createElement("h2", { className: "stepper-title" }, schema.steps[step].title), /* @__PURE__ */ React4.createElement("div", { className: "stepper-fields" }, Object.keys(currentFields).map(
      (name) => renderField(
        name,
        currentFields[name],
        values[name],
        handleChange,
        errors[name],
        errorType
      )
    ))), /* @__PURE__ */ React4.createElement("div", { className: "stepper-footer" }, step > 0 ? /* @__PURE__ */ React4.createElement("button", { className: "stepper-btn-back", onClick: prev }, "Previous") : /* @__PURE__ */ React4.createElement("div", null), step < schema.steps.length - 1 ? /* @__PURE__ */ React4.createElement("button", { className: "stepper-btn-next", onClick: next }, "Continue") : /* @__PURE__ */ React4.createElement("button", { className: "stepper-btn-submit", onClick: handleSubmit }, "Complete Registration"))));
  }
};
var StepForm_default = StepForm;
export {
  Form_default as Form,
  StepForm_default as StepForm
};
//# sourceMappingURL=index.mjs.map