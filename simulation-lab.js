/**
 * ============================================================================
 * CAMPUS BITES — INTERACTIVE SIMULATION LAB ENGINE
 * ============================================================================
 * Educational visualization dashboard demonstrating native DSA operations:
 * - Module A: Dynamic Array Operations (Menu Inventory)
 * - Module B: FIFO Queue with Head/Tail Pointers (Kitchen Line)
 * - Module C: Chronological Sorting Visualizer (Insertion & Merge Sort)
 * - Module D: End-to-End Campus Lunch Rush Scenario
 * 
 * Safety Guarantee:
 * Uses isolated simulation memory instances so that demo actions NEVER
 * corrupt real student orders or menu catalog data in LocalStorage.
 * ============================================================================
 */

'use strict';

class SimulationLabEngine {
    constructor() {
        // --- Isolated State for Module A (Array) ---
        this.simMenuManager = null;
        this.selectedArrayAction = 'search';

        // --- Isolated State for Module B (FIFO Queue) ---
        this.simQueue = null;
        this.simQueueSampleCounter = 1;

        // --- Isolated State for Module C (Sorting) ---
        this.initialSortOrders = [
            { id: 'CB-S1', student: 'Riya S.', pickupTime: '01:30 PM', item: 'Biryani' },
            { id: 'CB-S2', student: 'Aarav M.', pickupTime: '12:00 PM', item: 'Masala Dosa' },
            { id: 'CB-S3', student: 'Sneha P.', pickupTime: '01:00 PM', item: 'Veg Burger' },
            { id: 'CB-S4', student: 'Karthik R.', pickupTime: '12:15 PM', item: 'Paneer Roll' },
            { id: 'CB-S5', student: 'Ananya D.', pickupTime: '12:45 PM', item: 'Chole Bhature' }
        ];
        this.currentSortOrders = [...this.initialSortOrders];
        this.activeSortAlgo = 'insertion';
        this.sortStepIndex = 0;
        this.sortStepHistory = [];

        // --- Isolated State for Module D (Complete Lunch Rush) ---
        this.rushStepIndex = 0;
        this.isRushRunning = false;
        this.rushInterval = null;
        this.rushSpeed = 1500; // milliseconds per step
        this.rushOrders = [];
        this.rushQueue = null;
        this.rushPreparing = null;
        this.rushCompleted = [];
        this.simulatedTime = '11:45 AM';

        this.init();
    }

    init() {
        // 1. Initialize Module A Array with baseline items
        const baseArray = [
            { id: 'M-0', name: 'Dum Biryani', category: 'lunch', price: 120, prepTimeMins: 20, isAvailable: true, isVeg: true },
            { id: 'M-1', name: 'Paneer Roll', category: 'snacks', price: 60, prepTimeMins: 10, isAvailable: true, isVeg: true },
            { id: 'M-2', name: 'Masala Dosa', category: 'breakfast', price: 45, prepTimeMins: 12, isAvailable: true, isVeg: true },
            { id: 'M-3', name: 'Veg Burger', category: 'snacks', price: 70, prepTimeMins: 8, isAvailable: true, isVeg: true },
            { id: 'M-4', name: 'Chole Bhature', category: 'lunch', price: 80, prepTimeMins: 15, isAvailable: true, isVeg: true }
        ];
        this.simMenuManager = new MenuArrayManager(baseArray);

        // 2. Initialize Module B Queue with initial 3 orders
        this.simQueue = new OrderQueue();
        this.simQueue.enqueue({ id: 'SIM-101', student: 'Riya S.', item: 'Dum Biryani x1', pickupTime: '12:15 PM' });
        this.simQueue.enqueue({ id: 'SIM-102', student: 'Aarav M.', item: 'Paneer Roll x2', pickupTime: '12:30 PM' });
        this.simQueue.enqueue({ id: 'SIM-103', student: 'Sneha P.', item: 'Cold Coffee x1', pickupTime: '12:30 PM' });
        this.simQueueSampleCounter = 104;

        // 3. Pre-generate sorting steps for Module C
        this.generateSortSteps();

        // 4. Setup Module D initial data
        this.setupLunchRushScenario();
    }

