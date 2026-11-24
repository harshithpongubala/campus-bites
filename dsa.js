/**
 * ============================================================================
 * CAMPUS BITES — DATA STRUCTURES & ALGORITHMS (DSA) CORE MODULE
 * ============================================================================
 * Academic Project: College Canteen Pre-Ordering & Queue Management System
 * Tech Stack: Vanilla JavaScript (ES6+), Clean Modular Architecture
 * 
 * This module genuinely implements three fundamental DSA concepts:
 * 1. ARRAYS: Dynamic storage, linear search, insertion, update, and deletion
 *    for canteen menu catalog and inventory.
 * 2. FIFO QUEUE: First-In-First-Out queue with head/tail pointers for real-time
 *    kitchen food preparation and student position tracking.
 * 3. SORTING ALGORITHMS: Custom Insertion Sort & Merge Sort implementations for
 *    chronological scheduling of orders by pickup timestamps.
 * ============================================================================
 */

'use strict';

/**
 * ----------------------------------------------------------------------------
 * 1. QUEUE DATA STRUCTURE (FIFO — First-In, First-Out)
 * ----------------------------------------------------------------------------
 * Purpose in Real-World Problem:
 * During peak campus breaks, food orders must be prepared strictly in the
 * sequence they were received to ensure fairness and prevent order starvation.
 *
 * Implementation Details:
 * Uses an object-backed storage map with `head` and `tail` index pointers.
 * This ensures TRUE O(1) time complexity for both enqueue and dequeue,
 * avoiding the O(n) re-indexing penalty of JavaScript's native Array.shift().
 * ----------------------------------------------------------------------------
 */
class OrderQueue {
    constructor() {
        // Internal dictionary to hold queue elements by numeric key
        this._items = {};
        // Pointer to the front of the queue (next element to be dequeued)
        this._head = 0;
        // Pointer to the rear of the queue (where the next element is inserted)
        this._tail = 0;
    }

    /**
     * Enqueue: Adds a new order to the rear of the preparation queue.
     * Time Complexity: O(1) constant time
     * Space Complexity: O(1)
     * @param {Object} order - Order object containing id, items, student details, etc.
     * @returns {number} - New size of the queue
     */
    enqueue(order) {
        if (!order || typeof order !== 'object' || !order.id) {
            throw new Error('Invalid order object provided to OrderQueue.enqueue()');
        }
        this._items[this._tail] = order;
        this._tail++;
        return this.size();
    }

    /**
     * Dequeue: Removes and returns the order at the front of the queue.
     * Time Complexity: O(1) constant time (No array shifting required!)
     * Space Complexity: O(1)
     * @returns {Object|null} - The dequeued order, or null if the queue is empty.
     */
    dequeue() {
        if (this.isEmpty()) {
            return null; // Safe guard against empty queue underflow
        }
        const item = this._items[this._head];
        delete this._items[this._head]; // Clean up memory reference
        this._head++;

        // Reset pointers when the queue becomes empty to prevent unbounded integer growth
        if (this._head === this._tail) {
            this._head = 0;
            this._tail = 0;
            this._items = {};
        }

        return item;
    }

    /**
     * Peek: Inspects the next order to be prepared without removing it.
     * Time Complexity: O(1)
     * @returns {Object|null} - Order at the front of the queue, or null if empty.
     */
    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this._items[this._head];
    }

    /**
     * isEmpty: Checks whether there are any orders currently waiting in queue.
     * Time Complexity: O(1)
     * @returns {boolean}
     */
    isEmpty() {
        return this._tail - this._head === 0;
    }

    /**
     * Size: Returns the exact number of active orders waiting in the queue.
     * Time Complexity: O(1)
     * @returns {number}
     */
    size() {
        return this._tail - this._head;
    }

    /**
     * toArray: Returns an ordered array of all orders currently in the queue,
     * from front (index 0) to rear (index n-1).
     * Time Complexity: O(n) where n is the number of queued elements
     * @returns {Array<Object>}
     */
    toArray() {
        const result = [];
        for (let i = this._head; i < this._tail; i++) {
            if (this._items[i]) {
                result.push(this._items[i]);
            }
        }
        return result;
    }

    /**
     * findPosition: Determines a specific order's 1-based position in the queue.
     * Used by students to see: "You are #2 in the food preparation line".
     * Time Complexity: O(n) linear scan through current queue size
     * @param {string} orderId 
     * @returns {number} - 1-based position, or -1 if not found in queue.
     */
    findPosition(orderId) {
        let position = 1;
        for (let i = this._head; i < this._tail; i++) {
            if (this._items[i] && this._items[i].id === orderId) {
                return position;
            }
            position++;
        }
        return -1;
    }

    /**
     * Clear: Resets the queue state completely.
     */
    clear() {
        this._items = {};
        this._head = 0;
        this._tail = 0;
    }

    /**
     * Load from existing array (used during localStorage state restoration)
     * @param {Array<Object>} ordersArray 
     */
    fromArray(ordersArray) {
        this.clear();
        if (Array.isArray(ordersArray)) {
            for (const order of ordersArray) {
                this.enqueue(order);
            }
        }
    }
}

