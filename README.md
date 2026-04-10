# React Smart Form Demo

A comprehensive demonstration project for [@webbycrown/react-smart-form](https://www.npmjs.com/package/@webbycrown/react-advanced-richtext-editor) built with Next.js.

## Features Demonstrated

This demo showcases multiple use cases and features of the field-validation package:

1. **Basic Form with State Management** – Handle form submission, loading state, and API error handling using the Form component

2. **Schema-Based Form Rendering** – Dynamically generate form fields using a centralized schema configuration

3. **Step Form (Multi-Step Workflow)** – Multi-step form with step-wise validation and smooth navigation using StepForm

4. **API Integration Handling** – Demonstrates async submission with loading indicators and error display support

5. **Validation System** – Built-in validation rules like required fields, email validation, and custom rules

6. **Layout Customization** – Ability to switch between different layouts (e.g., layoutThree) for better UI flexibility

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

The package is already installed. If you need to reinstall:

```bash
npm install @webbycrown/formix
```

### Running the Demo

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the demo.


### Key Props

### Form Props

- `schema` (object)  
  Defines form fields and validation rules.

- `onSubmit` (function)  
  Callback triggered on form submit. Receives form data.

- `loading` (boolean)  
  Shows loader UI when `true`.

- `apiError` (string | null)  
  Displays API error message after submission.

- `errorType` (string)  
  Controls how validation errors are displayed.  
  Supported values:
  - `"beforeField"` → Show error above field
  - `"afterField"` → Show error below field
  - `"top"` → Show all errors at top
  - `"popup"` → Show all errors in modal popup

- `type` (string)  
  Controls layout design.  
  Supported values:
  - `"layoutTwo"`
  - `"layoutThree"`  
    (default layout is applied if not provided)

### StepForm Props

- `schema` (object)  
  Defines multi-step structure with fields per step.

- `onSubmit` (function)  
  Called when final step is submitted.

- `loading` (boolean)  
  Shows loading state.

- `apiError` (string | null)  
  Displays API error.

- `errorType` (string)  
  Same as Form (`beforeField`, `afterField`, `top`, `popup`)

- `stepShow` (boolean)  
  Shows step indicator (progress UI) if `true`.

- `type` (string)  
  Layout type (e.g. `"layoutTwo"`, `"layoutThree"`)

### Field Configuration

Each field supports:

- `type` (string)  
  Field type:
  - `text`, `email`, `password`
  - `textarea`
  - `date`, `time`
  - `select`
  - `radio`
  - `checkbox`
  - `file`
  - `dropzone`

- `label` (string)  
  Field label

- `placeholder` (string)  
  Input placeholder

- `options` (array)  
  Required for `select`, `radio`, `checkbox`  
  Example:
  { label: "India", value: "india" }

- `multiSelect` (boolean)  
  Enables multi-select dropdown

- `accept` (string)  
  File types for file/dropzone input

- `errorIcon` (JSX)  
  Custom icon for error display

- `rules` (object)  
  Validation rules (see below)

### Validation Rules

- `required` (boolean)
- `requiredMessage` (string)

- `minLength` (number)
- `maxLength` (number)

- `email` (boolean)

- `pattern` (RegExp)
- `patternMessage` (string)

- `validate` (function)  
  Custom validation function

  Return values:
  - `true` → valid
  - `"string"` → error message
  - `JSX` → custom error UI

## Project Structure

```
src/
  app/
    layout.js      # Root layout with metadata
    page.js        # Main demo page with multiple examples
    globals.css    # Global styles
```

## Features

- ✅ Schema-based form validation
- ✅ Multi-step form support (StepForm)
- ✅ Multiple layouts (default, layoutTwo, layoutThree)
- ✅ Flexible error handling:
  - Field level (`beforeField`, `afterField`)
  - Global top error summary (`beforField`)
  - Popup modal errors (`popup`)
- ✅ Custom error UI support (JSX / HTML)
- ✅ Error icon support per field
- ✅ Step-wise validation (only current step errors)
- ✅ API integration with loading & error states
- ✅ Success screen with submitted data preview
- ✅ Multi-select dropdown support
- ✅ Image support in radio & checkbox fields
- ✅ File upload & drag-and-drop (dropzone) support
- ✅ Date & time input support
- ✅ Fully controlled form behavior
- ✅ Dynamic and reusable schema structure
- ✅ Easy global styling via CSS import

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
