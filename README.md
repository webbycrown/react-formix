# 📦 React Formix – Advanced Form and Step-Form Validation Library

A production-ready, flexible, and developer-friendly form and step-form validation library for React (and Next.js). It provides powerful validation rules, extensibility, and seamless integration into modern applications.

- ⚛️ React 16.8+ (Hooks) compatible & Next.js friendly
- 🔒 Built-in validation rules with extensibility
- 🎯 Lightweight, fast, and easy to integrate
- 🧑‍💻 Fully controlled with simple API

---

## 🎥 Demo Video

**Watch the React Formix in action on YouTube:**

<div align="center">

[![React Formix Demo](https://raw.githubusercontent.com/webbycrown/react-advanced-richtext-editor/main/assets/react-advanced-richtext-editor.png)](https://www.youtube.com/watch?v=ejRuLu6furw)

**▶️ [Watch on YouTube](https://www.youtube.com/watch?v=jP7pDK3vW5Y)**

</div>

## 📦 Installation

```bash
npm install @webbycrown/react-formix
```

or

```bash
yarn add @webbycrown/react-formix
```

---

## 🔧 API

### `Formix(options)`

| Option            | Type     | Description                 |
| ----------------- | -------- | --------------------------- |
| `initialValues`   | object   | Initial form state          |
| `validationRules` | object   | Validation rules per field  |
| `onSubmit`        | function | Callback when form is valid |

## ✨ Features

### Core Features

- Required validation
- Email validation
- Min / Max length
- Pattern validation
- Custom validation functions

### Advanced Features

- Real-time validation
- Field-level validation
- Form-level validation
- Async validation support

### 🎨 UI & Customization

- Custom HTML error messages (fully flexible UI)
- Error icon customization (use icons, image)
- Error image support for visual validation feedback
- Fully customizable error message styling
- Group Form Support (organize fields into sections/groups)
- Dependent Fields (show/hide fields based on other field values)
- Step Form with Customization (multi-step forms with full UI control)
- Dynamic Field Rendering (schema or API-based)
- Exam Form Mode (quiz & assessment forms)
- Conditional Validation
- API-based dropdowns and dynamic data fields
- Smart field behavior handling

### 🧩 Layout & Form Variants

- Multiple form layouts (default, custom UI support)
- Step Form (multi-step form support)
- Dynamic field rendering
- Flexible structure for complex forms

### ⚡ Developer Experience

- Lightweight and fast
- Easy integration
- Reusable validation rules
- Clean and scalable API
- Schema-driven architecture
- Works with static & dynamic data

---

## 🎨 Styling

```js
import "@webbycrown/react-formix/dist/index.css";
```

You can override styles with your own CSS.

---

### Registration Form

---

## 🔒 Security

- Prevents invalid form submission
- Supports custom validation logic
- Safe input handling

---

## 📚 Compatibility

| Framework | Supported |
| --------- | --------- |
| React     | 16.8+     |
| Next.js   | 10+       |

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## 📄 License

MIT License

---

## 💡 Tips

- Use reusable validation rules
- Combine with UI libraries (Tailwind, MUI, etc.)
- Extend with custom validators

---

## 🔖 Changelog

### 1.0.0

- Initial release ✨
- Core validation system
- Form and Step-form support

### 1.1.0

- Group Form support added
- Dependent field logic introduced
- Step form customization improved
- Exam form layout added
- Custom HTML error UI enhancements
- Dynamic API-based fields support

---

<div align="center">
<strong>Made with ❤️ by <a href="https://webbycrown.com">WebbyCrown</a></strong>
</div>