/**
 * ----------------------------------------------------------------------------
 * 2. ARRAY OPERATIONS (Menu Catalog & Inventory Manager)
 * ----------------------------------------------------------------------------
 * Purpose in Real-World Problem:
 * College canteens change daily food items, run out of ingredients, and need
 * real-time search across categories (Breakfast, Lunch, Snacks, Drinks).
 *
 * Implementation Details:
 * Demonstrates explicit Array operations:
 * - Search: Linear Search O(n) across multiple fields
 * - Insert: O(1) amortized push with duplicate ID validation
 * - Update: O(n) find index + O(1) property mutation
 * - Delete: O(n) linear search + splice
 * - Filter/Transform: Categorization and availability filtering
 * ----------------------------------------------------------------------------
 */
class MenuArrayManager {
    /**
     * @param {Array<Object>} initialItems - Initial array of menu items
     */
    constructor(initialItems = []) {
        this._menu = Array.isArray(initialItems) ? [...initialItems] : [];
    }

    /**
     * Linear Search: Searches menu items matching a search query string.
     * Evaluates item name, description, and category.
     * Time Complexity: O(n * m) where n = number of items, m = query length
     * Space Complexity: O(k) where k = matching items
     * @param {string} query - Keyword e.g. "biryani", "veg", "roll"
     * @returns {Array<Object>}
     */
    search(query) {
        if (!query || typeof query !== 'string' || !query.trim()) {
            return [...this._menu];
        }
        const normalized = query.trim().toLowerCase();
        const matches = [];

        // Explicit linear search loop
        for (let i = 0; i < this._menu.length; i++) {
            const item = this._menu[i];
            const nameMatch = item.name && item.name.toLowerCase().includes(normalized);
            const descMatch = item.description && item.description.toLowerCase().includes(normalized);
            const catMatch = item.category && item.category.toLowerCase().includes(normalized);

            if (nameMatch || descMatch || catMatch) {
                matches.push(item);
            }
        }
        return matches;
    }

    /**
     * Filter by Category: Retrieves all items belonging to a category.
     * Time Complexity: O(n)
     * @param {string} category - 'all', 'breakfast', 'lunch', 'snacks', 'drinks'
     * @returns {Array<Object>}
     */
    filterByCategory(category) {
        if (!category || category.toLowerCase() === 'all') {
            return [...this._menu];
        }
        const target = category.toLowerCase();
        const results = [];
        for (let i = 0; i < this._menu.length; i++) {
            if (this._menu[i].category && this._menu[i].category.toLowerCase() === target) {
                results.push(this._menu[i]);
            }
        }
        return results;
    }

    /**
     * Find by ID: Locates a single item by unique ID.
     * Time Complexity: O(n) linear search
     * @param {string|number} id 
     * @returns {Object|null}
     */
    findById(id) {
        for (let i = 0; i < this._menu.length; i++) {
            if (this._menu[i].id === id) {
                return this._menu[i];
            }
        }
        return null;
    }

