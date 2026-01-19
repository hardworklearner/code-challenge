# Problem 2 – Fancy Currency Swap Form

## Problem Description

Implemented **Problem 2: Fancy Form**.

The task is to build a **currency swap form** that allows users to select two tokens, input an amount, and view exchange values based on live pricing data. The focus is on **frontend architecture, UX clarity, and visual quality**, not backend implementation.

---

## Requirements Recap

- Build a **currency swap form**
- Allow swapping from one token to another
- Use live token prices from:
  https://interview.switcheo.com/prices.json
- Tokens without prices may be omitted
- Add input validation and user feedback
- UI should be intuitive and visually appealing
- Any frontend framework/library may be used
- ✨ **Bonus: use Vite**

---

## Tech Stack

- **React + TypeScript**
- **Vite** (development server & build tool)
- CSS (modern flex/grid layout)
- Fetch API for price data
- Token icons from:
  https://github.com/Switcheo/token-icons

---

## Why Vite?

Vite is used as the build tool for this project because it provides:

- ⚡ **Instant dev server startup**
- 🔥 **Fast Hot Module Replacement (HMR)**
- 📦 Optimized production builds
- 🧠 First-class TypeScript support
- Minimal configuration overhead

Vite makes the development experience closer to modern production tooling while keeping the project lightweight.

---

## Features Implemented

### 1. Token Selection

- Dropdown selector with:
- Token icon
- Token symbol
- Default behavior:
- **From token**: first available token
- **To token**: `USD pricing` by default

### 2. Live Pricing

- Token prices fetched on load
- Exchange rate recalculated **in real time** when:
- Input amount changes
- From token changes
- To token changes
- Pricing label updates dynamically:
- Example: `ETH pricing → USD pricing`

### 3. Input Validation

- Prevent negative or empty values
- Disable submit button on invalid input
- Graceful fallback if price data is missing

### 4. UX / UI

- Clean layout inspired by modern DeFi swap interfaces
- Clear separation between:
- From token
- To token
- Pricing info
- Instant visual feedback on selection changes
- Responsive layout

### 5. Mocked Interaction

- Submit button simulates backend interaction
- Optional loading state to mimic real swap execution

---

## How to Run (Vite)

### Install dependencies

```bash
npm install
```

## Start development server

```bash
npm run dev
```

Vite will start the dev server (default):

```sh
http://localhost:5173

##
```

## Production Build

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```

## Notes

- No backend required – pricing data is fetched directly

- Vite used to demonstrate modern frontend tooling

- UI prioritizes clarity over feature density

- Token prices are treated as read-only

- Swap execution is mocked to keep scope focused

- React state kept minimal and predictable
