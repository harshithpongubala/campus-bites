# Campus Bites

> **Skip the Line. Savor the Break.**  
> *University Canteen Pre-Ordering, Slot Scheduling & Queue Management System*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-campus--bites--delta.vercel.app-F97316?style=for-the-badge&logo=vercel&logoColor=white)](https://campus-bites-delta.vercel.app/)
[![Technology](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-blue?style=for-the-badge)](https://campus-bites-delta.vercel.app/)
[![Data Structures](https://img.shields.io/badge/DSA-Arrays%20%7C%20FIFO%20Queue%20%7C%20Sorting-3B82F6?style=for-the-badge)](https://campus-bites-delta.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/harshithpongubala/campus-bites)

🔗 **Live Application Demo:** [https://campus-bites-delta.vercel.app/](https://campus-bites-delta.vercel.app/)

---

## 📌 Overview

**Campus Bites** is a modern university canteen pre-ordering and queue management web platform engineered to eliminate rush-hour cafeteria congestion, streamline kitchen workflows, and ensure fair, transparent meal distribution.

Built as a pure **Web Technology** application leveraging **HTML5, CSS3, and Vanilla JavaScript**, Campus Bites connects students with canteen operations through an integrated, dual-tier architecture: an intuitive **Student Pre-Ordering & Live Tracking Portal** paired with a real-time **Kitchen Command Center (CMS)**. Under the hood, the platform is driven by genuine, native implementations of fundamental **Data Structures & Algorithms (DSA)**—including dynamic array managers, a true $O(1)$ FIFO queue with head/tail pointers, and adaptive chronological sorting algorithms.

---

## 🎯 The Problem & Real-World Solution

### The Campus Bottleneck
During peak university lunch breaks (12:00 PM – 1:30 PM), hundreds of students converge on the dining hall simultaneously:
- **Lengthy Wait Times**: Students spend 20–30 minutes waiting in manual queues just to place an order and receive a token, leaving negligible time to eat before classes resume.
- **Kitchen Chaos**: Staff are overwhelmed by erratic bursts of paper tickets, leading to misplaced orders, uneven prep loads, and counter bottlenecks.
- **Lack of Transparency**: Students have no visibility into how many orders precede theirs or when their food will actually be ready.

### How Campus Bites Solves It
1. **Student Pre-Ordering & Dedicated Slot Allocation**:
   - Browse digital menus with real-time stock availability and dietary tags.
   - Pre-order meals in advance and reserve designated pickup windows (e.g., 12:15 PM, 12:30 PM).
   - Track preparation progress through a 5-stage visual milestone pipeline with live queue rank updates (`"You are #2 in line"`).
   - Collect orders swiftly at dedicated express counters with zero counter congestion.

2. **Canteen Staff Command Center (CMS)**:
   - High-visibility KPI metrics tracking queue depth, active stove orders, ready orders, and daily throughput.
   - **FIFO Preparation Pipeline**: Guarantees fairness by serving the earliest incoming orders first using constant-time queue lookups (`peek()`).
   - **Pickup Slot Capacity Management**: Prevents counter surges by balancing order volume across staggered pickup time slots.
   - **Dynamic Menu Inventory Management**: Live item insertion, price editing, and instant stock toggle controls.

---

## 🚀 Key Features

1. **Lightweight & High-Performance Pure Web Stack**:
   - Semantic **HTML5** structure.
   - Refined graphite obsidian theme with warm culinary accents (`#F97316`), responsive grid layouts, and clean typographic hierarchy.
   - Zero heavyweight framework dependencies—built entirely with standard **Vanilla JavaScript** (no React, Vue, or bulky runtimes).

2. **Real-Time Cross-Tab State Synchronization**:
   - Persistent client-side state management powered by `localStorage`.
   - Native `window.addEventListener('storage', ...)` event propagation: placing an order in the Student view instantly reflects across the Kitchen Command Center in separate tabs without requiring a page refresh.

3. **True $O(1)$ FIFO Queue Operations**:
   - Custom pointer-based queue implementation avoiding JavaScript's native $O(n)$ `Array.shift()` performance overhead.
   - Safe underflow handling, peek inspection, and dynamic rank resolution.

4. **Interactive Simulation Lab**:
   - Built-in educational sandbox featuring real-time visualizers for Dynamic Arrays, FIFO Queue pointers, Chronological Sorting, and simulated rush-hour lunch flows.
   - Step-by-step playback controls (Play, Pause, Step, Speed Multipliers) operating on isolated sandbox data.

5. **Automated DSA Verification Harness**:
   - Built-in 35-assertion test suite validating array operations, queue invariants, boundary conditions, and sorting stability both in-browser and headless via Node.js.

---

## ⚡ Data Structures & Algorithms (DSA) Architecture

Campus Bites implements custom algorithmic structures designed for computational efficiency and real-world applicability:

### 1. Dynamic Arrays (`MenuArrayManager`)
The menu catalog and inventory are encapsulated within an Array structure supporting standard CRUD operations:
- **Linear Search — $O(n)$ Time / $O(k)$ Space**: Multi-field text scan across item name, description, and category.
- **Category Filtering — $O(n)$ Time**: Extracts filtered dietary subsets (`Meals`, `Snacks`, `Beverages`).
- **Insertion — $O(1)$ Amortized Time**: Validates inputs, checks ID uniqueness, and appends items to the catalog.
- **In-Place Update — $O(n)$ Lookup + $O(1)$ Mutation**: In-place attribute updates preserving immutable item keys.
- **Deletion — $O(n)$ Time**: Linear search and element splicing with automatic index preservation.
- **Stock Availability Toggle — $O(n)$ Time**: Instantaneous boolean state toggling between Available and Sold Out.

### 2. Pointer-Based FIFO Queue (`OrderQueue`)
To guarantee fairness, kitchen order processing adheres strictly to First-In, First-Out (FIFO) mechanics:
- **Why Custom Pointers?**: Standard JavaScript `Array.shift()` takes $O(n)$ time because every remaining element in memory must be re-indexed. `OrderQueue` uses an internal object map paired with numeric `_head` and `_tail` pointers.
- **Constant Time Enqueue & Dequeue — $O(1)$**:
  - `enqueue(order)`: Writes `items[tail++] = order` in $O(1)$.
  - `dequeue()`: Reads `items[head++]`, dereferences memory, and automatically resets pointers to `0` when empty.
- **Constant Time Next-in-Line Inspection — $O(1)$**:
  - `peek()`: Returns the head element for kitchen display without altering queue state.
- **Safe Underflow Defense**: Safe handling of empty states without runtime exceptions.
- **Live Queue Position Tracking — $O(n)$**: Computes relative rank of any order from head to tail.

### 3. Chronological Sorting Engine (`OrderSorter`)
Pre-orders must be scheduled and fulfilled according to pickup time windows:
- **Timestamp Normalization**: Converts 12-hour AM/PM timestamps into absolute minutes from midnight (0–1439).
- **Custom Insertion Sort ($O(n)$ Best / $O(n^2)$ Worst / $O(1)$ Space)**:
  - Adaptive, in-place, and stable. Highly optimal for incoming scheduled orders that arrive in near-chronological order.
- **Custom Merge Sort ($O(n \log n)$ Guaranteed / $O(n)$ Space)**:
  - Divide-and-conquer recursive sorting guaranteeing predictable logarithmic time complexity regardless of initial ordering.
- **Real-Time Algorithmic Benchmarking**: The Staff CMS provides live switching between both algorithms with microsecond ($\mu s$) execution timing.

---

## 🧪 Simulation Lab

The integrated **Simulation Lab** provides an interactive visual demonstration of data structure mechanics in action:
- **Module A (Dynamic Array)**: Step-by-step element search, insertion, and deletion visualizer.
- **Module B (FIFO Queue)**: Visual representation of front (head) and rear (tail) pointers advancing during order transitions.
- **Module C (Sorting Engine)**: Comparative step-by-step animation of Insertion Sort vs. Merge Sort on staggered pre-orders.
- **Module D (Campus Rush Hour Scenario)**: Staggered simulation showing how scheduled pre-orders enter the active preparation queue strictly when their prep window arrives, preventing future orders from blocking immediate ones.

---

## 📁 Repository Structure

```
campus-bites/
├── index.html        # Unified single-page application (Student & Staff portals)
├── style.css         # Modern design system (graphite sidebar, warm culinary accents)
├── app.js            # Core application state, cart workflows, and multi-tab synchronization
├── dsa.js            # Native DSA data structures (OrderQueue, MenuArrayManager, OrderSorter)
├── simulation-lab.js # Interactive simulation engine & step-by-step visualizer
├── test-suite.js     # 35-assertion automated unit test harness
├── serve.py          # Lightweight Python HTTP server with live cache-busting headers
├── launch.bat        # Convenient Windows 1-click launcher
└── README.md         # Project documentation
```

---

## 🛠️ Getting Started

### Prerequisites
- Python 3.8+ (for running the local development server) **OR** any standard web server
- Any modern web browser (Chrome, Edge, Firefox, Safari)
- *(Optional)* Node.js (for headless execution of the test suite)

---

### 🌐 Live Online Demo (No Installation Required)

Experience the live application hosted directly on Vercel:  
👉 **[https://campus-bites-delta.vercel.app/](https://campus-bites-delta.vercel.app/)**

---

### Method 1: Local Python Development Server (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/harshithpongubala/campus-bites.git
   cd campus-bites
   ```

2. **Launch the development server:**
   ```bash
   python serve.py
   ```
   *This automatically opens `http://localhost:8088/index.html` in your default browser with cache-busting headers enabled.*

---

### Method 2: Standalone Static HTTP Server

Run directly with Python's built-in HTTP server:
```bash
python -m http.server 8088
```
Then navigate to `http://localhost:8088/index.html`.

*(On Windows, you can also simply double-click `launch.bat` in the project root).*

---

### Method 3: Running the Automated Test Suite

- **In the Browser**: Click the **"Run DSA Tests"** button in the top navigation bar or access the test section from the sidebar.
- **Headless via Node.js**:
  ```bash
  node -e "const DSATestSuite = require('./test-suite.js'); const suite = new DSATestSuite(); suite.runAllTests();"
  ```
  *Executes all 35 test assertions covering queue mechanics, array operations, time conversions, and sorting stability.*

---

## ⚖️ License

Distributed under the MIT License. Open source and available for educational, institutional, and developer use.
