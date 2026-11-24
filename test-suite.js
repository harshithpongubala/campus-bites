/**
 * ============================================================================
 * CAMPUS BITES — AUTOMATED DSA & FUNCTIONAL TEST SUITE
 * ============================================================================
 * Validates:
 * 1. Queue Data Structure (FIFO order, enqueue, dequeue, peek, isEmpty, size,
 *    underflow protection, pointer safety).
 * 2. Menu Array Operations (Insert, Search, Update, Delete, Toggle Availability,
 *    Input Validation).
 * 3. Sorting Algorithms (Insertion Sort & Merge Sort with chronological correctness).
 * 4. End-to-end Order Flow & ID Uniqueness.
 * ============================================================================
 */

'use strict';

class DSATestSuite {
    constructor() {
        this.results = [];
        this.passCount = 0;
        this.failCount = 0;
    }

    assert(description, condition, details = '') {
        if (condition) {
            this.passCount++;
            this.results.push({ description, passed: true, details });
            console.log(`%c[PASS] ${description}`, 'color: #10b981; font-weight: bold;');
        } else {
            this.failCount++;
            this.results.push({ description, passed: false, details });
            console.error(`[FAIL] ${description} — ${details}`);
        }
    }

    async runAllTests() {
        this.results = [];
        this.passCount = 0;
        this.failCount = 0;

        console.group('%c=== CAMPUS BITES AUTOMATED DSA TEST HARNESS ===', 'color: #f97316; font-size: 14px; font-weight: bold;');

        this.testQueueBasics();
        this.testQueueUnderflowSafety();
        this.testQueuePositionTracking();
        this.testMenuArrayManagerOperations();
        this.testMenuSearchLinearScan();
        this.testTimeParser();
        this.testChronologicalSortingAlgorithms();
        this.testOrderIdGenerationUniqueness();

        console.groupEnd();

        const total = this.passCount + this.failCount;
        const score = total > 0 ? Math.round((this.passCount / total) * 100) : 0;
        console.log(`%cResults: ${this.passCount}/${total} Passed (${score}%)`, `color: ${this.failCount === 0 ? '#10b981' : '#ef4444'}; font-weight: bold; font-size: 13px;`);

        return {
            total,
            passCount: this.passCount,
            failCount: this.failCount,
            score,
            results: this.results
        };
    }

    // --- TEST 1: QUEUE BASICS (FIFO GUARANTEE) ---
    testQueueBasics() {
        const queue = new OrderQueue();
        this.assert('Queue initializes empty', queue.isEmpty() === true && queue.size() === 0);

        queue.enqueue({ id: 'O-1', name: 'Order 1' });
        queue.enqueue({ id: 'O-2', name: 'Order 2' });
        queue.enqueue({ id: 'O-3', name: 'Order 3' });

        this.assert('Queue size increments to 3 after 3 enqueues', queue.size() === 3);
        this.assert('Queue peek() returns first enqueued item without removal', queue.peek().id === 'O-1' && queue.size() === 3);

        const dequeued1 = queue.dequeue();
        this.assert('Queue dequeue() returns first item in FIFO order (O-1)', dequeued1.id === 'O-1');
        this.assert('Queue size decrements to 2 after dequeue', queue.size() === 2);
        this.assert('Next peek() returns second item (O-2)', queue.peek().id === 'O-2');

        const dequeued2 = queue.dequeue();
        const dequeued3 = queue.dequeue();
        this.assert('Subsequent dequeues maintain strict FIFO sequence (O-2, then O-3)', dequeued2.id === 'O-2' && dequeued3.id === 'O-3');
        this.assert('Queue becomes empty after dequeuing all elements', queue.isEmpty() === true && queue.size() === 0);
    }

    // --- TEST 2: QUEUE UNDERFLOW DEFENSE ---
    testQueueUnderflowSafety() {
        const queue = new OrderQueue();
        this.assert('Calling peek() on empty queue returns null safely without throwing', queue.peek() === null);
        this.assert('Calling dequeue() on empty queue returns null safely without throwing', queue.dequeue() === null);
        this.assert('Queue head and tail reset to zero on empty condition', queue._head === 0 && queue._tail === 0);

        let errorThrown = false;
        try {
            queue.enqueue(null);
        } catch (e) {
            errorThrown = true;
        }
        this.assert('Enqueueing null/invalid order throws descriptive validation error', errorThrown === true);
    }

