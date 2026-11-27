# Campus Bites — University Canteen Pre-Ordering & Queue Management System

A practical, academic-grade web application designed to eliminate lunch-hour congestion in college canteens through pre-ordering, slot scheduling, and authentic **Data Structures & Algorithms (DSA)** operations.

Built with **Semantic HTML5, CSS3, and Vanilla JavaScript**, featuring a modern **SaaS Dashboard Aesthetic** inspired by analytical platforms like **SIF-X** and **GoldLens**.

---

## 1. Problem Statement & Real-World Solution

### The Challenge
University students experience extreme congestion at the canteen during peak lunch breaks (12:00 PM – 1:30 PM). Students typically spend 20–30 minutes waiting in manual queues just to place orders and wait for billing, leaving almost no time to eat before their next lecture. Canteen staff simultaneously face chaotic kitchen counters, misplaced tickets, and uneven demand spikes.

### The Solution
**Campus Bites** provides an integrated two-tier system:
1. **Student Pre-Ordering Portal**:
   - Browse categorized campus menus with real-time stock availability.
   - Pre-order meals in advance and reserve a specific pickup slot (e.g. 12:15 PM, 12:30 PM).
   - Receive a unique order ID and track preparation progress with a 5-stage visual tracker.
   - Know their exact position in line (`"You are #2 in the food preparation queue"`).
   - Fast counter pickup at **Counter 2** with zero waiting in line.

2. **Canteen Staff Command Center (CMS)**:
   - High-visibility KPI cards tracking active queue depth, orders on stoves, and ready orders.
   - **FIFO Kitchen Queue Board**: Displays the immediate next order to prepare using `OrderQueue.peek()`.
   - One-click order advancement: `In Queue` $\to$ `Preparing` $\to$ `Ready for Pickup` $\to$ `Collected`.
   - **Chronological Scheduled Pre-Orders**: Real-time sorting using custom **Insertion Sort** or **Merge Sort**.
   - **Pickup Slot Capacity Monitor**: Visual saturation bars preventing counter overcrowding.
   - **Menu Array Inventory Manager**: Staff can toggle stock availability, insert new dishes, update prices, or remove items.

---

## 2. Data Structures & Algorithms (DSA) Implementation

This project implements genuine, native JavaScript data structures with explicit time and space complexity analysis:

### A. Dynamic Arrays (`MenuArrayManager`)
The menu catalog and inventory are encapsulated within an Array structure:
- **Linear Search — $O(n)$ Time / $O(k)$ Space**:
  - Implemented in `MenuArrayManager.search(query)`: performs a multi-field linear scan across item `name`, `description`, and `category`.
- **Category Filter — $O(n)$ Time**:
  - `MenuArrayManager.filterByCategory(category)`: iterates through items to extract matching subset.
- **Insertion — $O(1)$ Amortized Time**:
  - `MenuArrayManager.insert(item)`: validates input integrity, performs an $O(n)$ uniqueness check for duplicate IDs, and pushes the new item into the array.
- **In-Place Update — $O(n)$ Lookup + $O(1)$ Mutation**:
  - `MenuArrayManager.update(id, updates)`: locates target index and updates fields in-place while keeping the primary key immutable.
- **Deletion — $O(n)$ Time**:
  - `MenuArrayManager.delete(id)`: performs linear search and executes `Array.splice()` with automatic index adjustment.
- **Stock Toggle — $O(n)$ Time**:
  - `MenuArrayManager.toggleAvailability(id)`: toggles `isAvailable` boolean between In Stock and Sold Out.

### B. FIFO Queue with Head/Tail Pointers (`OrderQueue`)
Active food preparation strictly follows First-In, First-Out (FIFO) mechanics to ensure fairness:
- **True $O(1)$ Enqueue & Dequeue**:
  - Standard JavaScript `Array.shift()` takes $O(n)$ due to re-indexing the entire array. `OrderQueue` is built with internal object storage and numeric pointers `_head` and `_tail`.
  - `enqueue(order)`: assigns `items[tail++] = order` in $O(1)$ time.
  - `dequeue()`: retrieves `items[head++]` and cleans up memory in $O(1)$ time. When empty, head and tail pointers automatically reset to `0`.
- **Safe Underflow Defense**:
  - Both `dequeue()` and `peek()` return `null` safely without runtime exceptions when `isEmpty() === true`.
