// src/components/Form.jsx
import React5, { useState as useState5 } from "react";

// src/hooks/useForm.js
import { useState } from "react";

// src/core/validate.js
var validateField = (value, rules = {}, allValues = {}) => {
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
    const result = rules.validate(value, allValues);
    if (result !== true) return result || "Invalid value";
  }
  return "";
};

// src/hooks/useForm.js
var useForm = (fields, customHandlers = {}) => {
  const getAllFields = () => {
    let all = {};
    Object.entries(fields).forEach(([key, field]) => {
      if (field.type === "group") {
        Object.assign(all, field.fields);
      } else {
        all[key] = field;
      }
    });
    return all;
  };
  const allFields = getAllFields();
  const getInitialValues = () => {
    const initial = {};
    Object.entries(allFields).forEach(([key, field]) => {
      if (field.type === "hidden") {
        initial[key] = typeof field.value === "function" ? field.value() : field.value ?? "";
      } else {
        initial[key] = "";
      }
    });
    return initial;
  };
  const getInitialVisibility = () => {
    const vis = {};
    Object.entries(allFields).forEach(([key, field]) => {
      vis[key] = field.hidden ? false : true;
    });
    return vis;
  };
  const [values, setValues] = useState(getInitialValues);
  const [errors, setErrors] = useState({});
  const [dynamicOptions, setDynamicOptions] = useState({});
  const [visibleFields, setVisibleFields] = useState(getInitialVisibility);
  const setOptions = (fieldName, options) => {
    setDynamicOptions((prev) => ({ ...prev, [fieldName]: options }));
  };
  const setVisible = (fieldName, isVisible) => {
    setVisibleFields((prev) => ({ ...prev, [fieldName]: isVisible }));
  };
  const setValue = (fieldName, value) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
  };
  const runEvents = async (fieldName, triggerType, value, updatedValues) => {
    const field = allFields[fieldName];
    if (!(field == null ? void 0 : field.events)) return;
    for (const event of field.events) {
      if (event.trigger !== triggerType) continue;
      switch (event.action) {
        // ✅ SHOW FIELD
        case "showField":
          setVisibleFields((prev) => ({ ...prev, [event.target]: true }));
          break;
        // ✅ HIDE FIELD
        case "hideField":
          setVisibleFields((prev) => ({ ...prev, [event.target]: false }));
          break;
        // ✅ RESET FIELD
        case "resetField": {
          const targets = Array.isArray(event.target) ? event.target : [event.target];
          setValues((prev) => {
            const updated = { ...prev };
            targets.forEach((t) => updated[t] = "");
            return updated;
          });
          break;
        }
        // ✅ SET VALUE
        case "setValue":
          setValue(event.target, event.value);
          break;
        // ✅ CALL CUSTOM HANDLER
        case "call":
          if (customHandlers == null ? void 0 : customHandlers[event.handler]) {
            await customHandlers[event.handler]({
              value,
              values: updatedValues,
              setOptions,
              setValues,
              setValue,
              setVisible
            });
          }
          break;
        default:
          break;
      }
    }
  };
  const clearDependencies = (parent, updated) => {
    Object.entries(allFields).forEach(([key, field]) => {
      var _a;
      if (((_a = field.showWhen) == null ? void 0 : _a.field) === parent || field.dependsOn === parent) {
        updated[key] = "";
        clearDependencies(key, updated);
      }
    });
  };
  const handleChange = (name, value) => {
    var _a, _b, _c;
    let updatedValues = { ...values, [name]: value };
    Object.entries(allFields).forEach(([key, field]) => {
      var _a2;
      if (((_a2 = field.showWhen) == null ? void 0 : _a2.field) === name || field.dependsOn === name) {
        let isMatch = false;
        if (field.showWhen) {
          if (typeof field.showWhen === "function") {
            isMatch = field.showWhen({ ...updatedValues, [name]: value });
          } else if (field.showWhen.value === "*") {
            isMatch = value !== void 0 && value !== null && value !== "";
          } else if (Array.isArray(field.showWhen.value)) {
            isMatch = field.showWhen.value.includes(value);
          } else {
            isMatch = value === field.showWhen.value;
          }
        } else if (field.dependsOn === name) {
          isMatch = value !== void 0 && value !== null && value !== "";
        }
        if (!isMatch) {
          updatedValues[key] = "";
          clearDependencies(key, updatedValues);
        }
      }
    });
    setValues(updatedValues);
    if (((_a = allFields[name]) == null ? void 0 : _a.type) !== "hidden") {
      const error = validateField(
        value,
        (_b = allFields[name]) == null ? void 0 : _b.rules,
        updatedValues
      );
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
    if ((_c = allFields[name]) == null ? void 0 : _c.onChange) {
      allFields[name].onChange(value, {
        setOptions,
        values: updatedValues,
        setValues: (newVals) => setValues((prev) => ({ ...prev, ...newVals }))
      });
    }
    runEvents(name, "onChange", value, updatedValues);
    Object.entries(allFields).forEach(async ([key, field]) => {
      if (field.dependsOn === name && field.getOptions) {
        if (value) {
          try {
            const resolvedOptions = await field.getOptions(updatedValues);
            setOptions(key, resolvedOptions);
          } catch (err) {
            console.error(`Failed to get options for dependent field ${key}`, err);
          }
        } else {
          setOptions(key, []);
        }
      }
    });
  };
  const validateAll = (fieldsToValidate = allFields) => {
    let newErrors = {};
    Object.keys(fieldsToValidate).forEach((key) => {
      var _a;
      const error = validateField(
        values[key],
        (_a = fieldsToValidate[key]) == null ? void 0 : _a.rules,
        values
      );
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  return {
    values,
    errors,
    handleChange,
    validateAll,
    dynamicOptions,
    visibleFields,
    // 👈 NEW — event-driven visibility map
    setValue,
    setVisible,
    setOptions
  };
};

// src/core/renderField.jsx
import React4 from "react";

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

// src/components/CustomSelect.jsx
import React2, { useState as useState3, useEffect as useEffect2, useRef as useRef2 } from "react";
var CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState3(false);
  const [search, setSearch] = useState3("");
  const ref = useRef2();
  const inputRef = useRef2();
  useEffect2(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  useEffect2(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);
  const handleSelect = (val) => {
    onChange({ target: { value: val, name: "custom-select" } });
    setOpen(false);
    setSearch("");
  };
  const getLabel = (val) => {
    var _a;
    return (_a = options == null ? void 0 : options.find((o) => o.value === val)) == null ? void 0 : _a.label;
  };
  const filteredOptions = (options == null ? void 0 : options.filter(
    (opt) => opt.label.toLowerCase().includes(search.toLowerCase())
  )) || [];
  return /* @__PURE__ */ React2.createElement("div", { className: "custom-select", ref }, /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: "select-box",
      onClick: () => {
        setOpen(!open);
        if (open) setSearch("");
      }
    },
    !value ? /* @__PURE__ */ React2.createElement("span", { className: "placeholder" }, placeholder || "Select") : /* @__PURE__ */ React2.createElement("span", { className: "tag", style: { background: "transparent", padding: 0 } }, getLabel(value) || value),
    /* @__PURE__ */ React2.createElement("span", { className: "arrow" }, "\u25BE")
  ), open && /* @__PURE__ */ React2.createElement("div", { className: "dropdown" }, /* @__PURE__ */ React2.createElement("div", { className: "search-wrapper" }, /* @__PURE__ */ React2.createElement(
    "input",
    {
      ref: inputRef,
      type: "text",
      className: "search-input",
      placeholder: "Search...",
      value: search,
      onChange: (e) => setSearch(e.target.value),
      onClick: (e) => e.stopPropagation()
    }
  )), /* @__PURE__ */ React2.createElement("div", { className: "options-container" }, filteredOptions.length > 0 ? filteredOptions.map((opt, i) => {
    const isSelected = value === opt.value;
    return /* @__PURE__ */ React2.createElement(
      "div",
      {
        key: i,
        className: `option ${isSelected ? "active" : ""}`,
        onClick: (e) => {
          e.stopPropagation();
          handleSelect(opt.value);
        }
      },
      opt.label
    );
  }) : /* @__PURE__ */ React2.createElement("div", { className: "option no-results" }, "No results found"))));
};
var CustomSelect_default = CustomSelect;

// src/components/PasswordField.jsx
import React3, { useState as useState4 } from "react";
var PasswordField = ({
  value,
  onChange,
  name,
  config,
  error
  // from useForm
}) => {
  const [show, setShow] = useState4(false);
  return /* @__PURE__ */ React3.createElement("div", { className: "password-wrapper" }, /* @__PURE__ */ React3.createElement("div", { className: "password-field" }, /* @__PURE__ */ React3.createElement(
    "input",
    {
      type: show ? "text" : "password",
      name,
      value: value || "",
      className: `input ${error ? "error" : ""}`,
      onChange: (e) => onChange({ target: { value: e.target.value } })
    }
  ), /* @__PURE__ */ React3.createElement(
    "button",
    {
      type: "button",
      className: "toggle-btn",
      onClick: () => setShow((prev) => !prev)
    },
    show ? "\u{1F648}" : "\u{1F441}"
  )), error && /* @__PURE__ */ React3.createElement("p", { className: "error-text" }, error));
};
var PasswordField_default = PasswordField;

// src/core/renderField.jsx
var fieldMap = {
  text: (props) => /* @__PURE__ */ React4.createElement("input", { type: "text", ...props }),
  email: (props) => /* @__PURE__ */ React4.createElement("input", { type: "email", ...props }),
  // password: (props) => <input type="password" {...props} />,
  textarea: (props) => /* @__PURE__ */ React4.createElement("textarea", { ...props }),
  // ✅ NEW: DATE FIELD
  date: (props) => /* @__PURE__ */ React4.createElement("input", { type: "date", ...props }),
  // ✅ NEW: TIME FIELD
  time: (props) => /* @__PURE__ */ React4.createElement("input", { type: "time", ...props }),
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
  password: (props, config) => /* @__PURE__ */ React4.createElement(PasswordField_default, { ...props, config, error: props.error }),
  select: (props, config) => {
    if (config.multiSelect) {
      return /* @__PURE__ */ React4.createElement(
        CustomeMultiSelect_default,
        {
          value: props.value || [],
          onChange: props.onChange,
          options: config.options,
          placeholder: config.placeholder
        }
      );
    }
    return /* @__PURE__ */ React4.createElement(
      CustomSelect_default,
      {
        value: props.value || "",
        onChange: props.onChange,
        options: config.options,
        placeholder: config.placeholder
      }
    );
  },
  // ✅ CHECKBOX (FIXED UI)
  checkbox: (props, config) => {
    var _a;
    return /* @__PURE__ */ React4.createElement("div", { className: "checkbox-group" }, (_a = config.options) == null ? void 0 : _a.map((opt, i) => {
      var _a2;
      const checked = (_a2 = props.value) == null ? void 0 : _a2.includes(opt.value);
      return /* @__PURE__ */ React4.createElement(
        "label",
        {
          key: i,
          className: `selection-item ${checked ? "active" : ""}`
        },
        /* @__PURE__ */ React4.createElement(
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
        /* @__PURE__ */ React4.createElement("span", { className: "custom-box" }),
        opt.image ? /* @__PURE__ */ React4.createElement(
          "img",
          {
            src: opt.image,
            alt: opt.label || "option",
            className: "checkbox-image"
          }
        ) : opt.icon ? /* @__PURE__ */ React4.createElement("span", { className: "checkbox-image" }, opt.icon) : /* @__PURE__ */ React4.createElement("span", { className: "label-text" }, opt.label)
      );
    }));
  },
  // ✅ RADIO (FIXED UI)
  radio: (props, config) => {
    var _a;
    return /* @__PURE__ */ React4.createElement("div", { className: "radio-group" }, (_a = config.options) == null ? void 0 : _a.map((opt, i) => {
      const checked = props.value === opt.value;
      return /* @__PURE__ */ React4.createElement(
        "label",
        {
          key: i,
          className: `selection-item ${checked ? "active" : ""}`
        },
        /* @__PURE__ */ React4.createElement(
          "input",
          {
            type: "radio",
            name: props.name,
            value: opt.value,
            checked,
            onChange: (e) => props.onChange({ target: { value: e.target.value } })
          }
        ),
        /* @__PURE__ */ React4.createElement("span", { className: "custom-radio" }),
        opt.image ? /* @__PURE__ */ React4.createElement(
          "img",
          {
            src: opt.image,
            alt: opt.label || "option",
            className: "radio-image"
          }
        ) : opt.icon ? /* @__PURE__ */ React4.createElement("span", { className: "radio-image" }, opt.icon) : /* @__PURE__ */ React4.createElement("span", { className: "label-text" }, opt.label)
      );
    }));
  },
  // ✅ FILE
  file: (props, config) => /* @__PURE__ */ React4.createElement(
    "input",
    {
      type: "file",
      accept: config.accept || "*",
      className: props.className,
      onChange: (e) => props.onChange({ target: { value: e.target.files[0] } })
    }
  ),
  // ✅ DROPZONE
  // dropzone: (props, config) => (
  //   <div
  //     className="dropzone"
  //     onDragOver={(e) => e.preventDefault()}
  //     onDrop={(e) => {
  //       e.preventDefault();
  //       const file = e.dataTransfer.files[0];
  //       props.onChange({ target: { value: file } });
  //     }}
  //   >
  //     {/* <p>Drag & Drop file here or click</p> */}
  //     <p>
  //       {props.value?.name
  //         ? `📄 ${props.value.name}`
  //         : "Drag & Drop file here or click to upload"}
  //     </p>
  //     <input
  //       type="file"
  //       accept={config.accept || "*"}
  //       onChange={(e) =>
  //         props.onChange({ target: { value: e.target.files[0] } })
  //       }
  //       className="dropzone-input"
  //     />
  //   </div>
  // ),
  dropzone: (props, config) => {
    var _a, _b;
    const isMultiple = config.multiple;
    const handleFiles = (files) => {
      if (isMultiple) {
        const fileArray = Array.from(files);
        props.onChange({ target: { value: fileArray } });
      } else {
        props.onChange({ target: { value: files[0] } });
      }
    };
    return /* @__PURE__ */ React4.createElement(
      "div",
      {
        className: "dropzone",
        onDragOver: (e) => e.preventDefault(),
        onDrop: (e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }
      },
      /* @__PURE__ */ React4.createElement("p", null, isMultiple ? ((_a = props.value) == null ? void 0 : _a.length) ? `\u{1F4C2} ${props.value.length} files selected` : "Drag & Drop files here or click to upload" : ((_b = props.value) == null ? void 0 : _b.name) ? `\u{1F4C4} ${props.value.name}` : "Drag & Drop file here or click to upload"),
      /* @__PURE__ */ React4.createElement(
        "input",
        {
          type: "file",
          accept: config.accept || "*",
          multiple: isMultiple,
          onChange: (e) => handleFiles(e.target.files),
          className: "dropzone-input"
        }
      )
    );
  },
  content: (props, config) => {
    if (typeof config.content === "object") {
      return /* @__PURE__ */ React4.createElement("div", { className: "form-content" }, config.content);
    }
    return /* @__PURE__ */ React4.createElement(
      "div",
      {
        className: "form-content",
        dangerouslySetInnerHTML: { __html: config.content || "" }
      }
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
  const ErrorUI = error && (typeof error === "string" ? /* @__PURE__ */ React4.createElement("p", { className: "error-text" }, config.errorIcon && /* @__PURE__ */ React4.createElement("span", { className: "error-icon" }, config.errorIcon), config.errorImage && /* @__PURE__ */ React4.createElement("img", { src: config.errorImage, alt: "error", className: "error-image" }), /* @__PURE__ */ React4.createElement("span", null, error)) : /* @__PURE__ */ React4.createElement("div", { className: "error-text" }, config.errorIcon && /* @__PURE__ */ React4.createElement("span", { className: "error-icon" }, config.errorIcon), config.errorImage && /* @__PURE__ */ React4.createElement("img", { src: config.errorImage, alt: "error", className: "error-image" }), error, " "));
  return /* @__PURE__ */ React4.createElement("div", { className: "form-group", key: name }, config.label && /* @__PURE__ */ React4.createElement("label", { className: "label" }, config.label, config.tooltip && /* @__PURE__ */ React4.createElement("span", { className: "tooltip-wrapper" }, "\u24D8", /* @__PURE__ */ React4.createElement("span", { className: "tooltip-text" }, config.tooltip))), FieldComponent(commonProps, config), config.description && /* @__PURE__ */ React4.createElement("p", { className: "field-description" }, config.description), error && errorType === "afterField" && ErrorUI);
};

// src/components/Form.jsx
var Form = ({
  schema,
  onSubmit,
  apiError,
  loading,
  errorType,
  type,
  gridType = 2,
  customHandlers = {}
  // 👈 NEW: accept event-driven custom handlers
}) => {
  const {
    values,
    errors,
    handleChange,
    validateAll,
    dynamicOptions,
    visibleFields: hookVisibleFields
    // 👈 event-driven visibility from hook
  } = useForm(schema.fields, customHandlers);
  const getMergedFields = (srcFields) => {
    let res = {};
    Object.keys(srcFields || {}).forEach((k) => {
      if (srcFields[k].type === "group") {
        res[k] = { ...srcFields[k], fields: getMergedFields(srcFields[k].fields || {}) };
      } else {
        res[k] = { ...srcFields[k], ...(dynamicOptions == null ? void 0 : dynamicOptions[k]) ? { options: dynamicOptions[k] } : {} };
      }
    });
    return res;
  };
  const fields = getMergedFields(schema.fields);
  const flattenFields = (srcFields) => {
    let flat = {};
    Object.keys(srcFields).forEach((key) => {
      const field = srcFields[key];
      if (field.type === "group") {
        flat = { ...flat, ...flattenFields(field.fields || {}) };
      } else {
        flat[key] = field;
      }
    });
    return flat;
  };
  const flatFields = flattenFields(fields);
  const visibleFields = Object.fromEntries(
    Object.entries(flatFields).filter(([key, field]) => {
      if (field.events || field.hidden !== void 0) {
        return hookVisibleFields[key] !== false;
      }
      if (field.showWhen) {
        if (typeof field.showWhen === "function") {
          return field.showWhen(values);
        }
        const depVal = values[field.showWhen.field];
        if (field.showWhen.value === "*") {
          return depVal !== void 0 && depVal !== null && depVal !== "";
        }
        if (Array.isArray(field.showWhen.value)) {
          return field.showWhen.value.includes(depVal);
        }
        return depVal === field.showWhen.value;
      }
      if (field.dependsOn) {
        const depVal = values[field.dependsOn];
        return depVal !== void 0 && depVal !== null && depVal !== "";
      }
      return true;
    })
  );
  const [submittedData, setSubmittedData] = useState5(null);
  const [showPopup, setShowPopup] = useState5(true);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll(visibleFields)) {
      setShowPopup(true);
      return;
    }
    const res = await onSubmit(values);
    if (!apiError && res !== false) {
      setSubmittedData(values);
    }
  };
  if (loading) {
    return /* @__PURE__ */ React5.createElement("div", { className: "form-wrapper" }, /* @__PURE__ */ React5.createElement("div", { className: "form-container loader-box" }, /* @__PURE__ */ React5.createElement("div", { className: "loader-spinner" }), /* @__PURE__ */ React5.createElement("p", { className: "loader-text" }, "Processing...")));
  }
  if (apiError) {
    return /* @__PURE__ */ React5.createElement("div", { className: "form-wrapper" }, /* @__PURE__ */ React5.createElement("div", { className: "form-container error-box" }, /* @__PURE__ */ React5.createElement("h2", { className: "error-title" }, "\u274C Error"), /* @__PURE__ */ React5.createElement("p", { className: "error-message" }, apiError)));
  }
  if (submittedData && !apiError) {
    return /* @__PURE__ */ React5.createElement("div", { className: "form-wrapper" }, /* @__PURE__ */ React5.createElement("div", { className: "form-container success-box" }, /* @__PURE__ */ React5.createElement("h2", { className: "success-title" }, "\u2705 Submitted Data"), /* @__PURE__ */ React5.createElement("div", { className: "summary-list" }, Object.entries(submittedData).filter(([_, value]) => {
      if (value === void 0 || value === null) return false;
      if (value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === "object" && !(value instanceof File)) {
        return Object.keys(value).length > 0;
      }
      return true;
    }).map(([key, value]) => {
      return /* @__PURE__ */ React5.createElement("div", { key, className: "summary-item" }, /* @__PURE__ */ React5.createElement("span", { className: "summary-label" }, key), /* @__PURE__ */ React5.createElement("span", { className: "summary-value" }, (() => {
        if (value instanceof File) return value.name;
        if (Array.isArray(value)) return value.join(", ");
        if (typeof value === "object" && value !== null)
          return "-";
        return (value == null ? void 0 : value.toString()) || "-";
      })()));
    }))));
  }
  const hasErrors = Object.entries(errors).some(
    ([field, msg]) => msg && visibleFields[field]
  );
  const renderGroupedFields = (wrapperClass = "") => {
    return Object.keys(fields).map((name) => {
      const config = fields[name];
      if (config.type === "group") {
        return /* @__PURE__ */ React5.createElement("div", { className: "form-group-wrapper", key: name }, config.label && /* @__PURE__ */ React5.createElement("h3", { className: "group-title" }, config.label), config.description && /* @__PURE__ */ React5.createElement("p", { className: "group-description" }, config.description), /* @__PURE__ */ React5.createElement(
          "div",
          {
            className: "group-fields",
            style: {
              display: "grid",
              gridTemplateColumns: `repeat(${config.grid || 1}, 1fr)`,
              gap: "12px"
            }
          },
          Object.keys(config.fields || {}).map((childName) => {
            const childConfig = config.fields[childName];
            if (!visibleFields[childName]) return null;
            return /* @__PURE__ */ React5.createElement("div", { className: wrapperClass, key: childName }, renderField(
              childName,
              childConfig,
              values[childName],
              handleChange,
              errors[childName],
              errorType
            ));
          })
        ));
      }
      if (!visibleFields[name]) return null;
      return /* @__PURE__ */ React5.createElement("div", { className: wrapperClass, key: name }, renderField(
        name,
        config,
        values[name],
        handleChange,
        errors[name],
        errorType
      ));
    });
  };
  const hasGroup = Object.values(fields).some(
    (field) => field.type === "group"
  );
  if (type === "layoutTwo") {
    return /* @__PURE__ */ React5.createElement("div", { className: "fv2-wrapper" }, /* @__PURE__ */ React5.createElement("div", { className: "fv2-container" }, errorType === "popup" && showPopup && hasErrors && /* @__PURE__ */ React5.createElement("div", { className: "fv-popup-overlay" }, /* @__PURE__ */ React5.createElement("div", { className: "fv-popup" }, /* @__PURE__ */ React5.createElement("div", { className: "fv-popup-header" }, /* @__PURE__ */ React5.createElement("h3", null, "\u26A0\uFE0F Please fix the following errors"), /* @__PURE__ */ React5.createElement(
      "button",
      {
        className: "fv-popup-close",
        onClick: () => setShowPopup(false)
      },
      "\u2715"
    )), /* @__PURE__ */ React5.createElement("ul", { className: "fv-popup-list" }, Object.entries(errors).map(([field, message]) => {
      var _a;
      if (!message || !visibleFields[field]) return null;
      return /* @__PURE__ */ React5.createElement("li", { key: field }, /* @__PURE__ */ React5.createElement("strong", null, ((_a = visibleFields[field]) == null ? void 0 : _a.label) || field, ":"), " ", message);
    })))), /* @__PURE__ */ React5.createElement("form", { onSubmit: handleSubmit, className: "fv2-form" }, errorType === "beforField" && hasErrors && /* @__PURE__ */ React5.createElement("div", { className: "fv-error-summary" }, /* @__PURE__ */ React5.createElement("ul", null, Object.entries(errors).map(([field, message]) => {
      var _a;
      if (!message || !visibleFields[field]) return null;
      return /* @__PURE__ */ React5.createElement("li", { key: field }, /* @__PURE__ */ React5.createElement("strong", null, ((_a = visibleFields[field]) == null ? void 0 : _a.label) || field, ":"), " ", message);
    }))), hasGroup ? /* @__PURE__ */ React5.createElement(React5.Fragment, null, Object.keys(fields).map((name) => {
      const config = fields[name];
      if (config.type === "group") {
        return /* @__PURE__ */ React5.createElement("div", { className: "form-group-wrapper", key: name }, config.label && /* @__PURE__ */ React5.createElement("h3", { className: "group-title" }, config.label), config.description && /* @__PURE__ */ React5.createElement("p", { className: "group-description" }, config.description), /* @__PURE__ */ React5.createElement(
          "div",
          {
            className: "group-fields",
            style: {
              display: "grid",
              gridTemplateColumns: `repeat(${config.grid || 1}, 1fr)`,
              gap: "12px"
            }
          },
          Object.keys(config.fields || {}).map((childName) => {
            const childConfig = config.fields[childName];
            if (!visibleFields[childName]) return null;
            return /* @__PURE__ */ React5.createElement("div", { className: "fv2-field", key: childName }, renderField(
              childName,
              childConfig,
              values[childName],
              handleChange,
              errors[childName],
              errorType
            ));
          })
        ));
      }
      return null;
    }), /* @__PURE__ */ React5.createElement(
      "div",
      {
        className: "fv2-grid",
        style: { gridTemplateColumns: `repeat(${gridType}, 1fr)` }
      },
      Object.keys(fields).map((name) => {
        const config = fields[name];
        if (config.type === "group") return null;
        if (!visibleFields[name]) return null;
        return /* @__PURE__ */ React5.createElement("div", { className: "fv2-field", key: name }, renderField(
          name,
          config,
          values[name],
          handleChange,
          errors[name],
          errorType
        ));
      })
    )) : /* @__PURE__ */ React5.createElement(
      "div",
      {
        className: "fv2-grid",
        style: { gridTemplateColumns: `repeat(${gridType}, 1fr)` }
      },
      Object.keys(visibleFields).map((name) => /* @__PURE__ */ React5.createElement("div", { className: "fv2-field", key: name }, renderField(
        name,
        visibleFields[name],
        values[name],
        handleChange,
        errors[name],
        errorType
      )))
    ), /* @__PURE__ */ React5.createElement("div", { className: "fv2-footer" }, /* @__PURE__ */ React5.createElement("button", { type: "submit", className: "fv2-btn" }, "Submit Details")))));
  } else if (type === "layoutThree") {
    return /* @__PURE__ */ React5.createElement("div", { className: "fv4-wrapper" }, /* @__PURE__ */ React5.createElement("div", { className: "fv4-container" }, errorType === "popup" && showPopup && hasErrors && /* @__PURE__ */ React5.createElement("div", { className: "fv-popup-overlay" }, /* @__PURE__ */ React5.createElement("div", { className: "fv-popup" }, /* @__PURE__ */ React5.createElement("div", { className: "fv-popup-header" }, /* @__PURE__ */ React5.createElement("h3", null, "\u26A0\uFE0F Please fix the following errors"), /* @__PURE__ */ React5.createElement(
      "button",
      {
        className: "fv-popup-close",
        onClick: () => setShowPopup(false)
      },
      "\u2715"
    )), /* @__PURE__ */ React5.createElement("ul", { className: "fv-popup-list" }, Object.entries(errors).map(([field, message]) => {
      var _a;
      if (!message || !visibleFields[field]) return null;
      return /* @__PURE__ */ React5.createElement("li", { key: field }, /* @__PURE__ */ React5.createElement("strong", null, ((_a = visibleFields[field]) == null ? void 0 : _a.label) || field, ":"), " ", message);
    })))), /* @__PURE__ */ React5.createElement("form", { onSubmit: handleSubmit, className: "fv4-form" }, errorType === "beforField" && hasErrors && /* @__PURE__ */ React5.createElement("div", { className: "fv-error-summary" }, /* @__PURE__ */ React5.createElement("ul", null, Object.entries(errors).map(([field, message]) => {
      var _a;
      if (!message || !visibleFields[field]) return null;
      return /* @__PURE__ */ React5.createElement("li", { key: field }, /* @__PURE__ */ React5.createElement("strong", null, ((_a = visibleFields[field]) == null ? void 0 : _a.label) || field, ":"), " ", message);
    }))), /* @__PURE__ */ React5.createElement("div", { className: "fv4-fields" }, /* @__PURE__ */ React5.createElement("div", { className: "fv4-fields" }, hasGroup ? renderGroupedFields("fv4-field-box") : Object.keys(visibleFields).map((name) => /* @__PURE__ */ React5.createElement("div", { className: "fv4-field-box", key: name }, renderField(
      name,
      visibleFields[name],
      values[name],
      handleChange,
      errors[name],
      errorType
    ))))), /* @__PURE__ */ React5.createElement("div", { className: "fv4-footer" }, /* @__PURE__ */ React5.createElement("button", { type: "submit", className: "fv4-submit" }, "Submit Form")))));
  } else {
    return /* @__PURE__ */ React5.createElement("div", { className: "form-wrapper" }, /* @__PURE__ */ React5.createElement("div", { className: "form-container" }, errorType === "popup" && showPopup && hasErrors && /* @__PURE__ */ React5.createElement("div", { className: "fv-popup-overlay" }, /* @__PURE__ */ React5.createElement("div", { className: "fv-popup" }, /* @__PURE__ */ React5.createElement("div", { className: "fv-popup-header" }, /* @__PURE__ */ React5.createElement("h3", null, "\u26A0\uFE0F Please fix the following errors"), /* @__PURE__ */ React5.createElement(
      "button",
      {
        className: "fv-popup-close",
        onClick: () => setShowPopup(false)
      },
      "\u2715"
    )), /* @__PURE__ */ React5.createElement("ul", { className: "fv-popup-list" }, Object.entries(errors).map(([field, message]) => {
      var _a;
      if (!message || !visibleFields[field]) return null;
      return /* @__PURE__ */ React5.createElement("li", { key: field }, /* @__PURE__ */ React5.createElement("strong", null, ((_a = visibleFields[field]) == null ? void 0 : _a.label) || field, ":"), " ", message);
    })))), /* @__PURE__ */ React5.createElement("form", { onSubmit: handleSubmit, className: "form-content" }, errorType === "beforField" && hasErrors && /* @__PURE__ */ React5.createElement("div", { className: "fv-error-summary" }, /* @__PURE__ */ React5.createElement("ul", null, Object.entries(errors).map(([field, message]) => {
      var _a;
      if (!message || !visibleFields[field]) return null;
      return /* @__PURE__ */ React5.createElement("li", { key: field }, /* @__PURE__ */ React5.createElement("strong", null, ((_a = visibleFields[field]) == null ? void 0 : _a.label) || field, ":"), " ", message);
    }))), /* @__PURE__ */ React5.createElement("div", { className: "fields-grid" }, hasGroup ? renderGroupedFields() : Object.keys(visibleFields).map(
      (name) => renderField(
        name,
        visibleFields[name],
        values[name],
        handleChange,
        errors[name],
        errorType
      )
    )), /* @__PURE__ */ React5.createElement("button", { type: "submit", className: "submit-btn" }, "Submit Details"))));
  }
};
var Form_default = Form;

// src/components/StepForm.jsx
import React6, { useState as useState6 } from "react";

// src/core/getVisibleFields.jsx
var getVisibleFields = (fields, values) => {
  return Object.fromEntries(
    Object.entries(fields).filter(([key, field]) => {
      if (!field.showWhen) {
        if (field.dependsOn) {
          const depVal = values[field.dependsOn];
          return depVal !== void 0 && depVal !== null && depVal !== "";
        }
        return true;
      }
      if (typeof field.showWhen === "function") {
        return field.showWhen(values);
      }
      const dependentValue = values[field.showWhen.field];
      if (field.showWhen.value === "*") {
        return dependentValue !== void 0 && dependentValue !== null && dependentValue !== "";
      }
      if (Array.isArray(field.showWhen.value)) {
        return field.showWhen.value.includes(dependentValue);
      }
      return dependentValue === field.showWhen.value;
    })
  );
};

// src/components/StepForm.jsx
var StepForm = ({
  schema,
  onSubmit,
  apiError,
  loading,
  type,
  stepShow,
  errorType,
  percentageResult = false,
  // ⭐ NEW
  apiMode = false,
  // ✅ NEW
  answer = {}
}) => {
  var _a, _b;
  const [step, setStep] = useState6(0);
  const [submittedData, setSubmittedData] = useState6(null);
  const [showPopup, setShowPopup] = useState6(false);
  const [quizResult, setQuizResult] = useState6(null);
  const [error, setError] = useState6(null);
  const [globalError, setGlobalError] = useState6(null);
  const allFields = schema.steps.reduce((acc, step2) => {
    return { ...acc, ...step2.fields };
  }, {});
  const { values, errors, handleChange, validateAll, dynamicOptions } = useForm(allFields);
  const getMergedFields = (srcFields) => {
    let res = {};
    Object.keys(srcFields || {}).forEach((k) => {
      res[k] = {
        ...srcFields[k],
        ...(dynamicOptions == null ? void 0 : dynamicOptions[k]) ? { options: dynamicOptions[k] } : {}
      };
    });
    return res;
  };
  const currentFields = getMergedFields(((_b = (_a = schema.steps) == null ? void 0 : _a[step]) == null ? void 0 : _b.fields) || {});
  const visibleFields = getVisibleFields(currentFields || {}, values || {});
  const next = async () => {
    setGlobalError(null);
    const isValid = validateAll(visibleFields);
    if (!isValid) {
      setShowPopup(true);
      return;
    }
    const navigation2 = schema == null ? void 0 : schema.navigation;
    const currentFields2 = Object.keys(schema.steps[step].fields);
    const currentValues = currentFields2.reduce((acc, key) => {
      acc[key] = values[key];
      return acc;
    }, {});
    if (navigation2 == null ? void 0 : navigation2.onNext) {
      const result = await navigation2.onNext({
        values: currentValues,
        // ✅ ONLY CURRENT STEP
        allValues: values,
        // 🔥 optional full data
        step,
        setError
      });
      if ((result == null ? void 0 : result.next) === false) {
        setGlobalError(result.error);
        return;
      }
    }
    setStep((prev2) => prev2 + 1);
  };
  const prev = async () => {
    setGlobalError(null);
    const navigation2 = schema == null ? void 0 : schema.navigation;
    const currentFields2 = Object.keys(schema.steps[step].fields);
    const currentValues = currentFields2.reduce((acc, key) => {
      acc[key] = values[key];
      return acc;
    }, {});
    if (navigation2 == null ? void 0 : navigation2.onPrev) {
      const result = await navigation2.onPrev({
        values: currentValues,
        allValues: values,
        step
      });
      if ((result == null ? void 0 : result.prev) === false) {
        setGlobalError(result.error);
        return;
      }
    }
    setStep((prev2) => prev2 - 1);
  };
  const handleSubmit = async () => {
    const isValid = validateAll(visibleFields);
    if (!isValid) {
      setShowPopup(true);
      return;
    }
    const res = await onSubmit(values);
    if (res === false) return;
    if (percentageResult) {
      const result = calculateQuizResult(values);
      setQuizResult(result);
      return;
    }
    setSubmittedData(values);
  };
  if (loading) {
    return /* @__PURE__ */ React6.createElement("div", { className: "stepper-wrapper" }, /* @__PURE__ */ React6.createElement("div", { className: "stepper-container loader-box" }, /* @__PURE__ */ React6.createElement("div", { className: "loader-spinner" }), /* @__PURE__ */ React6.createElement("p", { className: "loader-text" }, "Processing...")));
  }
  if (apiError) {
    return /* @__PURE__ */ React6.createElement("div", { className: "stepper-wrapper" }, /* @__PURE__ */ React6.createElement("div", { className: "stepper-container error-box" }, /* @__PURE__ */ React6.createElement("h2", { className: "error-title" }, "\u274C Error"), /* @__PURE__ */ React6.createElement("p", { className: "error-message" }, apiError)));
  }
  if (submittedData && !apiError) {
    return /* @__PURE__ */ React6.createElement("div", { className: "stepper-wrapper" }, /* @__PURE__ */ React6.createElement("div", { className: "stepper-container success-box" }, /* @__PURE__ */ React6.createElement("h2", { className: "success-title" }, "\u2705 Submitted Data"), /* @__PURE__ */ React6.createElement("div", { className: "summary-list" }, Object.keys(submittedData).map((key) => {
      const value = submittedData[key];
      return /* @__PURE__ */ React6.createElement("div", { key, className: "summary-item" }, /* @__PURE__ */ React6.createElement("span", { className: "summary-label" }, key), /* @__PURE__ */ React6.createElement("span", { className: "summary-value" }, (() => {
        if (value instanceof File) return value.name;
        if (Array.isArray(value)) return value.join(", ");
        if (typeof value === "object" && value !== null)
          return "-";
        return (value == null ? void 0 : value.toString()) || "-";
      })()));
    }))));
  }
  const calculateQuizResult = (values2) => {
    let total = 0;
    let correct = 0;
    const details = [];
    const normalizeArray = (arr = []) => {
      if (!Array.isArray(arr)) return [];
      return [...arr].sort();
    };
    const isAnswerCorrect = (field, key, userAnswer) => {
      const correctAnswer = apiMode ? answer == null ? void 0 : answer[key] : field.correctAnswer;
      if (correctAnswer === void 0) return false;
      if (Array.isArray(correctAnswer)) {
        const user = normalizeArray(userAnswer);
        const correct2 = normalizeArray(correctAnswer);
        return Array.isArray(userAnswer) && user.length === correct2.length && user.every((v, i) => v === correct2[i]);
      }
      return String(userAnswer ?? "").trim().toLowerCase() === String(correctAnswer ?? "").trim().toLowerCase();
    };
    schema.steps.forEach((step2) => {
      Object.entries(step2.fields).forEach(([key, field]) => {
        const correctAnswer = apiMode ? answer == null ? void 0 : answer[key] : field.correctAnswer;
        if (correctAnswer !== void 0) {
          total++;
          const userAnswer = values2[key];
          const isCorrect = isAnswerCorrect(field, key, userAnswer);
          if (isCorrect) correct++;
          details.push({
            question: field.label,
            userAnswer,
            correctAnswer,
            isCorrect
          });
        }
      });
    });
    const percentage = total ? correct / total * 100 : 0;
    return {
      totalQuestions: total,
      correctAnswers: correct,
      wrongAnswers: total - correct,
      percentage,
      score: `${correct}/${total}`,
      details
    };
  };
  if (quizResult) {
    return /* @__PURE__ */ React6.createElement("div", { className: "stepper-wrapper" }, /* @__PURE__ */ React6.createElement("div", { className: "stepper-container success-box" }, /* @__PURE__ */ React6.createElement("h2", null, "\u{1F3AF} Quiz Result"), /* @__PURE__ */ React6.createElement("div", { className: "summary-list" }, /* @__PURE__ */ React6.createElement("div", { className: "summary-item" }, /* @__PURE__ */ React6.createElement("span", null, "Total Questions"), /* @__PURE__ */ React6.createElement("b", null, quizResult.totalQuestions)), /* @__PURE__ */ React6.createElement("div", { className: "summary-item" }, /* @__PURE__ */ React6.createElement("span", null, "Correct"), /* @__PURE__ */ React6.createElement("b", null, quizResult.correctAnswers)), /* @__PURE__ */ React6.createElement("div", { className: "summary-item" }, /* @__PURE__ */ React6.createElement("span", null, "Wrong"), /* @__PURE__ */ React6.createElement("b", null, quizResult.wrongAnswers)), /* @__PURE__ */ React6.createElement("div", { className: "summary-item" }, /* @__PURE__ */ React6.createElement("span", null, "Score"), /* @__PURE__ */ React6.createElement("b", null, quizResult.score)), /* @__PURE__ */ React6.createElement("div", { className: "summary-item" }, /* @__PURE__ */ React6.createElement("span", null, "Percentage"), /* @__PURE__ */ React6.createElement("b", null, quizResult.percentage.toFixed(2), "%"))), /* @__PURE__ */ React6.createElement("hr", null), /* @__PURE__ */ React6.createElement("h3", null, "\u{1F4CB} Answer Review"), quizResult.details.map((item, i) => {
      const formatValue = (val) => {
        if (Array.isArray(val)) return val.join(", ");
        if (val === void 0 || val === null || val === "") return "-";
        return val.toString();
      };
      return /* @__PURE__ */ React6.createElement(
        "div",
        {
          key: i,
          className: "summary-item",
          style: {
            flexDirection: "column",
            alignItems: "flex-start",
            marginBottom: "12px",
            padding: "10px",
            borderRadius: "6px",
            background: item.isCorrect ? "#e8f5e9" : "#ffebee"
          }
        },
        /* @__PURE__ */ React6.createElement("span", { style: { fontWeight: "600" } }, item.question),
        /* @__PURE__ */ React6.createElement("span", null, /* @__PURE__ */ React6.createElement("strong", null, "Your Answer:"), " ", formatValue(item.userAnswer)),
        /* @__PURE__ */ React6.createElement("span", null, /* @__PURE__ */ React6.createElement("strong", null, "Correct Answer:"), " ", formatValue(item.correctAnswer)),
        /* @__PURE__ */ React6.createElement(
          "b",
          {
            style: {
              color: item.isCorrect ? "green" : "red",
              marginTop: "4px"
            }
          },
          item.isCorrect ? "\u2714 Correct" : "\u2716 Wrong"
        )
      );
    })));
  }
  const hasErrors = Object.entries(errors || {}).some(
    ([field, msg]) => msg && visibleFields[field]
  );
  const renderFields = () => Object.keys(visibleFields).map(
    (name) => renderField(
      name,
      visibleFields[name],
      values[name],
      handleChange,
      errors[name],
      errorType
    )
  );
  const navigation = schema == null ? void 0 : schema.navigation;
  if (type === "layoutTwo") {
    return /* @__PURE__ */ React6.createElement("div", { className: "fv-wrapper" }, /* @__PURE__ */ React6.createElement("div", { className: "fv-container" }, errorType === "popup" && showPopup && hasErrors && /* @__PURE__ */ React6.createElement("div", { className: "fv-popup-overlay" }, /* @__PURE__ */ React6.createElement("div", { className: "fv-popup" }, /* @__PURE__ */ React6.createElement("div", { className: "fv-popup-header" }, /* @__PURE__ */ React6.createElement("h3", null, "\u26A0\uFE0F Please fix the following errors"), /* @__PURE__ */ React6.createElement(
      "button",
      {
        className: "fv-popup-close",
        onClick: () => setShowPopup(false)
      },
      "\u2715"
    )), /* @__PURE__ */ React6.createElement("ul", { className: "fv-popup-list" }, Object.entries(errors).filter(([field, msg]) => {
      return msg && (currentFields == null ? void 0 : currentFields[field]) && (visibleFields == null ? void 0 : visibleFields[field]) !== false;
    }).map(([field, message]) => {
      var _a2;
      return /* @__PURE__ */ React6.createElement("li", { key: field }, /* @__PURE__ */ React6.createElement("strong", null, ((_a2 = currentFields[field]) == null ? void 0 : _a2.label) || field, ":"), " ", message);
    })))), stepShow && /* @__PURE__ */ React6.createElement("div", { className: "fv-header" }, schema.steps.map((_, index) => /* @__PURE__ */ React6.createElement(React6.Fragment, { key: index }, /* @__PURE__ */ React6.createElement("div", { className: "fv-step-item" }, /* @__PURE__ */ React6.createElement(
      "div",
      {
        className: `fv-step-circle ${index === step ? "active" : index < step ? "completed" : ""}`
      },
      index < step ? "\u2713" : index + 1
    ), /* @__PURE__ */ React6.createElement(
      "span",
      {
        className: `fv-step-label ${index === step ? "active" : ""}`
      },
      "Step ",
      index + 1
    )), index !== schema.steps.length - 1 && /* @__PURE__ */ React6.createElement(
      "div",
      {
        className: `fv-step-line ${index < step ? "active" : ""}`
      }
    )))), errorType === "beforField" && Object.entries(errors).some(([field, msg]) => {
      return msg && (currentFields == null ? void 0 : currentFields[field]) && (visibleFields == null ? void 0 : visibleFields[field]) !== false;
    }) && /* @__PURE__ */ React6.createElement("div", { className: "fv-error-summary" }, /* @__PURE__ */ React6.createElement("ul", null, Object.entries(errors).filter(([field, msg]) => {
      return msg && (currentFields == null ? void 0 : currentFields[field]) && (visibleFields == null ? void 0 : visibleFields[field]) !== false;
    }).map(([field, message]) => {
      var _a2;
      return /* @__PURE__ */ React6.createElement("li", { key: field }, /* @__PURE__ */ React6.createElement("strong", null, ((_a2 = currentFields[field]) == null ? void 0 : _a2.label) || field, ":"), " ", message);
    }))), /* @__PURE__ */ React6.createElement("div", { className: "fv-body" }, /* @__PURE__ */ React6.createElement("h2", { className: "fv-title" }, schema.steps[step].title), /* @__PURE__ */ React6.createElement("div", { className: "fv-fields" }, Object.keys(currentFields).map((name) => {
      if ((visibleFields == null ? void 0 : visibleFields[name]) === false) return null;
      return renderField(
        name,
        currentFields[name],
        values[name],
        handleChange,
        errors[name],
        errorType
      );
    }))), /* @__PURE__ */ React6.createElement("div", { className: "step-block-error" }, error), /* @__PURE__ */ React6.createElement("div", { className: "step-block-error" }, globalError), /* @__PURE__ */ React6.createElement("div", { className: "fv-footer" }, step > 0 ? /* @__PURE__ */ React6.createElement("button", { className: "fv-btn fv-btn-back", onClick: prev }, (navigation == null ? void 0 : navigation.prevLabel) || "Previous") : /* @__PURE__ */ React6.createElement("div", null), step === schema.steps.length - 1 ? /* @__PURE__ */ React6.createElement("button", { className: "fv-btn fv-btn-submit", onClick: handleSubmit }, "Complete Registration") : /* @__PURE__ */ React6.createElement("button", { className: "fv-btn fv-btn-next", onClick: next }, (navigation == null ? void 0 : navigation.nextLabel) || "Continue"))));
  } else if (type === "layoutThree") {
    return /* @__PURE__ */ React6.createElement("div", { className: "step3-wrapper" }, /* @__PURE__ */ React6.createElement("div", { className: "step3-container" }, errorType === "popup" && showPopup && hasErrors && /* @__PURE__ */ React6.createElement("div", { className: "fv-popup-overlay" }, /* @__PURE__ */ React6.createElement("div", { className: "fv-popup" }, /* @__PURE__ */ React6.createElement("div", { className: "fv-popup-header" }, /* @__PURE__ */ React6.createElement("h3", null, "\u26A0\uFE0F Please fix the following errors"), /* @__PURE__ */ React6.createElement(
      "button",
      {
        className: "fv-popup-close",
        onClick: () => setShowPopup(false)
      },
      "\u2715"
    )), /* @__PURE__ */ React6.createElement("ul", { className: "fv-popup-list" }, Object.entries(errors).filter(([field, msg]) => {
      return msg && (currentFields == null ? void 0 : currentFields[field]) && (visibleFields == null ? void 0 : visibleFields[field]) !== false;
    }).map(([field, message]) => {
      var _a2;
      return /* @__PURE__ */ React6.createElement("li", { key: field }, /* @__PURE__ */ React6.createElement("strong", null, ((_a2 = currentFields[field]) == null ? void 0 : _a2.label) || field, ":"), " ", message);
    })))), stepShow && /* @__PURE__ */ React6.createElement("div", { className: "step3-progress" }, /* @__PURE__ */ React6.createElement(
      "div",
      {
        className: "step3-progress-bar",
        style: {
          width: `${(step + 1) / schema.steps.length * 100}%`
        }
      }
    )), errorType === "beforField" && Object.entries(errors).some(([field, msg]) => {
      return msg && (currentFields == null ? void 0 : currentFields[field]) && (visibleFields == null ? void 0 : visibleFields[field]) !== false;
    }) && /* @__PURE__ */ React6.createElement("div", { className: "fv-error-summary" }, /* @__PURE__ */ React6.createElement("ul", null, Object.entries(errors).filter(([field, msg]) => {
      return msg && (currentFields == null ? void 0 : currentFields[field]) && (visibleFields == null ? void 0 : visibleFields[field]) !== false;
    }).map(([field, message]) => {
      var _a2;
      return /* @__PURE__ */ React6.createElement("li", { key: field }, /* @__PURE__ */ React6.createElement("strong", null, ((_a2 = currentFields[field]) == null ? void 0 : _a2.label) || field, ":"), " ", message);
    }))), /* @__PURE__ */ React6.createElement("div", { className: "step3-header" }, /* @__PURE__ */ React6.createElement("h2", { className: "step3-title" }, schema.steps[step].title), stepShow && /* @__PURE__ */ React6.createElement("p", { className: "step3-subtitle" }, "Step ", step + 1, " of ", schema.steps.length)), /* @__PURE__ */ React6.createElement("div", { className: "step3-fields" }, Object.keys(currentFields).map((name) => {
      if ((visibleFields == null ? void 0 : visibleFields[name]) === false) return null;
      return renderField(
        name,
        currentFields[name],
        values[name],
        handleChange,
        errors[name],
        errorType
      );
    })), /* @__PURE__ */ React6.createElement("div", { className: "step-block-error" }, error), /* @__PURE__ */ React6.createElement("div", { className: "step-block-error" }, globalError), /* @__PURE__ */ React6.createElement("div", { className: "step3-footer" }, step > 0 ? /* @__PURE__ */ React6.createElement("button", { className: "step3-btn back", onClick: prev }, (navigation == null ? void 0 : navigation.prevLabel) || "\u2190 Back") : /* @__PURE__ */ React6.createElement("div", null), step === schema.steps.length - 1 ? /* @__PURE__ */ React6.createElement("button", { className: "step3-btn submit", onClick: handleSubmit }, "Finish \u2713") : /* @__PURE__ */ React6.createElement("button", { className: "step3-btn next", onClick: next }, (navigation == null ? void 0 : navigation.nextLabel) || "Next \u2192"))));
  } else {
    return /* @__PURE__ */ React6.createElement("div", { className: "stepper-wrapper" }, /* @__PURE__ */ React6.createElement("div", { className: "stepper-container" }, errorType === "popup" && showPopup && hasErrors && /* @__PURE__ */ React6.createElement("div", { className: "fv-popup-overlay" }, /* @__PURE__ */ React6.createElement("div", { className: "fv-popup" }, /* @__PURE__ */ React6.createElement("div", { className: "fv-popup-header" }, /* @__PURE__ */ React6.createElement("h3", null, "\u26A0\uFE0F Please fix the following errors"), /* @__PURE__ */ React6.createElement(
      "button",
      {
        className: "fv-popup-close",
        onClick: () => setShowPopup(false)
      },
      "\u2715"
    )), /* @__PURE__ */ React6.createElement("ul", { className: "fv-popup-list" }, Object.entries(errors || {}).filter(([field, msg]) => msg && visibleFields[field]).map(([field, message]) => {
      var _a2;
      return /* @__PURE__ */ React6.createElement("li", { key: field }, /* @__PURE__ */ React6.createElement("strong", null, ((_a2 = visibleFields[field]) == null ? void 0 : _a2.label) || field, ":"), " ", message);
    })))), stepShow && /* @__PURE__ */ React6.createElement("div", { className: "stepper-header" }, schema.steps.map((_, index) => /* @__PURE__ */ React6.createElement(React6.Fragment, { key: index }, /* @__PURE__ */ React6.createElement("div", { className: "stepper-item" }, /* @__PURE__ */ React6.createElement(
      "div",
      {
        className: `stepper-circle ${index === step ? "active" : index < step ? "completed" : ""}`
      },
      index < step ? "\u2713" : index + 1
    ), /* @__PURE__ */ React6.createElement(
      "span",
      {
        className: `stepper-label ${index === step ? "active" : ""}`
      },
      "Step ",
      index + 1
    )), index !== schema.steps.length - 1 && /* @__PURE__ */ React6.createElement(
      "div",
      {
        className: `stepper-line ${index < step ? "active" : ""}`
      }
    )))), errorType === "beforField" && Object.entries(errors || {}).some(
      ([field, msg]) => msg && visibleFields[field]
      // ✅ FIXED
    ) && /* @__PURE__ */ React6.createElement("div", { className: "fv-error-summary" }, /* @__PURE__ */ React6.createElement("ul", null, Object.entries(errors || {}).filter(([field, msg]) => msg && visibleFields[field]).map(([field, message]) => {
      var _a2;
      return /* @__PURE__ */ React6.createElement("li", { key: field }, /* @__PURE__ */ React6.createElement("strong", null, ((_a2 = visibleFields[field]) == null ? void 0 : _a2.label) || field, ":"), " ", message);
    }))), /* @__PURE__ */ React6.createElement("div", { className: "stepper-body" }, /* @__PURE__ */ React6.createElement("h2", { className: "stepper-title" }, schema.steps[step].title), /* @__PURE__ */ React6.createElement("div", { className: "stepper-fields" }, Object.keys(visibleFields).map(
      (name) => renderField(
        name,
        visibleFields[name],
        // ✅ FIXED
        values[name],
        handleChange,
        errors[name],
        errorType
      )
    ))), /* @__PURE__ */ React6.createElement("div", { className: "step-block-error" }, error), /* @__PURE__ */ React6.createElement("div", { className: "step-block-error" }, globalError), /* @__PURE__ */ React6.createElement("div", { className: "stepper-footer" }, step > 0 ? /* @__PURE__ */ React6.createElement("button", { className: "stepper-btn-back", onClick: prev }, (navigation == null ? void 0 : navigation.prevLabel) || "Previous") : /* @__PURE__ */ React6.createElement("div", null), step === schema.steps.length - 1 ? /* @__PURE__ */ React6.createElement("button", { className: "stepper-btn-submit", onClick: handleSubmit }, (navigation == null ? void 0 : navigation.submitLabel) || "Complete Registration") : /* @__PURE__ */ React6.createElement("button", { className: "stepper-btn-next", onClick: next }, (navigation == null ? void 0 : navigation.nextLabel) || "Continue"))));
  }
};
var StepForm_default = StepForm;
export {
  Form_default as Form,
  StepForm_default as StepForm
};
//# sourceMappingURL=index.mjs.map