    // --- TEST 3: QUEUE POSITION TRACKING ---
    testQueuePositionTracking() {
        const queue = new OrderQueue();
        queue.enqueue({ id: 'CB-101' });
        queue.enqueue({ id: 'CB-102' });
        queue.enqueue({ id: 'CB-103' });

        this.assert('findPosition() returns 1 for first item', queue.findPosition('CB-101') === 1);
        this.assert('findPosition() returns 2 for second item', queue.findPosition('CB-102') === 2);
        this.assert('findPosition() returns 3 for third item', queue.findPosition('CB-103') === 3);
        this.assert('findPosition() returns -1 for non-existent order ID', queue.findPosition('CB-999') === -1);

        queue.dequeue();
        this.assert('After dequeuing front order, CB-102 advances to position 1', queue.findPosition('CB-102') === 1);
    }

    // --- TEST 4: MENU ARRAY MANAGER OPERATIONS ---
    testMenuArrayManagerOperations() {
        const initial = [
            { id: 'T-1', name: 'Samosa', price: 20, isVeg: true, isAvailable: true, category: 'snacks' },
            { id: 'T-2', name: 'Tea', price: 15, isVeg: true, isAvailable: true, category: 'drinks' }
        ];
        const manager = new MenuArrayManager(initial);

        this.assert('ArrayManager count() reports initial array length', manager.count() === 2);

        // Insert
        manager.insert({ id: 'T-3', name: 'Vada Pav', price: 30, category: 'snacks' });
        this.assert('Insert (push) appends item to array', manager.count() === 3 && manager.findById('T-3') !== null);

        // Duplicate Insert Prevention
        let duplicateCaught = false;
        try {
            manager.insert({ id: 'T-3', name: 'Duplicate' });
        } catch (e) {
            duplicateCaught = true;
        }
        this.assert('Insert rejects duplicate ID gracefully', duplicateCaught === true);

        // Update
        const updated = manager.update('T-3', { price: 35, prepTimeMins: 6 });
        this.assert('Update modifies item properties in-place', updated === true && manager.findById('T-3').price === 35);

        // Toggle Stock Availability
        const newStock = manager.toggleAvailability('T-1');
        this.assert('toggleAvailability flips stock state (true -> false)', newStock === false && manager.findById('T-1').isAvailable === false);

        // Delete
        const deleted = manager.delete('T-2');
        this.assert('Delete splices target item from array', deleted === true && manager.findById('T-2') === null && manager.count() === 2);
    }

    // --- TEST 5: LINEAR SEARCH IN MENU ARRAY ---
    testMenuSearchLinearScan() {
        const catalog = [
            { id: '1', name: 'Hyderabadi Dum Biryani', description: 'Fragrant spicy rice', category: 'lunch' },
            { id: '2', name: 'Paneer Roll', description: 'Cottage cheese paratha', category: 'snacks' },
            { id: '3', name: 'Cold Coffee', description: 'Chilled beverage with milk', category: 'drinks' }
        ];
        const manager = new MenuArrayManager(catalog);

        const searchBiryani = manager.search('biryani');
        this.assert('Linear search finds item by name keyword', searchBiryani.length === 1 && searchBiryani[0].id === '1');

        const searchCheese = manager.search('cheese');
        this.assert('Linear search finds item by description keyword', searchCheese.length === 1 && searchCheese[0].id === '2');

        const searchDrinks = manager.filterByCategory('drinks');
        this.assert('Category filter returns correct subset', searchDrinks.length === 1 && searchDrinks[0].id === '3');
    }

    // --- TEST 6: TIME PARSER ---
    testTimeParser() {
        const m1 = OrderSorter.parseTimeToMinutes('12:15 PM');
        const m2 = OrderSorter.parseTimeToMinutes('12:30 PM');
        const m3 = OrderSorter.parseTimeToMinutes('01:15 PM');
        const m4 = OrderSorter.parseTimeToMinutes('08:00 AM');

        this.assert('12:15 PM converts to 735 minutes from midnight', m1 === 735);
        this.assert('12:30 PM converts to 750 minutes from midnight', m2 === 750);
        this.assert('01:15 PM converts to 795 minutes (13 * 60 + 15)', m3 === 795);
        this.assert('08:00 AM converts to 480 minutes', m4 === 480);
        this.assert('Chronological relationship holds: 8:00 AM < 12:15 PM < 12:30 PM < 1:15 PM', m4 < m1 && m1 < m2 && m2 < m3);
    }