    /**
     * Insert: Adds a new menu item to the catalog.
     * Time Complexity: O(n) check for duplicate ID + O(1) amortized push
     * Space Complexity: O(1)
     * @param {Object} item 
     * @returns {boolean} - True if successfully inserted
     */
    insert(item) {
        if (!item || !item.id || !item.name || typeof item.price !== 'number') {
            throw new Error('Menu item requires valid id, name, and numeric price.');
        }

        // Duplicate ID validation
        if (this.findById(item.id)) {
            throw new Error(`Menu item with ID "${item.id}" already exists.`);
        }

        // Defensive defaults
        const newItem = {
            id: item.id,
            name: item.name,
            category: item.category || 'lunch',
            price: Number(item.price),
            description: item.description || '',
            prepTimeMins: Number(item.prepTimeMins) || 15,
            isVeg: Boolean(item.isVeg !== false),
            isAvailable: Boolean(item.isAvailable !== false),
            image: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'
        };

        this._menu.push(newItem);
        return true;
    }

    /**
     * Update: Modifies fields of an existing menu item.
     * Time Complexity: O(n) lookup + O(1) field assignment
     * @param {string|number} id 
     * @param {Object} updates 
     * @returns {boolean} - True if updated, false if item not found
     */
    update(id, updates) {
        for (let i = 0; i < this._menu.length; i++) {
            if (this._menu[i].id === id) {
                // Merge updates while preserving ID
                this._menu[i] = {
                    ...this._menu[i],
                    ...updates,
                    id: this._menu[i].id // Immutable primary key
                };
                return true;
            }
        }
        return false;
    }