    // ========================================================================
    // EDUCATIONAL EXPLANATION BANNER DISPATCHER
    // ========================================================================
    updateExplanation(operationTitle, explanationText, complexityBadge = 'O(1)') {
        const titleEl = document.getElementById('simExplanationTitle');
        const descEl = document.getElementById('simExplanationDesc');
        const badgeEl = document.getElementById('simExplanationComplexity');
        const cardEl = document.getElementById('simExplanationCard');

        if (titleEl) titleEl.innerText = operationTitle;
        if (descEl) descEl.innerText = explanationText;
        if (badgeEl) badgeEl.innerText = complexityBadge;

        if (cardEl) {
            cardEl.classList.remove('pulse-highlight');
            void cardEl.offsetWidth; // trigger DOM reflow for CSS animation
            cardEl.classList.add('pulse-highlight');
        }
    }

    // ========================================================================
    // MODULE A: DYNAMIC ARRAY VISUALIZER
    // ========================================================================
    renderArrayVisualizer(highlightIndex = -1, highlightType = 'info') {
        const track = document.getElementById('simArrayTrack');
        const countDisplay = document.getElementById('simArrayCount');
        if (!track) return;

        const items = this.simMenuManager.getAll();
        if (countDisplay) countDisplay.innerText = `${items.length} Elements in Array`;

        if (items.length === 0) {
            track.innerHTML = `
                <div style="padding: 2rem; color: #94a3b8; font-family:'JetBrains Mono', monospace; text-align:center;">
                    [ Array is empty: length = 0 ]
                </div>
            `;
            return;
        }

        track.innerHTML = items.map((item, idx) => {
            const isTarget = idx === highlightIndex;
            const borderStyle = isTarget 
                ? (highlightType === 'match' ? 'border: 2px solid #10b981; background: #ecfdf5;' : 
                   highlightType === 'search' ? 'border: 2px solid #0284c7; background: #f0f9ff;' : 
                   highlightType === 'delete' ? 'border: 2px solid #ef4444; background: #fef2f2;' :
                   'border: 2px solid #f59e0b; background: #fffbeb;')
                : 'border: 1px solid #cbd5e1; background: #ffffff;';

            return `
                <div class="sim-array-cell" style="${borderStyle}">
                    <div class="sim-cell-index">Index [${idx}]</div>
                    <div class="sim-cell-name">${item.name}</div>
                    <div class="sim-cell-meta font-mono">₹${item.price} • ${item.category}</div>
                    <div style="margin-top:4px;">
                        <span class="badge ${item.isAvailable ? 'badge-veg' : 'badge-nonveg'}" style="font-size:0.65rem; padding:1px 6px;">
                            ${item.isAvailable ? 'In Stock' : 'Sold Out'}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Array: Linear Search O(n)
    async executeArraySearch(keyword) {
        if (!keyword || !keyword.trim()) {
            this.updateExplanation('Array Linear Search', 'Please enter a search keyword (e.g., "Biryani", "Roll", "Dosa").', 'O(n)');
            return;
        }

        const items = this.simMenuManager.getAll();
        const normalized = keyword.trim().toLowerCase();
        let matchIndex = -1;

        this.updateExplanation(
            'Starting Linear Search O(n)',
            `Scanning memory array from Index [0] to Index [${items.length - 1}] sequentially for "${keyword}"...`,
            'O(n) Time'
        );

        // Step through each index visually
        for (let i = 0; i < items.length; i++) {
            this.renderArrayVisualizer(i, 'search');
            await this.sleep(400);

            const item = items[i];
            if (item.name.toLowerCase().includes(normalized) || item.category.toLowerCase().includes(normalized)) {
                matchIndex = i;
                break;
            }
        }

        if (matchIndex !== -1) {
            this.renderArrayVisualizer(matchIndex, 'match');
            this.updateExplanation(
                'Search Match Found!',
                `Element found at Index [${matchIndex}]: "${items[matchIndex].name}" (₹${items[matchIndex].price}). Required ${matchIndex + 1} comparison(s).`,
                'O(n) Linear Scan'
            );
        } else {
            this.renderArrayVisualizer(-1);
            this.updateExplanation(
                'Item Not Found in Array',
                `Scanned all ${items.length} elements. "${keyword}" does not exist in the current menu array.`,
                'O(n) Worst Case'
            );
        }
    }

    // Array: Insertion (Push) O(1) amortized
    executeArrayInsert(name, price, category = 'lunch') {
        if (!name || !name.trim()) {
            this.updateExplanation('Array Insertion Error', 'Please specify a food item name to insert.', 'O(1)');
            return;
        }

        const newId = `M-${Date.now().toString().slice(-4)}`;
        const newItem = {
            id: newId,
            name: name.trim(),
            category: category,
            price: Number(price) || 50,
            prepTimeMins: 10,
            isAvailable: true,
            isVeg: true
        };

        this.simMenuManager.insert(newItem);
        const newIndex = this.simMenuManager.count() - 1;

        this.renderArrayVisualizer(newIndex, 'match');
        this.updateExplanation(
            'Array.push() Insertion Completed',
            `Inserted "${newItem.name}" at new tail Index [${newIndex}]. Native arrays allocate contiguous memory, achieving amortized constant time.`,
            'O(1) Amortized'
        );
    }

    // Array: In-Place Update O(n) search + O(1) update
    executeArrayUpdate(index, newPrice) {
        const items = this.simMenuManager.getAll();
        if (index < 0 || index >= items.length) {
            this.updateExplanation('Array Update Error', `Index [${index}] is out of bounds (0 to ${items.length - 1}).`, 'O(n)');
            return;
        }

        const target = items[index];
        this.simMenuManager.update(target.id, { price: Number(newPrice) || target.price });

        this.renderArrayVisualizer(index, 'update');
        this.updateExplanation(
            'Array In-Place Mutation',
            `Updated price of Index [${index}] ("${target.name}") to ₹${newPrice}. Found via linear lookup and mutated in-place.`,
            'O(n) Search + O(1) Mutation'
        );
    }

    // Array: Toggle Stock Availability
    executeArrayToggleStock(index) {
        const items = this.simMenuManager.getAll();
        if (index < 0 || index >= items.length) return;

        const target = items[index];
        const newState = this.simMenuManager.toggleAvailability(target.id);

        this.renderArrayVisualizer(index, 'update');
        this.updateExplanation(
            'Array Element State Toggle',
            `Index [${index}] ("${target.name}") availability toggled to ${newState ? 'IN STOCK' : 'SOLD OUT'}.`,
            'O(n) Lookup'
        );
    }

    // Array: Deletion (Splice) O(n)
    async executeArrayDelete(index) {
        const items = this.simMenuManager.getAll();
        if (index < 0 || index >= items.length) {
            this.updateExplanation('Array Delete Error', `Index [${index}] is out of bounds.`, 'O(n)');
            return;
        }

        const target = items[index];
        this.renderArrayVisualizer(index, 'delete');
        this.updateExplanation(
            'Array Element Deletion',
            `Deleting Index [${index}] ("${target.name}"). Elements to the right will shift left by 1 position (O(n) memory copy).`,
            'O(n) Shift'
        );

        await this.sleep(400);
        this.simMenuManager.delete(target.id);
        this.renderArrayVisualizer();
    }

    // ========================================================================
    // MODULE B: FIFO QUEUE WITH HEAD/TAIL POINTERS
    // ========================================================================
    renderQueueVisualizer(highlightTokenId = null, highlightClass = '') {
        const track = document.getElementById('simQueueTrack');
        const headVal = document.getElementById('simQueueHeadVal');
        const tailVal = document.getElementById('simQueueTailVal');
        const sizeVal = document.getElementById('simQueueSizeVal');
        const frontVal = document.getElementById('simQueueFrontVal');
        const rearVal = document.getElementById('simQueueRearVal');

        const queueArray = this.simQueue.toArray();
        const headPtr = this.simQueue._head;
        const tailPtr = this.simQueue._tail;
        const size = this.simQueue.size();

        if (headVal) headVal.innerText = headPtr;
        if (tailVal) tailVal.innerText = tailPtr;
        if (sizeVal) sizeVal.innerText = size;

        const frontItem = this.simQueue.peek();
        if (frontVal) frontVal.innerText = frontItem ? `${frontItem.id} (${frontItem.student})` : 'None (Empty)';

        const rearItem = size > 0 ? this.simQueue._items[tailPtr - 1] : null;
        if (rearVal) rearVal.innerText = rearItem ? `${rearItem.id} (${rearItem.student})` : 'None (Empty)';

        if (!track) return;

        if (size === 0) {
            track.innerHTML = `
                <div style="padding: 2.5rem; text-align:center; color:#94a3b8; font-family:'JetBrains Mono', monospace; width:100%;">
                    [ FIFO Queue is Empty: _head = ${headPtr}, _tail = ${tailPtr}, size() = 0 ]
                </div>
            `;
            return;
        }

        track.innerHTML = queueArray.map((order, idx) => {
            const isHead = idx === 0;
            const isTail = idx === queueArray.length - 1;
            const isHighlighted = order.id === highlightTokenId;

            let borderStyle = 'border: 1px solid #cbd5e1; background: #ffffff;';
            if (isHighlighted) {
                borderStyle = highlightClass === 'peek' 
                    ? 'border: 2px solid #0284c7; background: #f0f9ff; transform: scale(1.05);' 
                    : highlightClass === 'dequeue' 
                    ? 'border: 2px solid #ef4444; background: #fef2f2;' 
                    : 'border: 2px solid #10b981; background: #ecfdf5;';
            }

            return `
                <div class="sim-queue-token ${isHead ? 'is-head-token' : ''}" style="${borderStyle}">
                    ${isHead ? '<div class="sim-pointer-badge badge-head">FRONT (HEAD)</div>' : ''}
                    ${isTail ? '<div class="sim-pointer-badge badge-tail">REAR (TAIL)</div>' : ''}
                    <div class="sim-token-id font-mono">${order.id}</div>
                    <div class="sim-token-student">${order.student}</div>
                    <div class="sim-token-item">${order.item}</div>
                    <div class="sim-token-slot font-mono" style="font-size:0.7rem; color:#ea580c; margin-top:4px;">Due: ${order.pickupTime}</div>
                </div>
            `;
        }).join('<div class="sim-queue-arrow">➔</div>');
    }

    // Queue: Enqueue O(1)
    executeQueueEnqueue(studentName = 'Vikram S.', item = 'Veg Burger x1', pickupTime = '12:45 PM') {
        const orderId = `SIM-${this.simQueueSampleCounter++}`;
        const newOrder = {
            id: orderId,
            student: studentName,
            item: item,
            pickupTime: pickupTime
        };

        const oldTail = this.simQueue._tail;
        this.simQueue.enqueue(newOrder);

        this.renderQueueVisualizer(orderId, 'enqueue');
        this.updateExplanation(
            'OrderQueue.enqueue() — Added to Rear',
            `Order ${orderId} (${studentName}) enqueued at tail pointer index [${oldTail}]. Pointer updated to _tail = ${this.simQueue._tail}. Queue size is now ${this.simQueue.size()}.`,
            'O(1) Constant Time'
        );
    }

    // Queue: Peek O(1)
    executeQueuePeek() {
        if (this.simQueue.isEmpty()) {
            this.updateExplanation(
                'OrderQueue.peek() on Empty Queue',
                'Queue is empty. peek() returns null safely without throwing runtime errors.',
                'O(1) Safe Guard'
            );
            return;
        }

        const front = this.simQueue.peek();
        this.renderQueueVisualizer(front.id, 'peek');
        this.updateExplanation(
            'OrderQueue.peek() — Inspected Front Element',
            `Front order ${front.id} (${front.student}) inspected at _head pointer [${this.simQueue._head}]. Order remains in queue without mutation.`,
            'O(1) Constant Time'
        );
    }

    // Queue: Dequeue O(1)
    executeQueueDequeue() {
        if (this.simQueue.isEmpty()) {
            this.updateExplanation(
                'OrderQueue.dequeue() on Empty Queue',
                'Queue underflow defended safely: dequeue() returns null. No orders to remove.',
                'O(1) Safe Guard'
            );
            return;
        }

        const oldHead = this.simQueue._head;
        const dequeued = this.simQueue.dequeue();

        this.renderQueueVisualizer();
        this.updateExplanation(
            'OrderQueue.dequeue() — Removed from Front',
            `Order ${dequeued.id} (${dequeued.student}) removed from front pointer [${oldHead}] for cooking. Head pointer advanced to [${this.simQueue._head}]. True O(1) without array re-indexing penalty!`,
            'O(1) Constant Time'
        );
    }

    // Queue: Clear
    executeQueueReset() {
        this.simQueue.clear();
        this.simQueue.enqueue({ id: 'SIM-101', student: 'Riya S.', item: 'Dum Biryani x1', pickupTime: '12:15 PM' });
        this.simQueue.enqueue({ id: 'SIM-102', student: 'Aarav M.', item: 'Paneer Roll x2', pickupTime: '12:30 PM' });
        this.simQueue.enqueue({ id: 'SIM-103', student: 'Sneha P.', item: 'Cold Coffee x1', pickupTime: '12:30 PM' });
        this.simQueueSampleCounter = 104;

        this.renderQueueVisualizer();
        this.updateExplanation(
            'Queue Reset to Baseline',
            'Queue reloaded with 3 demonstration orders: _head = 0, _tail = 3, size = 3.',
            'O(1)'
        );
    }

    // ========================================================================
    // MODULE C: SORTING ALGORITHM VISUALIZER
    // ========================================================================
    generateSortSteps() {
        this.sortStepHistory = [];
        const arr = [...this.initialSortOrders];

        if (this.activeSortAlgo === 'insertion') {
            // Precompute Insertion Sort steps
            this.sortStepHistory.push({
                arrayState: [...arr],
                comparedIndices: [],
                sortedIndices: [0],
                desc: 'Initial unsorted scheduled orders. Index [0] is trivially sorted.',
                complexity: 'O(1) Setup'
            });

            for (let i = 1; i < arr.length; i++) {
                const current = arr[i];
                const currentMin = OrderSorter.parseTimeToMinutes(current.pickupTime);
                let j = i - 1;

                this.sortStepHistory.push({
                    arrayState: [...arr],
                    comparedIndices: [i, j],
                    sortedIndices: Array.from({ length: i }, (_, k) => k),
                    desc: `Comparing Index [${i}] (${current.id}, ${current.pickupTime}) against Index [${j}] (${arr[j].id}, ${arr[j].pickupTime}).`,
                    complexity: 'Comparison O(1)'
                });

                while (j >= 0 && OrderSorter.parseTimeToMinutes(arr[j].pickupTime) > currentMin) {
                    arr[j + 1] = arr[j];
                    this.sortStepHistory.push({
                        arrayState: [...arr],
                        comparedIndices: [j, j + 1],
                        sortedIndices: [],
                        desc: `Shifted "${arr[j].id}" right to make room for earlier order "${current.id}".`,
                        complexity: 'Array Shift'
                    });
                    j--;
                }
                arr[j + 1] = current;

                this.sortStepHistory.push({
                    arrayState: [...arr],
                    comparedIndices: [j + 1],
                    sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
                    desc: `Inserted "${current.id}" into its sorted position at Index [${j + 1}].`,
                    complexity: 'O(n) Worst / O(1) Best'
                });
            }
        } else {
            // Merge Sort steps
            this.sortStepHistory.push({
                arrayState: [...arr],
                comparedIndices: [],
                sortedIndices: [],
                desc: 'Merge Sort: Divide-and-conquer strategy will divide array into halves recursively.',
                complexity: 'O(n log n) Divide'
            });

            // Perform sort and generate final state
            const sorted = OrderSorter.mergeSortByPickupTime(arr);
            this.sortStepHistory.push({
                arrayState: sorted,
                comparedIndices: [],
                sortedIndices: [0, 1, 2, 3, 4],
                desc: 'Merge Sort Complete: Sub-arrays recursively merged in chronological order.',
                complexity: 'O(n log n) Guaranteed'
            });
        }

        this.sortStepIndex = 0;
    }

    renderSortVisualizer() {
        const container = document.getElementById('simSortCardsContainer');
        const stepDisplay = document.getElementById('simSortStepDisplay');
        const algoDisplay = document.getElementById('simSortAlgoName');
        if (!container) return;

        const currentStep = this.sortStepHistory[this.sortStepIndex] || this.sortStepHistory[0];
        const arr = currentStep.arrayState;

        if (stepDisplay) stepDisplay.innerText = `Step ${this.sortStepIndex + 1} of ${this.sortStepHistory.length}`;
        if (algoDisplay) {
            algoDisplay.innerText = this.activeSortAlgo === 'insertion' 
                ? 'Insertion Sort (Adaptive O(n))' 
                : 'Merge Sort (Divide & Conquer O(n log n))';
        }

        container.innerHTML = arr.map((item, idx) => {
            const isCompared = currentStep.comparedIndices.includes(idx);
            const isSorted = currentStep.sortedIndices.includes(idx);

            let borderClass = 'border: 1px solid #cbd5e1; background: #ffffff;';
            if (isCompared) {
                borderClass = 'border: 2px solid #0284c7; background: #f0f9ff; transform: scale(1.04);';
            } else if (isSorted) {
                borderClass = 'border: 2px solid #10b981; background: #ecfdf5;';
            }

            return `
                <div class="sim-sort-card" style="${borderClass}">
                    <div class="font-mono" style="font-size:0.68rem; color:#64748b;">[${idx}]</div>
                    <div class="font-mono" style="font-size:0.95rem; font-weight:700; color:#ea580c;">${item.pickupTime}</div>
                    <div style="font-size:0.85rem; font-weight:700; margin-top:2px;">${item.id}</div>
                    <div style="font-size:0.75rem; color:#64748b;">${item.student} • ${item.item}</div>
                </div>
            `;
        }).join('');

        this.updateExplanation(
            `Sorting Step (${this.activeSortAlgo.toUpperCase()})`,
            currentStep.desc,
            currentStep.complexity
        );
    }

    stepSort() {
        if (this.sortStepIndex < this.sortStepHistory.length - 1) {
            this.sortStepIndex++;
            this.renderSortVisualizer();
        } else {
            this.updateExplanation(
                'Sorting Completed',
                'All scheduled orders are now arranged in chronological sequence!',
                this.activeSortAlgo === 'insertion' ? 'O(n) Best / O(n²) Worst' : 'O(n log n)'
            );
        }
    }

    resetSort() {
        this.sortStepIndex = 0;
        this.renderSortVisualizer();
    }

    switchSortAlgorithm(algo) {
        this.activeSortAlgo = algo;
        const btnIns = document.getElementById('simBtnSortInsertion');
        const btnMrg = document.getElementById('simBtnSortMerge');

        if (algo === 'insertion') {
            btnIns.classList.add('active');
            btnMrg.classList.remove('active');
        } else {
            btnMrg.classList.add('active');
            btnIns.classList.remove('active');
        }

        this.generateSortSteps();
        this.renderSortVisualizer();
    }

    // ========================================================================
    // MODULE D: COMPLETE LUNCH RUSH GUIDED SIMULATION (5 STUDENTS)
    // ========================================================================
    setupLunchRushScenario() {
        this.rushStepIndex = 0;
        this.isRushRunning = false;
        if (this.rushInterval) clearInterval(this.rushInterval);

        // Predefined 5 Sample Student Orders with distinct pickup slots
        this.rushOrders = [
            { id: 'CB-101', student: 'Riya Sharma (CSE)', item: 'Dum Biryani', pickupTime: '12:15 PM', status: 'Scheduled', prepWindow: '12:00 PM' },
            { id: 'CB-102', student: 'Aarav Mehta (ECE)', item: 'Crispy Veggie Burger', pickupTime: '12:45 PM', status: 'Scheduled', prepWindow: '12:30 PM' },
            { id: 'CB-103', student: 'Sneha Patel (IT)', item: 'Masala Dosa', pickupTime: '12:15 PM', status: 'Scheduled', prepWindow: '12:00 PM' },
            { id: 'CB-104', student: 'Karthik Rao (ME)', item: 'Chole Bhature', pickupTime: '01:00 PM', status: 'Scheduled', prepWindow: '12:45 PM' },
            { id: 'CB-105', student: 'Ananya Das (BT)', item: 'Cold Coffee + Roll', pickupTime: '12:30 PM', status: 'Scheduled', prepWindow: '12:15 PM' }
        ];

        this.rushQueue = new OrderQueue();
        this.rushPreparing = null;
        this.rushCompleted = [];
        this.simulatedTime = '11:45 AM';

        this.renderRushUI();
    }

    renderRushUI() {
        const stepNum = document.getElementById('simRushStepNum');
        const clockDisplay = document.getElementById('simRushClock');
        const totalProcessed = document.getElementById('simRushTotalProcessed');
        const queueCount = document.getElementById('simRushQueueCount');
        const prepName = document.getElementById('simRushPrepName');
        const completedCount = document.getElementById('simRushCompletedCount');
        const ordersList = document.getElementById('simRushOrdersList');
        const queueTrack = document.getElementById('simRushQueueTrack');

        if (stepNum) stepNum.innerText = `Step ${this.rushStepIndex} / 8`;
        if (clockDisplay) clockDisplay.innerText = this.simulatedTime;
        if (totalProcessed) totalProcessed.innerText = this.rushCompleted.length + (this.rushPreparing ? 1 : 0);
        if (queueCount) queueCount.innerText = this.rushQueue.size();
        if (prepName) prepName.innerText = this.rushPreparing ? `${this.rushPreparing.id} (${this.rushPreparing.student})` : 'Stove Idle';
        if (completedCount) completedCount.innerText = this.rushCompleted.length;

        // Render Scheduled Pre-Orders list
        if (ordersList) {
            ordersList.innerHTML = this.rushOrders.map(o => {
                const badgeClass = o.status === 'Ready' ? 'status-ready' :
                                   o.status === 'Preparing' ? 'status-preparing' :
                                   o.status === 'In Queue' ? 'status-queue' :
                                   o.status === 'Collected' ? 'status-collected' : 'status-pending';
                return `
                    <div style="display:flex; align-items:center; justify-content:space-between; padding:0.45rem 0.65rem; background:#ffffff; border-radius:8px; border:1px solid #e2e8f0; font-size:0.78rem;">
                        <div>
                            <strong>${o.id}</strong> — ${o.student} <span style="color:#64748b;">(${o.item})</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:0.5rem;">
                            <span class="font-mono" style="font-weight:700; color:#ea580c;">Pickup: ${o.pickupTime}</span>
                            <span class="badge badge-status ${badgeClass} font-mono" style="font-size:0.65rem;">${o.status}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Render Active Kitchen Queue Track
        if (queueTrack) {
            const arr = this.rushQueue.toArray();
            if (arr.length === 0) {
                queueTrack.innerHTML = '<span style="color:#94a3b8; font-size:0.75rem;">Queue is empty.</span>';
            } else {
                queueTrack.innerHTML = arr.map((item, i) => `
                    <div class="sim-queue-token" style="min-width:130px; padding:6px 10px; font-size:0.72rem;">
                        <span class="font-mono" style="font-weight:700; color:#ea580c;">#${i + 1} in line</span>
                        <div><strong>${item.id}</strong></div>
                        <div style="color:#64748b;">${item.item}</div>
                    </div>
                `).join('<span style="color:#cbd5e1;">➔</span>');
            }
        }
    }

    // Step through the 8-stage lunch rush story
    executeNextRushStep() {
        this.rushStepIndex++;

        switch (this.rushStepIndex) {
            case 1:
                // Step 1: Pre-orders submitted
                this.simulatedTime = '11:45 AM';
                this.updateExplanation(
                    'Step 1: Students Place Pre-Orders',
                    '5 students submit canteen pre-orders for staggered lunch break times. All orders are assigned unique IDs and stored in the scheduled pre-order pool.',
                    'Order Ingestion O(1)'
                );
                break;

            case 2:
                // Step 2: Sorting scheduled orders chronologically
                this.simulatedTime = '11:50 AM';
                this.rushOrders = OrderSorter.insertionSortByPickupTime(this.rushOrders);
                this.updateExplanation(
                    'Step 2: Orders Chronologically Sorted',
                    'Canteen system applies Insertion Sort by pickup time. Earliest orders (12:15 PM) move to the front of the preparation roadmap!',
                    'Insertion Sort O(n)'
                );
                break;

            case 3:
                // Step 3: 12:00 PM - Prep window opens for 12:15 PM orders
                this.simulatedTime = '12:00 PM';
                const due1215 = this.rushOrders.filter(o => o.pickupTime === '12:15 PM');
                due1215.forEach(o => {
                    o.status = 'In Queue';
                    this.rushQueue.enqueue(o);
                });
                this.updateExplanation(
                    'Step 3: Prep Window Reached (12:00 PM)',
                    'Orders due at 12:15 PM (Riya & Sneha) enter the active FIFO preparation queue. Future orders (12:45 PM & 1:00 PM) do NOT block immediate orders!',
                    'Queue.enqueue() O(1)'
                );
                break;

            case 4:
                // Step 4: Chef calls dequeue() for first order
                this.simulatedTime = '12:05 PM';
                this.rushPreparing = this.rushQueue.dequeue();
                if (this.rushPreparing) this.rushPreparing.status = 'Preparing';
                this.updateExplanation(
                    'Step 4: Chef Dequeues Next Order',
                    `Chef calls dequeue() in O(1) time. Order ${this.rushPreparing.id} (Riya) is now on the stove cooking. Sneha advances to #1 in queue!`,
                    'Queue.dequeue() O(1)'
                );
                break;

            case 5:
                // Step 5: First order ready, next dequeued
                this.simulatedTime = '12:15 PM';
                if (this.rushPreparing) {
                    this.rushPreparing.status = 'Ready';
                    this.rushCompleted.push(this.rushPreparing);
                }
                // Dequeue Sneha
                this.rushPreparing = this.rushQueue.dequeue();
                if (this.rushPreparing) this.rushPreparing.status = 'Preparing';

                // Ananya (12:30 PM) is now eligible for prep
                const due1230 = this.rushOrders.find(o => o.pickupTime === '12:30 PM');
                if (due1230 && due1230.status === 'Scheduled') {
                    due1230.status = 'In Queue';
                    this.rushQueue.enqueue(due1230);
                }

                this.updateExplanation(
                    'Step 5: Order Ready at Counter 2',
                    'Riya\'s Biryani is hot & ready for pickup! Sneha\'s order moves to the stove. Ananya\'s 12:30 PM order enters queue rear.',
                    'FIFO Pipeline'
                );
                break;

            case 6:
                // Step 6: Riya collects, second order ready
                this.simulatedTime = '12:20 PM';
                const riyaOrder = this.rushCompleted.find(o => o.id === 'CB-101');
                if (riyaOrder) riyaOrder.status = 'Collected';

                if (this.rushPreparing) {
                    this.rushPreparing.status = 'Ready';
                    this.rushCompleted.push(this.rushPreparing);
                }
                this.rushPreparing = this.rushQueue.dequeue();
                if (this.rushPreparing) this.rushPreparing.status = 'Preparing';

                this.updateExplanation(
                    'Step 6: Food Collected with Zero Queue Wait',
                    'Riya arrives at Counter 2 and collects her food instantly. Total wait time in canteen line: 0 seconds! Next order takes the stove.',
                    'Express Collection'
                );
                break;

            case 7:
                // Step 7: 12:45 PM orders enqueued
                this.simulatedTime = '12:30 PM';
                const due1245 = this.rushOrders.find(o => o.pickupTime === '12:45 PM');
                if (due1245 && due1245.status === 'Scheduled') {
                    due1245.status = 'In Queue';
                    this.rushQueue.enqueue(due1245);
                }
                this.updateExplanation(
                    'Step 7: Afternoon Prep Window Advances',
                    'Aarav\'s 12:45 PM order enters the queue. FIFO line systematically transitions orders without kitchen bottlenecks.',
                    'Continuous FIFO'
                );
                break;

            case 8:
                // Step 8: All remaining orders fulfilled
                this.simulatedTime = '01:10 PM';
                this.rushOrders.forEach(o => o.status = 'Collected');
                this.rushQueue.clear();
                this.rushPreparing = null;
                this.rushCompleted = [...this.rushOrders];

                this.updateExplanation(
                    'Step 8: Lunch Rush Simulation Complete! 🎉',
                    'All 5 pre-orders successfully prepared and collected on schedule. Canteen queue eliminated using Arrays, FIFO Queue, and Insertion Sort.',
                    'Scenario Complete'
                );
                this.pauseLunchRush();
                break;

            default:
                this.setupLunchRushScenario();
                break;
        }

        this.renderRushUI();
    }

    startLunchRush() {
        if (this.isRushRunning) return;
        this.isRushRunning = true;

        const btnPlay = document.getElementById('simBtnRushPlay');
        const btnPause = document.getElementById('simBtnRushPause');
        if (btnPlay) btnPlay.style.display = 'none';
        if (btnPause) btnPause.style.display = 'inline-flex';

        this.rushInterval = setInterval(() => {
            if (this.rushStepIndex >= 8) {
                this.pauseLunchRush();
            } else {
                this.executeNextRushStep();
            }
        }, this.rushSpeed);
    }

    pauseLunchRush() {
        this.isRushRunning = false;
        if (this.rushInterval) clearInterval(this.rushInterval);

        const btnPlay = document.getElementById('simBtnRushPlay');
        const btnPause = document.getElementById('simBtnRushPause');
        if (btnPlay) btnPlay.style.display = 'inline-flex';
        if (btnPause) btnPause.style.display = 'none';
    }

    setRushSpeed(multiplier) {
        this.rushSpeed = Math.round(1500 / multiplier);
        if (this.isRushRunning) {
            this.pauseLunchRush();
            this.startLunchRush();
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Attach globally to window or module.exports
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimulationLabEngine;
}
if (typeof window !== 'undefined') {
    window.SimulationLabEngine = SimulationLabEngine;
}