- **Next Order Inspection (`peek()`)**:
  - Inspects the order at the head of the line in $O(1)$ without dequeuing, displaying it in the staff's "Next in Line" hero banner.
- **Student Position Tracking (`findPosition(orderId)`)**:
  - Scans from `_head` to `_tail` in $O(n)$ time to report the 1-based queue rank (e.g. Position #1, #2).

### C. Chronological Sorting Algorithms (`OrderSorter`)
Scheduled orders must be processed chronologically based on when students arrive to collect food:
- **Time String Normalization**:
  - `OrderSorter.parseTimeToMinutes(timeStr)` converts 12-hour AM/PM strings (e.g. `"12:15 PM"`, `"1:30 PM"`) into absolute minutes from midnight (0 to 1439).
- **Custom Insertion Sort ($O(n)$ Best / $O(n^2)$ Worst / $O(1)$ Space)**:
  - `OrderSorter.insertionSortByPickupTime(orders)`: in-place, adaptive, and stable. Especially efficient for pre-orders because incoming scheduled orders arrive in near-chronological order, achieving optimal $O(n)$ performance in practice.
- **Custom Merge Sort ($O(n \log n)$ Guaranteed / $O(n)$ Space)**:
  - `OrderSorter.mergeSortByPickupTime(orders)`: divide-and-conquer recursive algorithm ensuring predictable logarithmic time regardless of initial array ordering.
- **Live Algorithm Switcher**:
  - The staff dashboard features a live toggle between Insertion Sort and Merge Sort, with real-time microsecond ($\mu s$) execution benchmarks.

---

## 3. UI/UX & SaaS Architecture

Designed following the visual hierarchy of **SIF-X** and **GoldLens**:
* **Graphite Dark Sidebar (`#0B1329`)**:
  - Persistent branding with animated food steam icon.
  - Quick-switch toggle between **Student Portal** and **Staff CMS**.
  - Sectioned navigation links with active orange accent indicators and notification pill counts.
  - Dynamic profile footer: `Riya Sharma (CSE 2nd Yr)` vs `Chef Anand (Kitchen Lead)`.
* **Light Neutral Workspace (`#F8FAFC` / `#FFFFFF`)**:
  - High-contrast charcoal typography (`#0F172A`) paired with culinary orange accents (`#F97316`).
  - Subtle borders (`#E2E8F0`), soft multi-layer box shadows, and rounded card geometry.
  - JetBrains Mono typography for order IDs, prices, times, and queue metrics.
* **Student Workspace**:
  - KPI stats row: Queue Depth, Average Wait, 20% Subsidy, Pickup Counter.
  - Hero Special Banner: *Hyderabadi Dum Biryani* (₹120) with live quick-add.
  - Food card grid with dietary badges (`● Pure Veg` / `▲ Non-Veg`) and prep times.
  - Sticky Pre-Order Cart with item steppers, slot selector, and 20% student discount.
  - 5-stage animated order tracking pipeline: `Placed` $\to$ `In Queue` $\to$ `Preparing` $\to$ `Ready` $\to$ `Collected`.
* **Canteen Staff Command Center**:
  - Kitchen KPI cards for active queue, cooking orders, ready orders, and daily total.
  - Next-in-line focus box and sequential FIFO token pipeline.
  - Scheduled orders chronological table with live algorithm benchmarking.
  - Pickup slot capacity monitor with saturation color indicators.
  - Menu inventory CRUD table with 1-click stock toggles and insertion modal.

---

## 4. State Persistence & Multi-Tab Synchronization

* **LocalStorage Architecture**:
  - All state (menu catalog, active orders, and student tracking ID) persists across page reloads via `localStorage`.
* **Real-Time Cross-Tab Synchronization**:
  - Listens to `window.addEventListener('storage', ...)`.
  - When a student places an order in Tab 1, it immediately appears in the Staff Command Center in Tab 2 without refreshing!
* **Academic Prototype Boundary**:
  - `localStorage` is restricted to the browser origin and device. It is ideal for local evaluation, presentation, and grading, but does not replace a multi-tenant distributed cloud database.

---

## 5. Automated Verification Test Suite

The project includes an in-browser and Node.js-compatible unit test harness (`test-suite.js`) covering **35 test assertions**:
1. Queue empty initialization & size calculation.
2. FIFO insertion (`enqueue`) and removal (`dequeue`) ordering.
3. Queue `peek()` without element removal.
4. Empty queue underflow defense and pointer resets.
5. Student position tracking (`findPosition`) across queue advancements.
6. Menu Array insert (`push`) and duplicate ID rejection.
7. In-place property updates and stock availability toggles.
8. Array deletion (`splice`) and index verification.
9. Multi-field linear search across keywords and descriptions.
10. Category filtering subsets.
11. 12-hour AM/PM timestamp parsing into minutes.
12. Insertion Sort chronological ordering verification.
13. Merge Sort chronological ordering verification.
14. Sorting immutability check (original source array preservation).
15. 50-sample consecutive Order ID uniqueness and collision prevention.

**Result: 35/35 Passed (100% Score).**

---

## 6. How to Run Locally

### Option A: Using the Launch Script (Windows)
Double-click `launch.bat` in the project directory:
```cmd
c:\Users\rahul\campus-bites\launch.bat
```
This automatically launches the local server on `http://localhost:8088` and opens it in your default web browser.

### Option B: Using Python
Open PowerShell or Terminal in the project directory:
```bash
cd c:\Users\rahul\campus-bites
python serve.py
```
Navigate to:
```
http://localhost:8088/index.html
```

### Running the DSA Test Suite
- **In Browser**: Click the **"Run DSA Tests"** button in the top navigation bar or navigate to **DSA Architecture** in the sidebar.
- **In Headless Node.js**:
```bash
node -e "const DSATestSuite = require('./test-suite.js'); const suite = new DSATestSuite(); suite.runAllTests();"
```

---

## 7. Campus Bites Simulation Lab

The **Simulation Lab** is an interactive educational dashboard accessible from both the Student Portal and Staff CMS navigation sidebar. It provides interactive, visual demonstrations of how DSA operations run in real time:

* **Master Simulation Control Panel**:
  - Full execution control: *Start Simulation*, *Pause*, *Next Step*, *Reset*, and *Speed Multiplier (0.5x, 1x, 2x)*.
  - Live HUD tracking: Current Step, Simulated Clock Window, Total Orders Processed, Queue Waiting Count, Currently Cooking Order, and Completed Orders.
  - Active Educational Explanation Callout with dynamic Big-O Complexity tags.
* **Module A — Dynamic Array Visualizer**:
  - Displays menu items as indexed memory cells (`Index [0]`, `Index [1]`...).
  - Interactive Linear Search ($O(n)$) highlighting step-by-step element comparisons.
  - In-place price and stock updates, insertion ($O(1)$ amortized push), and deletion ($O(n)$ shift).
* **Module B — FIFO Queue with Head/Tail Pointers**:
  - High-impact visual pipeline: `FRONT (HEAD) ➔ [Tokens] ➔ REAR (TAIL)`.
  - Enqueue ($O(1)$), Peek ($O(1)$), Dequeue ($O(1)$), and empty queue safety.
  - Live pointer indicators displaying `_head`, `_tail`, `size()`, and front/rear orders.
* **Module C — Chronological Sorting Visualizer**:
  - Step-by-step execution of **Insertion Sort** ($O(n^2)$ / $O(n)$ best) and **Merge Sort** ($O(n \log n)$) on scheduled pre-orders with mixed pickup times.
* **Module D — Complete Campus Lunch Rush Scenario**:
  - Guided 8-stage story featuring 5 students placing orders for staggered pickup windows (12:15 PM, 12:30 PM, 12:45 PM, 01:00 PM).
  - Demonstrates that future scheduled orders never block immediate orders. Orders enter the active FIFO queue strictly when their preparation window arrives.
* **State Isolation Guarantee**:
  - The Simulation Lab runs on isolated simulation data instances, ensuring demo actions never alter or delete actual student orders in `localStorage`.

---
## 9. Project File Structure

```
campus-bites/
├── index.html        # Unified single-entry SaaS dashboard (Student + Staff views)
├── style.css         # SaaS design system (graphite sidebar, warm orange accents, responsive)
├── dsa.js            # Core DSA algorithms (OrderQueue, MenuArrayManager, OrderSorter)
├── simulation-lab.js # Interactive Simulation Lab engine (Modules A, B, C, D)
├── app.js            # Application controller, localStorage sync, cart & state transitions
├── test-suite.js     # 35-assertion automated unit test harness with interactive UI output
├── serve.py          # Python development server with cache-busting headers
├── launch.bat        # 1-click Windows startup batch script
└── README.md         # Comprehensive academic project documentation
```