    /**
     * Delete: Removes a menu item from the catalog.
     * Time Complexity: O(n) linear search + O(n) array shift on splice
     * Space Complexity: O(1)
     * @param {string|number} id 
     * @returns {boolean} - True if deleted, false if not found
     */
    delete(id) {
        for (let i = 0; i < this._menu.length; i++) {
            if (this._menu[i].id === id) {
                this._menu.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * Toggle Availability: Quickly sets an item In Stock or Sold Out.
     * Time Complexity: O(n)
     * @param {string|number} id 
     * @returns {boolean} - New availability state
     */
    toggleAvailability(id) {
        const item = this.findById(id);
        if (!item) {
            throw new Error(`Item ${id} not found.`);
        }
        item.isAvailable = !item.isAvailable;
        return item.isAvailable;
    }

    /**
     * Get All Items: Returns a shallow clone of the catalog array.
     * Time Complexity: O(n)
     * @returns {Array<Object>}
     */
    getAll() {
        return [...this._menu];
    }

    /**
     * Size: Returns total count of items in catalog.
     * Time Complexity: O(1)
     * @returns {number}
     */
    count() {
        return this._menu.length;
    }
}

/**
 * ----------------------------------------------------------------------------
 * 3. SORTING ALGORITHMS (Scheduled Order Chronological Processing)
 * ----------------------------------------------------------------------------
 * Purpose in Real-World Problem:
 * Students choose various lunch pickup times (e.g. 12:15 PM, 12:30 PM, 01:00 PM).
 * The canteen staff needs these scheduled pre-orders arranged in strict
 * chronological order so they can prep food just in time for student arrivals.
 *
 * Implementation Details:
 * 1. Insertion Sort:
 *    - Adaptive O(n) best-case for online, nearly-sorted streams.
 *    - Stable, in-place, O(1) auxiliary space.
 * 2. Merge Sort:
 *    - Divide-and-conquer algorithm.
 *    - Guaranteed O(n log n) time complexity, stable sorting.
 * ----------------------------------------------------------------------------
 */
class OrderSorter {
    /**
     * Converts human pickup time strings to comparable numeric minutes from midnight.
     * Supports formats: "12:15 PM", "1:30 PM", "12:45", "13:30", "12:00 AM".
     * Example: "12:30 PM" -> 12 * 60 + 30 = 750
     * @param {string} timeStr 
     * @returns {number} - Minutes from 00:00 (0 to 1439)
     */
    static parseTimeToMinutes(timeStr) {
        if (!timeStr || typeof timeStr !== 'string') {
            return 99999; // Fallback to end of day for unparseable entries
        }

        const clean = timeStr.trim().toUpperCase();
        const isPM = clean.includes('PM');
        const isAM = clean.includes('AM');

        // Extract hour and minute digits
        const match = clean.match(/(\d{1,2})[:.](\d{2})/);
        if (!match) {
            return 99999;
        }

        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);

        if (isPM && hours < 12) {
            hours += 12;
        } else if (isAM && hours === 12) {
            hours = 0;
        }

        return hours * 60 + minutes;
    }

    /**
     * INSERTION SORT IMPLEMENTATION
     * -----------------------------
     * Algorithm Mechanics:
     * Iterates through the array, taking one order at a time and inserting it
     * into its correct position within the already-sorted prefix sub-array.
     * 
     * Complexity Analysis:
     * - Best Case Time: O(n) when incoming orders arrive already nearly sorted!
     * - Average Case Time: O(n^2)
     * - Worst Case Time: O(n^2) (reverse chronological order)
     * - Auxiliary Space: O(1) (in-place sorting)
     * - Stability: Stable (maintains relative order of duplicate timestamps)
     * 
     * @param {Array<Object>} orders - Array of order objects
     * @returns {Array<Object>} - Sorted array (shallow copy to avoid mutating source unexpectedly)
     */
    static insertionSortByPickupTime(orders) {
        if (!Array.isArray(orders) || orders.length <= 1) {
            return orders ? [...orders] : [];
        }

        const arr = [...orders];
        const n = arr.length;

        for (let i = 1; i < n; i++) {
            const currentOrder = arr[i];
            const currentMinutes = OrderSorter.parseTimeToMinutes(currentOrder.pickupTime);
            let j = i - 1;

            // Shift elements of arr[0..i-1] that have a later pickup time
            // to one position ahead of their current position
            while (j >= 0 && OrderSorter.parseTimeToMinutes(arr[j].pickupTime) > currentMinutes) {
                arr[j + 1] = arr[j];
                j = j - 1;
            }
            arr[j + 1] = currentOrder;
        }

        return arr;
    }

    /**
     * MERGE SORT IMPLEMENTATION
     * -------------------------
     * Algorithm Mechanics:
     * Divide-and-conquer: recursively divides the order array into two halves
     * until each sub-array has length 1, then merges the sorted halves.
     * 
     * Complexity Analysis:
     * - Best Case Time: O(n log n)
     * - Average Case Time: O(n log n)
     * - Worst Case Time: O(n log n) (guaranteed predictable performance)
     * - Auxiliary Space: O(n) (requires auxiliary arrays during merge phase)
     * - Stability: Stable
     * 
     * @param {Array<Object>} orders 
     * @returns {Array<Object>}
     */
    static mergeSortByPickupTime(orders) {
        if (!Array.isArray(orders) || orders.length <= 1) {
            return orders ? [...orders] : [];
        }

        const mid = Math.floor(orders.length / 2);
        const left = OrderSorter.mergeSortByPickupTime(orders.slice(0, mid));
        const right = OrderSorter.mergeSortByPickupTime(orders.slice(mid));

        return OrderSorter._merge(left, right);
    }

    /**
     * Internal Merge routine for Merge Sort.
     * Merges two sorted arrays into one sorted array.
     * Time Complexity: O(n1 + n2)
     * @private
     */
    static _merge(left, right) {
        const result = [];
        let i = 0;
        let j = 0;

        while (i < left.length && j < right.length) {
            const leftMin = OrderSorter.parseTimeToMinutes(left[i].pickupTime);
            const rightMin = OrderSorter.parseTimeToMinutes(right[j].pickupTime);

            // Using '<=' ensures stability (first ordered remains first)
            if (leftMin <= rightMin) {
                result.push(left[i]);
                i++;
            } else {
                result.push(right[j]);
                j++;
            }
        }

        // Collect remaining elements
        while (i < left.length) {
            result.push(left[i]);
            i++;
        }
        while (j < right.length) {
            result.push(right[j]);
            j++;
        }

        return result;
    }
}

// Export for module systems if present, attach to global window in browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OrderQueue, MenuArrayManager, OrderSorter };
} else if (typeof window !== 'undefined') {
    window.OrderQueue = OrderQueue;
    window.MenuArrayManager = MenuArrayManager;
    window.OrderSorter = OrderSorter;
}