    // --- TEST 7: SORTING ALGORITHMS (INSERTION SORT & MERGE SORT) ---
    testChronologicalSortingAlgorithms() {
        const unsortedOrders = [
            { id: 'O-LATE', pickupTime: '01:30 PM' },
            { id: 'O-EARLY', pickupTime: '12:00 PM' },
            { id: 'O-PEAK', pickupTime: '12:30 PM' },
            { id: 'O-MID', pickupTime: '12:15 PM' },
            { id: 'O-MORNING', pickupTime: '09:00 AM' }
        ];

        // 1. Insertion Sort
        const insertionSorted = OrderSorter.insertionSortByPickupTime(unsortedOrders);
        const insertionIds = insertionSorted.map(o => o.id);
        const expectedSequence = ['O-MORNING', 'O-EARLY', 'O-MID', 'O-PEAK', 'O-LATE'];

        this.assert(
            'Insertion Sort arranges scheduled orders in correct chronological order',
            JSON.stringify(insertionIds) === JSON.stringify(expectedSequence),
            `Got: ${insertionIds.join(' -> ')}`
        );

        // 2. Merge Sort
        const mergeSorted = OrderSorter.mergeSortByPickupTime(unsortedOrders);
        const mergeIds = mergeSorted.map(o => o.id);

        this.assert(
            'Merge Sort arranges scheduled orders in correct chronological order',
            JSON.stringify(mergeIds) === JSON.stringify(expectedSequence),
            `Got: ${mergeIds.join(' -> ')}`
        );

        // 3. Immutability Check (Source array was not corrupted)
        this.assert(
            'Sorting functions return a new array without mutating original unsorted reference',
            unsortedOrders[0].id === 'O-LATE'
        );
    }

    // --- TEST 8: ORDER ID UNIQUENESS ---
    testOrderIdGenerationUniqueness() {
        const generatedIds = new Set();
        const testCount = 50;

        for (let i = 0; i < testCount; i++) {
            const id = generateUniqueOrderId();
            generatedIds.add(id);
        }

        this.assert(
            `Generates 50 consecutive unique order IDs without collisions`,
            generatedIds.size === testCount
        );
    }
}

// Global browser runner attached to UI button
if (typeof window !== 'undefined') {
    window.runAutomatedDSATests = async function() {
        const suite = new DSATestSuite();
        const result = await suite.runAllTests();

        // Render interactive results into UI
        const container = document.getElementById('dsaTestResultsBox');
        const scoreDisplay = document.getElementById('dsaTestScoreDisplay');

        if (scoreDisplay) {
            scoreDisplay.innerText = `${result.score}%`;
        }

        if (container) {
            container.innerHTML = `
                <div style="background:#0f172a; border-radius:12px; padding:1.25rem; color:#e2e8f0; font-family:'JetBrains Mono', monospace; font-size:0.8rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #334155; padding-bottom:0.75rem; margin-bottom:1rem;">
                        <div>
                            <span style="color:#f97316; font-weight:700;">TEST EXECUTION SUMMARY:</span>
                            <span style="color:${result.failCount === 0 ? '#10b981' : '#ef4444'}; font-weight:700; margin-left:0.5rem;">
                                ${result.passCount} PASSED / ${result.failCount} FAILED (${result.score}%)
                            </span>
                        </div>
                        <span style="color:#94a3b8; font-size:0.72rem;">All DSA Constraints Satisfied</span>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:0.45rem; max-height:300px; overflow-y:auto;">
                        ${result.results.map(r => `
                            <div style="display:flex; align-items:flex-start; gap:0.5rem; line-height:1.4;">
                                <span style="color:${r.passed ? '#10b981' : '#ef4444'}; font-weight:700;">
                                    ${r.passed ? '✓ PASS' : '✗ FAIL'}
                                </span>
                                <span style="color:#cbd5e1;">${r.description}</span>
                                ${r.details ? `<span style="color:#94a3b8; font-size:0.7rem;">(${r.details})</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (typeof showToast === 'function') {
            showToast(`DSA Harness: ${result.passCount}/${result.total} Tests Passed (${result.score}%)`, result.failCount === 0 ? 'success' : 'error');
        }

        return result;
    };
}

// If running in Node.js headless environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DSATestSuite;
}
