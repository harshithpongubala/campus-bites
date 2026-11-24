/**
 * ============================================================================
 * CAMPUS BITES — APPLICATION CONTROLLER & STATE SYNCHRONIZATION
 * ============================================================================
 * Connects the UI to native DSA classes (OrderQueue, MenuArrayManager, OrderSorter)
 * Handles LocalStorage persistence, multi-tab real-time sync, cart calculations,
 * and order state transitions.
 * ============================================================================
 */

'use strict';

// Default Menu Items (Preserving and expanding original Campus Bites catalog)
const DEFAULT_MENU_ITEMS = [
    {
        id: 'item-1',
        name: 'Hyderabadi Dum Biryani',
        category: 'lunch',
        price: 120,
        prepTimeMins: 20,
        isVeg: true,
        isAvailable: true,
        description: 'Fragrant basmati rice slow-cooked with fresh vegetables, saffron, and served with cooling raita.',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80'
    },
    {
        id: 'item-2',
        name: 'Paneer Butter Masala Roll',
        category: 'snacks',
        price: 60,
        prepTimeMins: 10,
        isVeg: true,
        isAvailable: true,
        description: 'Whole wheat paratha wrapped around marinated cottage cheese, crunchy onions, and mint chutney.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&q=80'
    },
    {
        id: 'item-3',
        name: 'Crispy Masala Dosa',
        category: 'breakfast',
        price: 45,
        prepTimeMins: 12,
        isVeg: true,
        isAvailable: true,
        description: 'Golden fermented crepe stuffed with spiced potato mash, served with coconut chutney and hot sambar.',
        image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&q=80'
    },
    {
        id: 'item-4',
        name: 'Crispy Veggie Burger',
        category: 'snacks',
        price: 70,
        prepTimeMins: 8,
        isVeg: true,
        isAvailable: true,
        description: 'Handcrafted herb vegetable patty with melted cheese, lettuce, tomato, and spicy garlic sauce.',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80'
    },
    {
        id: 'item-5',
        name: 'Amritsari Chole Bhature',
        category: 'lunch',
        price: 80,
        prepTimeMins: 15,
        isVeg: true,
        isAvailable: true,
        description: 'Spicy tangy chickpea curry served with two puffed golden bhaturas, pickled carrot, and onions.',
        image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&q=80'
    },
    {
        id: 'item-6',
        name: 'South Indian Idli Vada Combo',
        category: 'breakfast',
        price: 40,
        prepTimeMins: 8,
        isVeg: true,
        isAvailable: true,
        description: 'Steamed fluffy rice cakes paired with crispy medu vada, served with tomato and coconut chutneys.',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80'
    },
    {
        id: 'item-7',
        name: 'Artisan Cold Coffee with Ice Cream',
        category: 'drinks',
        price: 40,
        prepTimeMins: 4,
        isVeg: true,
        isAvailable: true,
        description: 'Chilled freshly brewed espresso blended with thick milk and topped with rich vanilla cream.',
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&q=80'
    },
    {
        id: 'item-8',
        name: 'Fresh Mango Lassi',
        category: 'drinks',
        price: 35,
        prepTimeMins: 4,
        isVeg: true,
        isAvailable: true,
        description: 'Thick churned sweet yogurt blended with Alphonso mango pulp and cardamom.',
        image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500&q=80'
    }
];

// App Global State
let menuManager = null;
let kitchenQueue = null;
let allOrders = [];
let studentCart = {}; // Map of { itemId: quantity }
let currentRole = 'student'; // 'student' | 'staff'
let currentCategory = 'all';
let currentSortAlgo = 'insertion'; // 'insertion' | 'merge'
let activeStudentOrderId = null;

const STORAGE_KEYS = {
    MENU: 'cb_menu_items_v2',
    ORDERS: 'cb_orders_list_v2',
    ACTIVE_ORDER: 'cb_active_order_id_v2'
};

/**
 * Initialize Application on DOM Ready
 */
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupStorageSync();
});

function initApp() {
    // 1. Initialize Menu Array Manager
    const savedMenu = loadFromStorage(STORAGE_KEYS.MENU);
    menuManager = new MenuArrayManager(savedMenu && savedMenu.length > 0 ? savedMenu : DEFAULT_MENU_ITEMS);
    if (!savedMenu || savedMenu.length === 0) {
        saveToStorage(STORAGE_KEYS.MENU, menuManager.getAll());
    }

    // 2. Initialize Order Queue & Order History
    kitchenQueue = new OrderQueue();
    allOrders = loadFromStorage(STORAGE_KEYS.ORDERS) || [];
    activeStudentOrderId = loadFromStorage(STORAGE_KEYS.ACTIVE_ORDER) || null;

    // Populate FIFO Queue with active uncompleted orders in original submission sequence
    rebuildKitchenQueue();

    // 3. Render Initial Views
    renderMenuGrid();
    updateCartUI();
    renderStudentOrderHistory();
    renderStaffViews();
    updateDSAConsoleDiagnostics();

    // 4. Initialize Simulation Lab Engine (Isolated State)
    if (typeof SimulationLabEngine !== 'undefined') {
        window.simLab = new SimulationLabEngine();
    }
}

/**
 * Rebuilds the kitchen FIFO queue strictly from uncompleted orders
 */
function rebuildKitchenQueue() {
    kitchenQueue.clear();
    for (let i = 0; i < allOrders.length; i++) {
        const order = allOrders[i];
        if (order.status === 'In Queue') {
            kitchenQueue.enqueue(order);
        }
    }
}

/**
 * Cross-Tab Storage Event Listener
 * Enables real-time synchronization between Student tab and Staff Dashboard!
 */
function setupStorageSync() {
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEYS.ORDERS) {
            allOrders = loadFromStorage(STORAGE_KEYS.ORDERS) || [];
            rebuildKitchenQueue();
            renderStudentOrderHistory();
            renderStaffViews();
            updateActiveOrderTracker();
            updateDSAConsoleDiagnostics();
            showToast('Sync: Orders updated from another session.', 'info');
        } else if (e.key === STORAGE_KEYS.MENU) {
            const updatedMenu = loadFromStorage(STORAGE_KEYS.MENU);
            if (updatedMenu) {
                menuManager = new MenuArrayManager(updatedMenu);
                renderMenuGrid();
                renderStaffMenuTable();
            }
        }
    });
}

// ============================================================================
// UI NAVIGATION & ROLE TOGGLE
// ============================================================================

function switchRole(role) {
    currentRole = role;
    const btnStudent = document.getElementById('btnRoleStudent');
    const btnStaff = document.getElementById('btnRoleStaff');
    const navStudent = document.getElementById('navGroupStudent');
    const navStaff = document.getElementById('navGroupStaff');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userSubtext = document.getElementById('userSubtext');
    const topBarTitle = document.getElementById('topBarTitle');

    if (role === 'student') {
        btnStudent.classList.add('active');
        btnStaff.classList.remove('active');
        navStudent.style.display = 'block';
        navStaff.style.display = 'none';
        userAvatar.innerText = 'R';
        userAvatar.style.background = 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)';
        userName.innerText = 'Riya Sharma';
        userSubtext.innerText = 'CSE 2nd Yr • CB-2024-8842';
        topBarTitle.innerText = 'Student Food Ordering Portal';
        navigateView('view-student-menu');
    } else {
        btnStaff.classList.add('active');
        btnStudent.classList.remove('active');
        navStaff.style.display = 'block';
        navStudent.style.display = 'none';
        userAvatar.innerText = 'C';
        userAvatar.style.background = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
        userName.innerText = 'Chef Anand';
        userSubtext.innerText = 'Kitchen Lead • Counter 2';
        topBarTitle.innerText = 'Canteen Staff Command Center';
        navigateView('view-staff-queue');
        renderStaffViews();
    }
}

function navigateView(viewId) {
    // Hide all view sections
    const views = document.querySelectorAll('.view-section');
    views.forEach(v => v.classList.remove('active'));

    // Show target section
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.add('active');
    }

    // Update active nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('data-view') === viewId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Update breadcrumb
    const breadcrumb = document.getElementById('topBarBreadcrumb');
    const viewNames = {
        'view-student-menu': 'Campus Bites / Menu Catalog',
        'view-student-orders': 'Campus Bites / Live Order Tracker',
        'view-staff-queue': 'Staff Command / FIFO Kitchen Queue',
        'view-staff-orders': 'Staff Command / Scheduled Orders',
        'view-staff-menu': 'Staff Command / Menu Inventory Manager',
        'view-staff-analytics': 'Staff Command / Simulation Lab',
        'view-simulation-lab': 'Campus Bites / Interactive Simulation Lab',
        'view-dsa-docs': 'Campus Bites / Academic DSA Specification'
    };
    if (breadcrumb && viewNames[viewId]) {
        breadcrumb.innerText = viewNames[viewId];
    }

    // View specific refreshes
    if (viewId === 'view-student-orders') {
        updateActiveOrderTracker();
        renderStudentOrderHistory();
    } else if (viewId === 'view-staff-queue' || viewId === 'view-staff-orders') {
        renderStaffViews();
    } else if (viewId === 'view-staff-menu') {
        renderStaffMenuTable();
    } else if (viewId === 'view-simulation-lab' || viewId === 'view-staff-analytics') {
        if (window.simLab) {
            window.simLab.renderArrayVisualizer();
            window.simLab.renderQueueVisualizer();
            window.simLab.renderSortVisualizer();
            window.simLab.renderRushUI();
        }
    }
}

// ============================================================================
// STUDENT MENU CATALOG (ARRAY OPERATIONS)
// ============================================================================

function filterMenuCategory(category, element) {
    currentCategory = category;
    document.querySelectorAll('.cat-pill').forEach(btn => btn.classList.remove('active'));
    if (element) element.classList.add('active');
    renderMenuGrid();
}

function handleMenuSearch(query) {
    renderMenuGrid(query);
}

function renderMenuGrid(searchQuery = '') {
    const grid = document.getElementById('menuCardsGrid');
    if (!grid) return;

    let items;
    if (searchQuery.trim()) {
        // Demonstrate Linear Search O(n)
        items = menuManager.search(searchQuery);
    } else {
        // Demonstrate Category Filter O(n)
        items = menuManager.filterByCategory(currentCategory);
    }

    const countBadge = document.getElementById('menuCountBadge');
    const statsText = document.getElementById('catalogStatsText');
    if (countBadge) countBadge.innerText = menuManager.count();
    if (statsText) statsText.innerText = `Showing ${items.length} of ${menuManager.count()} items`;

    if (items.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align:center; padding: 3rem; background:white; border-radius:16px; border:1px solid #e2e8f0;">
                <p style="font-size:1.1rem; font-weight:700; color:#0f172a;">No food items found matching your criteria.</p>
                <p style="font-size:0.85rem; color:#64748b; margin-top:0.35rem;">Try searching for another dish or clear category filters.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = items.map(item => {
        const inCartQty = studentCart[item.id] || 0;
        return `
            <div class="food-card ${!item.isAvailable ? 'sold-out' : ''}">
                <div class="food-card-img-wrap">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                    <div class="food-badge-overlay">
                        <span class="badge ${item.isVeg ? 'badge-veg' : 'badge-nonveg'}">
                            ${item.isVeg ? '● Pure Veg' : '▲ Non-Veg'}
                        </span>
                    </div>
                    <div class="food-prep-overlay">⏱️ ${item.prepTimeMins} mins prep</div>
                </div>
                <div class="food-card-body">
                    <div>
                        <h4 class="food-name">${item.name}</h4>
                        <p class="food-desc">${item.description}</p>
                    </div>
                    <div class="food-card-footer">
                        <span class="food-price">₹${item.price}</span>
                        ${item.isAvailable ? `
                            <button class="add-btn" onclick="addToCart('${item.id}')">
                                ${inCartQty > 0 ? `In Cart (${inCartQty}) +` : `Add to Cart +`}
                            </button>
                        ` : `
                            <span class="badge badge-status status-collected">Sold Out</span>
                        `}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function quickAddSpecial(itemId) {
    addToCart(itemId);
    showToast('Added Today\'s Special to your pre-order cart!', 'success');
}

// ============================================================================
// STUDENT CART & BILLING CALCULATIONS
// ============================================================================

function addToCart(itemId) {
    const item = menuManager.findById(itemId);
    if (!item || !item.isAvailable) {
        showToast('Sorry, this food item is currently sold out.', 'error');
        return;
    }
    studentCart[itemId] = (studentCart[itemId] || 0) + 1;
    updateCartUI();
    renderMenuGrid();
}

function decrementCart(itemId) {
    if (!studentCart[itemId]) return;
    studentCart[itemId]--;
    if (studentCart[itemId] <= 0) {
        delete studentCart[itemId];
    }
    updateCartUI();
    renderMenuGrid();
}

function removeFromCart(itemId) {
    delete studentCart[itemId];
    updateCartUI();
    renderMenuGrid();
}

function updateCartUI() {
    const container = document.getElementById('cartItemsContainer');
    const badge = document.getElementById('cartBadgeCount');
    const subtotalEl = document.getElementById('billSubtotal');
    const discountEl = document.getElementById('billDiscount');
    const totalEl = document.getElementById('billTotal');
    const checkoutBtn = document.getElementById('btnPlaceOrder');

    const itemIds = Object.keys(studentCart);
    const totalCount = itemIds.reduce((sum, id) => sum + studentCart[id], 0);

    if (badge) badge.innerText = `${totalCount} item${totalCount === 1 ? '' : 's'}`;

    if (itemIds.length === 0) {
        if (container) {
            container.innerHTML = `
                <div style="text-align:center; padding: 2rem 0; color: var(--text-muted); font-size: 0.85rem;">
                    🛒 Your pre-order cart is empty.<br>Add items from the menu to skip the queue!
                </div>
            `;
        }
        if (subtotalEl) subtotalEl.innerText = '₹0';
        if (discountEl) discountEl.innerText = '-₹0';
        if (totalEl) totalEl.innerText = '₹0';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    let subtotal = 0;
    let html = '';

    itemIds.forEach(id => {
        const item = menuManager.findById(id);
        if (item) {
            const qty = studentCart[id];
            const itemTotal = item.price * qty;
            subtotal += itemTotal;
            html += `
                <div class="cart-item-row">
                    <div class="cart-item-info">
                        <h5>${item.name}</h5>
                        <span>₹${item.price} × ${qty} = ₹${itemTotal}</span>
                    </div>
                    <div class="stepper">
                        <button class="stepper-btn" onclick="decrementCart('${item.id}')">-</button>
                        <span class="stepper-qty">${qty}</span>
                        <button class="stepper-btn" onclick="addToCart('${item.id}')">+</button>
                    </div>
                </div>
            `;
        }
    });

    // 20% Student Subsidy Discount (from original project specification)
    const discount = Math.round(subtotal * 0.20);
    const total = subtotal - discount;

    if (container) container.innerHTML = html;
    if (subtotalEl) subtotalEl.innerText = `₹${subtotal}`;
    if (discountEl) discountEl.innerText = `-₹${discount}`;
    if (totalEl) totalEl.innerText = `₹${total}`;
    if (checkoutBtn) checkoutBtn.disabled = false;
}

function handlePickupSlotChange() {
    // Optional slot validation or warning if nearing capacity
    const slot = document.getElementById('pickupSlotSelect').value;
    const count = getSlotOccupancy(slot);
    if (count >= 10) {
        showToast(`Notice: ${slot} slot is heavily booked. Expect slight wait.`, 'info');
    }
}

// ============================================================================
// ORDER CREATION & FIFO QUEUE ENQUEUE
// ============================================================================

function generateUniqueOrderId() {
    const timestamp = Date.now().toString().slice(-4);
    const randomSalt = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `CB-${timestamp}-${randomSalt}`;
}

function placeStudentOrder() {
    const itemIds = Object.keys(studentCart);
    if (itemIds.length === 0) {
        showToast('Please add items to your cart first.', 'error');
        return;
    }

    const pickupSlot = document.getElementById('pickupSlotSelect').value;
    const payModeRadio = document.querySelector('input[name="payMethod"]:checked');
    const payMode = payModeRadio ? payModeRadio.value : 'UPI';

    let subtotal = 0;
    const orderItems = [];

    itemIds.forEach(id => {
        const item = menuManager.findById(id);
        if (item) {
            const qty = studentCart[id];
            subtotal += item.price * qty;
            orderItems.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: qty,
                total: item.price * qty
            });
        }
    });

    const discount = Math.round(subtotal * 0.20);
    const finalAmount = subtotal - discount;

    // Generate guaranteed unique ID
    let orderId = generateUniqueOrderId();
    while (allOrders.some(o => o.id === orderId)) {
        orderId = generateUniqueOrderId();
    }

    const newOrder = {
        id: orderId,
        studentName: 'Riya Sharma',
        studentId: 'CB-2024-8842',
        studentDept: 'CSE 2nd Year',
        items: orderItems,
        subtotal: subtotal,
        discount: discount,
        totalAmount: finalAmount,
        paymentMode: payMode,
        pickupTime: pickupSlot,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'In Queue', // 'In Queue' -> 'Preparing' -> 'Ready' -> 'Collected'
        counter: 'Counter 2'
    };

    // 1. Enqueue into FIFO OrderQueue Data Structure
    kitchenQueue.enqueue(newOrder);

    // 2. Append to All Orders Array
    allOrders.push(newOrder);

    // 3. Persist State
    saveToStorage(STORAGE_KEYS.ORDERS, allOrders);
    saveToStorage(STORAGE_KEYS.ACTIVE_ORDER, orderId);
    activeStudentOrderId = orderId;

    // 4. Clear Cart
    studentCart = {};
    updateCartUI();
    renderMenuGrid();

    // 5. Switch to Tracking View & Notify
    showToast(`Order ${orderId} successfully placed! Enqueued at position #${kitchenQueue.size()}.`, 'success');
    navigateView('view-student-orders');
    updateActiveOrderTracker();
    renderStudentOrderHistory();
    renderStaffViews();
    updateDSAConsoleDiagnostics();
}

// ============================================================================
// STUDENT ACTIVE ORDER TRACKING (QUEUE.FINDPOSITION)
// ============================================================================

function updateActiveOrderTracker() {
    const activeOrder = allOrders.find(o => o.id === activeStudentOrderId);
    const titleEl = document.getElementById('trackerOrderTitle');
    const badgeEl = document.getElementById('trackerOrderIdDisplay');
    const lineFill = document.getElementById('progressLineFill');
    const posHeading = document.getElementById('queuePositionHeading');
    const posDetails = document.getElementById('queuePositionDetails');
    const statusChip = document.getElementById('queueStatusChip');
    const summaryWrap = document.getElementById('activeOrderSummaryWrap');

    const steps = ['step-placed', 'step-queued', 'step-preparing', 'step-ready', 'step-collected'];
    steps.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.className = 'progress-step';
    });

    if (!activeOrder) {
        if (titleEl) titleEl.innerText = 'No Active Orders Currently';
        if (badgeEl) badgeEl.innerText = 'STANDBY';
        if (lineFill) lineFill.style.width = '0%';
        if (posHeading) posHeading.innerText = 'Ready to Order?';
        if (posDetails) posDetails.innerText = 'Browse today’s menu and pre-order to skip the counter queue.';
        if (statusChip) {
            statusChip.innerText = 'EMPTY';
            statusChip.className = 'badge badge-status status-collected font-mono';
        }
        if (summaryWrap) summaryWrap.innerHTML = '';
        return;
    }

    if (titleEl) titleEl.innerText = `Active Order for ${activeOrder.pickupTime}`;
    if (badgeEl) badgeEl.innerText = `${activeOrder.id} • ${activeOrder.counter}`;

    // Compute queue position using OrderQueue.findPosition()
    const queuePos = kitchenQueue.findPosition(activeOrder.id);

    // Determine Pipeline Stage
    let fillPercent = '0%';
    const stepPlaced = document.getElementById('step-placed');
    const stepQueued = document.getElementById('step-queued');
    const stepPreparing = document.getElementById('step-preparing');
    const stepReady = document.getElementById('step-ready');
    const stepCollected = document.getElementById('step-collected');

    stepPlaced.classList.add('completed');

    if (activeOrder.status === 'In Queue') {
        fillPercent = '25%';
        stepQueued.classList.add('active');
        posHeading.innerText = `In Kitchen Queue — Position #${queuePos}`;
        posDetails.innerText = queuePos === 1 
            ? 'Your order is NEXT to be prepared! The chef will start momentarily.'
            : `There are ${queuePos - 1} order(s) ahead of you in the FIFO queue.`;
        statusChip.innerText = `QUEUE #${queuePos}`;
        statusChip.className = 'badge badge-status status-queue font-mono';
    } else if (activeOrder.status === 'Preparing') {
        fillPercent = '50%';
        stepQueued.classList.add('completed');
        stepPreparing.classList.add('active');
        posHeading.innerText = 'Order is Currently Being Prepared!';
        posDetails.innerText = 'Chef Anand is currently preparing your meal at Counter 2. Get ready for pickup!';
        statusChip.innerText = 'PREPARING';
        statusChip.className = 'badge badge-status status-preparing font-mono';
    } else if (activeOrder.status === 'Ready') {
        fillPercent = '75%';
        stepQueued.classList.add('completed');
        stepPreparing.classList.add('completed');
        stepReady.classList.add('active');
        posHeading.innerText = '🎉 Your Food is Hot & Ready for Pickup!';
        posDetails.innerText = `Please head to Counter 2 and show Order ID ${activeOrder.id} to collect your meal.`;
        statusChip.innerText = 'READY AT COUNTER 2';
        statusChip.className = 'badge badge-status status-ready font-mono';
    } else if (activeOrder.status === 'Collected') {
        fillPercent = '100%';
        stepQueued.classList.add('completed');
        stepPreparing.classList.add('completed');
        stepReady.classList.add('completed');
        stepCollected.classList.add('completed');
        posHeading.innerText = 'Order Completed & Collected';
        posDetails.innerText = 'Thank you for dining with Campus Bites. Enjoy your meal!';
        statusChip.innerText = 'COLLECTED';
        statusChip.className = 'badge badge-status status-collected font-mono';
    }

    if (lineFill) lineFill.style.width = fillPercent;

    // Render Order Items
    if (summaryWrap) {
        summaryWrap.innerHTML = `
            <div style="background:#f8fafc; border-radius:12px; padding:1.25rem; border:1px solid #e2e8f0;">
                <div style="display:flex; justify-content:space-between; margin-bottom:0.75rem;">
                    <h5 style="font-size:0.9rem; font-weight:700;">Order Contents</h5>
                    <span class="font-mono" style="font-size:0.8rem; color:#64748b;">Pickup Slot: ${activeOrder.pickupTime}</span>
                </div>
                <div style="display:flex; flex-direction:column; gap:0.4rem; font-size:0.85rem;">
                    ${activeOrder.items.map(it => `
                        <div style="display:flex; justify-content:space-between;">
                            <span>${it.name} × ${it.quantity}</span>
                            <span class="font-mono">₹${it.total}</span>
                        </div>
                    `).join('')}
                </div>
                <div style="border-top:1px dashed #cbd5e1; margin-top:0.75rem; padding-top:0.75rem; display:flex; justify-content:space-between; font-weight:800;">
                    <span>Total Paid (${activeOrder.paymentMode})</span>
                    <span class="font-mono" style="color:#ea580c;">₹${activeOrder.totalAmount}</span>
                </div>
            </div>
        `;
    }
}

function renderStudentOrderHistory() {
    const tbody = document.getElementById('studentHistoryTableBody');
    const badge = document.getElementById('studentOrdersBadge');
    const countText = document.getElementById('historyOrderCount');

    if (badge) badge.innerText = allOrders.length;
    if (countText) countText.innerText = `${allOrders.length} order${allOrders.length === 1 ? '' : 's'} recorded`;

    if (!tbody) return;

    if (allOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">
                    No past orders found in local storage.
                </td>
            </tr>
        `;
        return;
    }

    // Display most recent orders first
    const reversed = [...allOrders].reverse();

    tbody.innerHTML = reversed.map(order => {
        const itemsSummary = order.items.map(i => `${i.name} (${i.quantity})`).join(', ');
        const statusClass = order.status === 'Ready' ? 'status-ready' :
                            order.status === 'Preparing' ? 'status-preparing' :
                            order.status === 'In Queue' ? 'status-queue' : 'status-collected';
        return `
            <tr>
                <td class="font-mono" style="font-weight:700;">${order.id}</td>
                <td>${itemsSummary}</td>
                <td class="font-mono">${order.pickupTime}</td>
                <td class="font-mono">₹${order.totalAmount}</td>
                <td><span class="badge badge-status ${statusClass} font-mono">${order.status}</span></td>
                <td>
                    <button class="header-btn" style="height:28px; padding:0 8px; font-size:0.72rem;" onclick="trackSpecificOrder('${order.id}')">
                        Track
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function trackSpecificOrder(orderId) {
    activeStudentOrderId = orderId;
    saveToStorage(STORAGE_KEYS.ACTIVE_ORDER, orderId);
    navigateView('view-student-orders');
    updateActiveOrderTracker();
}

// ============================================================================
// STAFF COMMAND CENTER (FIFO QUEUE & SORTING ALGORITHMS)
// ============================================================================

function renderStaffViews() {
    renderStaffMetrics();
    renderStaffQueueBoard();
    renderStaffScheduledOrdersTable();
    renderSlotCapacity();
    updateDSAConsoleDiagnostics();
}

function renderStaffMetrics() {
    const queueOrders = allOrders.filter(o => o.status === 'In Queue');
    const preparingOrders = allOrders.filter(o => o.status === 'Preparing');
    const readyOrders = allOrders.filter(o => o.status === 'Ready');

    const qEl = document.getElementById('staffKpiQueueCount');
    const pEl = document.getElementById('staffKpiPreparingCount');
    const rEl = document.getElementById('staffKpiReadyCount');
    const tEl = document.getElementById('staffKpiTotalOrders');
    const badgeEl = document.getElementById('staffQueueBadge');
    const kpiQueueDepth = document.getElementById('kpiQueueDepth');

    if (qEl) qEl.innerText = queueOrders.length;
    if (pEl) pEl.innerText = preparingOrders.length;
    if (rEl) rEl.innerText = readyOrders.length;
    if (tEl) tEl.innerText = allOrders.length;
    if (badgeEl) badgeEl.innerText = queueOrders.length;
    if (kpiQueueDepth) kpiQueueDepth.innerText = queueOrders.length;
}

/**
 * Renders the FIFO Queue Hero (peek) and the sequential visual token pipeline
 */
function renderStaffQueueBoard() {
    const heroTitle = document.getElementById('nextOrderTitle');
    const heroItems = document.getElementById('nextOrderItems');
    const btnDequeue = document.getElementById('btnDequeueNext');
    const tokenStrip = document.getElementById('fifoTokenStrip');
    const activeTbody = document.getElementById('staffActiveOrdersTableBody');
    const tokenCount = document.getElementById('queueTokenCountText');

    // 1. Peek at head of FIFO Queue using OrderQueue.peek()
    const nextOrder = kitchenQueue.peek();

    if (nextOrder) {
        heroTitle.innerText = `Next: Order ${nextOrder.id} (${nextOrder.studentName})`;
        heroItems.innerText = `${nextOrder.items.map(i => `${i.name} × ${i.quantity}`).join(', ')} — Due at ${nextOrder.pickupTime}`;
        if (btnDequeue) btnDequeue.disabled = false;
    } else {
        heroTitle.innerText = 'Next Order in Line: None';
        heroItems.innerText = 'The preparation queue is currently empty. Waiting for incoming student orders.';
        if (btnDequeue) btnDequeue.disabled = true;
    }

    // 2. Render FIFO Visual Token Pipeline
    const queuedArray = kitchenQueue.toArray();
    if (tokenCount) tokenCount.innerText = `${queuedArray.length} order${queuedArray.length === 1 ? '' : 's'} waiting`;

    if (queuedArray.length === 0) {
        tokenStrip.innerHTML = `
            <div style="padding:1.5rem; color:var(--text-muted); font-size:0.85rem;">
                Queue is empty. New orders placed by students appear here in strict FIFO order.
            </div>
        `;
    } else {
        tokenStrip.innerHTML = queuedArray.map((order, idx) => `
            <div class="fifo-token ${idx === 0 ? 'token-preparing' : ''}">
                <div class="fifo-token-pos">Position #${idx + 1} in FIFO Line</div>
                <div class="fifo-token-id">${order.id}</div>
                <div class="fifo-token-items">${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
                <div style="font-size:0.7rem; color:#ea580c; margin-top:4px; font-weight:600;">Pickup: ${order.pickupTime}</div>
            </div>
        `).join('');
    }

    // 3. Render Table of Active In-Progress Orders (Preparing & Ready)
    const activeList = allOrders.filter(o => o.status === 'Preparing' || o.status === 'Ready' || o.status === 'In Queue');

    if (!activeTbody) return;

    if (activeList.length === 0) {
        activeTbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding: 2rem; color: var(--text-muted);">
                    No kitchen orders currently active.
                </td>
            </tr>
        `;
        return;
    }

    activeTbody.innerHTML = activeList.map(order => {
        const statusClass = order.status === 'Ready' ? 'status-ready' :
                            order.status === 'Preparing' ? 'status-preparing' : 'status-queue';
        return `
            <tr>
                <td class="font-mono" style="font-weight:700;">${order.id}</td>
                <td>
                    <strong>${order.studentName}</strong><br>
                    <span style="font-size:0.75rem; color:#64748b;">${order.studentDept}</span>
                </td>
                <td>${order.items.map(i => `${i.name} (${i.quantity})`).join(', ')}</td>
                <td class="font-mono">${order.pickupTime}</td>
                <td><span class="badge badge-status ${statusClass} font-mono">${order.status}</span></td>
                <td>
                    ${order.status === 'In Queue' ? `
                        <button class="header-btn header-btn-primary" style="height:28px; padding:0 8px; font-size:0.72rem;" onclick="staffPromoteToPreparing('${order.id}')">
                            Start Prep
                        </button>
                    ` : order.status === 'Preparing' ? `
                        <button class="header-btn" style="height:28px; padding:0 8px; font-size:0.72rem; background:#ecfdf5; color:#047857; border-color:#a7f3d0;" onclick="staffMarkOrderReady('${order.id}')">
                            Mark Ready ✓
                        </button>
                    ` : `
                        <button class="header-btn" style="height:28px; padding:0 8px; font-size:0.72rem;" onclick="staffMarkOrderCollected('${order.id}')">
                            Mark Collected
                        </button>
                    `}
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Staff Action: Dequeue the front order and start cooking
 */
function staffProcessNextOrder() {
    if (kitchenQueue.isEmpty()) {
        showToast('Empty Queue: No orders waiting to be dequeued.', 'error');
        return;
    }

    // Call native OrderQueue.dequeue()
    const dequeuedOrder = kitchenQueue.dequeue();
    
    // Update master order status
    const target = allOrders.find(o => o.id === dequeuedOrder.id);
    if (target) {
        target.status = 'Preparing';
        saveToStorage(STORAGE_KEYS.ORDERS, allOrders);
    }

    showToast(`Dequeued ${dequeuedOrder.id}. Status transitioned to "Preparing".`, 'success');
    renderStaffViews();
    updateActiveOrderTracker();
}

function staffPromoteToPreparing(orderId) {
    // If order was at head, dequeue it
    const head = kitchenQueue.peek();
    if (head && head.id === orderId) {
        staffProcessNextOrder();
        return;
    }

    const order = allOrders.find(o => o.id === orderId);
    if (order) {
        order.status = 'Preparing';
        rebuildKitchenQueue();
        saveToStorage(STORAGE_KEYS.ORDERS, allOrders);
        showToast(`Order ${orderId} moved to Preparing.`, 'success');
        renderStaffViews();
        updateActiveOrderTracker();
    }
}

function staffMarkOrderReady(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (order) {
        order.status = 'Ready';
        saveToStorage(STORAGE_KEYS.ORDERS, allOrders);
        showToast(`Order ${orderId} marked Ready for Counter Pickup!`, 'success');
        renderStaffViews();
        updateActiveOrderTracker();
    }
}

function staffMarkOrderCollected(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (order) {
        order.status = 'Collected';
        saveToStorage(STORAGE_KEYS.ORDERS, allOrders);
        showToast(`Order ${orderId} marked Collected by student.`, 'info');
        renderStaffViews();
        updateActiveOrderTracker();
    }
}

// ============================================================================
// SCHEDULED ORDERS & CHRONOLOGICAL SORTING ALGORITHMS
// ============================================================================

function switchSortAlgorithm(algo) {
    currentSortAlgo = algo;
    const btnInsertion = document.getElementById('btnAlgoInsertion');
    const btnMerge = document.getElementById('btnAlgoMerge');
    const desc = document.getElementById('sortAlgoDescription');

    if (algo === 'insertion') {
        btnInsertion.classList.add('active');
        btnMerge.classList.remove('active');
        desc.innerText = 'Active: Insertion Sort — Adaptive in-place O(n) best-case for online arriving orders.';
    } else {
        btnMerge.classList.add('active');
        btnInsertion.classList.remove('active');
        desc.innerText = 'Active: Merge Sort — Divide-and-conquer stable O(n log n) sorting guarantee.';
    }

    renderStaffScheduledOrdersTable();
}

function renderStaffScheduledOrdersTable() {
    const tbody = document.getElementById('scheduledOrdersTableBody');
    const benchmarkText = document.getElementById('sortBenchmarkText');
    if (!tbody) return;

    if (allOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; padding: 2rem; color: var(--text-muted);">
                    No scheduled pre-orders recorded.
                </td>
            </tr>
        `;
        return;
    }

    // Benchmark the custom sorting algorithm execution
    const t0 = performance.now();
    let sortedOrders;

    if (currentSortAlgo === 'insertion') {
        // Genuine Insertion Sort
        sortedOrders = OrderSorter.insertionSortByPickupTime(allOrders);
    } else {
        // Genuine Merge Sort
        sortedOrders = OrderSorter.mergeSortByPickupTime(allOrders);
    }

    const t1 = performance.now();
    const elapsedUs = ((t1 - t0) * 1000).toFixed(2);
    if (benchmarkText) {
        benchmarkText.innerText = `Sort Execution (${currentSortAlgo}): ${elapsedUs} µs`;
    }

    tbody.innerHTML = sortedOrders.map((order, idx) => {
        const statusClass = order.status === 'Ready' ? 'status-ready' :
                            order.status === 'Preparing' ? 'status-preparing' :
                            order.status === 'In Queue' ? 'status-queue' : 'status-collected';
        return `
            <tr>
                <td class="font-mono">#${idx + 1}</td>
                <td class="font-mono" style="font-weight:700; color:#ea580c;">${order.pickupTime}</td>
                <td class="font-mono" style="font-weight:600;">${order.id}</td>
                <td>${order.studentName} (${order.studentDept})</td>
                <td>${order.items.map(i => `${i.name} (${i.quantity})`).join(', ')}</td>
                <td class="font-mono">₹${order.totalAmount}</td>
                <td><span class="badge badge-status ${statusClass} font-mono">${order.status}</span></td>
                <td>
                    ${order.status === 'In Queue' ? `
                        <button class="header-btn header-btn-primary" style="height:26px; padding:0 6px; font-size:0.7rem;" onclick="staffPromoteToPreparing('${order.id}')">
                            Start Prep
                        </button>
                    ` : order.status === 'Preparing' ? `
                        <button class="header-btn" style="height:26px; padding:0 6px; font-size:0.7rem; background:#ecfdf5; color:#047857;" onclick="staffMarkOrderReady('${order.id}')">
                            Ready ✓
                        </button>
                    ` : `
                        <span style="font-size:0.75rem; color:#64748b;">${order.status}</span>
                    `}
                </td>
            </tr>
        `;
    }).join('');
}

function getSlotOccupancy(slotName) {
    return allOrders.filter(o => o.pickupTime === slotName && o.status !== 'Collected').length;
}

function renderSlotCapacity() {
    const list = document.getElementById('slotCapacityList');
    if (!list) return;

    const slots = [
        '12:15 PM',
        '12:30 PM',
        '12:45 PM',
        '01:00 PM',
        '01:15 PM',
        '01:30 PM'
    ];
    const maxCapacity = 10;

    list.innerHTML = slots.map(slot => {
        const count = getSlotOccupancy(slot);
        const percentage = Math.min(100, Math.round((count / maxCapacity) * 100));
        const colorClass = percentage >= 80 ? 'danger' : percentage >= 50 ? 'warning' : '';
        return `
            <div class="slot-item">
                <div class="slot-info">
                    <span class="font-mono">${slot}</span>
                    <span class="font-mono" style="color:${percentage >= 80 ? '#ef4444' : '#64748b'};">${count} / ${maxCapacity} orders</span>
                </div>
                <div class="slot-bar-bg">
                    <div class="slot-bar-fill ${colorClass}" style="width: ${percentage}%;"></div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================================
// STAFF MENU INVENTORY ARRAY MANAGER (CRUD OPERATIONS)
// ============================================================================

function renderStaffMenuTable() {
    const tbody = document.getElementById('staffMenuTableBody');
    if (!tbody) return;

    const items = menuManager.getAll();

    tbody.innerHTML = items.map(item => `
        <tr>
            <td class="font-mono" style="font-size:0.78rem;">${item.id}</td>
            <td>
                <strong>${item.name}</strong><br>
                <span style="font-size:0.75rem; color:#64748b;">${item.description}</span>
            </td>
            <td><span class="badge" style="background:#f1f5f9; text-transform:uppercase;">${item.category}</span></td>
            <td class="font-mono" style="font-weight:700;">₹${item.price}</td>
            <td class="font-mono">${item.prepTimeMins} mins</td>
            <td>
                <span class="badge ${item.isVeg ? 'badge-veg' : 'badge-nonveg'}">
                    ${item.isVeg ? 'Veg' : 'Non-Veg'}
                </span>
            </td>
            <td>
                <button class="header-btn" style="height:28px; padding:0 8px; font-size:0.72rem; ${item.isAvailable ? 'background:#ecfdf5; color:#047857; border-color:#a7f3d0;' : 'background:#fef2f2; color:#b91c1c; border-color:#fecaca;'}" onclick="toggleMenuItemAvailability('${item.id}')">
                    ${item.isAvailable ? '● In Stock' : '✕ Sold Out'}
                </button>
            </td>
            <td>
                <button class="header-btn" style="height:28px; padding:0 8px; font-size:0.72rem; color:#b91c1c; border-color:#fecaca;" onclick="deleteMenuItem('${item.id}')">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function toggleMenuItemAvailability(itemId) {
    try {
        const newState = menuManager.toggleAvailability(itemId);
        saveToStorage(STORAGE_KEYS.MENU, menuManager.getAll());
        renderStaffMenuTable();
        renderMenuGrid();
        showToast(`Item ${itemId} is now ${newState ? 'In Stock' : 'Sold Out'}.`, 'info');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function deleteMenuItem(itemId) {
    if (confirm(`Are you sure you want to delete menu item "${itemId}"?`)) {
        const deleted = menuManager.delete(itemId);
        if (deleted) {
            saveToStorage(STORAGE_KEYS.MENU, menuManager.getAll());
            renderStaffMenuTable();
            renderMenuGrid();
            showToast(`Menu item ${itemId} deleted from catalog.`, 'info');
        }
    }
}

function openAddMenuModal() {
    const modal = document.getElementById('addMenuModal');
    if (modal) modal.classList.add('open');
}

function closeAddMenuModal() {
    const modal = document.getElementById('addMenuModal');
    if (modal) modal.classList.remove('open');
}

function handleAddMenuSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('newMenuName').value.trim();
    const category = document.getElementById('newMenuCategory').value;
    const price = Number(document.getElementById('newMenuPrice').value);
    const prepTime = Number(document.getElementById('newMenuPrepTime').value);
    const isVeg = document.getElementById('newMenuVeg').value === 'true';
    const desc = document.getElementById('newMenuDesc').value.trim();

    const newId = `item-${Date.now().toString().slice(-4)}`;

    try {
        // Genuine Array Push
        menuManager.insert({
            id: newId,
            name: name,
            category: category,
            price: price,
            prepTimeMins: prepTime,
            isVeg: isVeg,
            description: desc,
            isAvailable: true,
            image: isVeg 
                ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'
                : 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80'
        });

        saveToStorage(STORAGE_KEYS.MENU, menuManager.getAll());
        renderStaffMenuTable();
        renderMenuGrid();
        closeAddMenuModal();
        e.target.reset();
        showToast(`Successfully inserted "${name}" into menu array!`, 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ============================================================================
// DSA CONSOLE & LIVE DIAGNOSTICS
// ============================================================================

function updateDSAConsoleDiagnostics() {
    const headEl = document.getElementById('diagQueueHead');
    const tailEl = document.getElementById('diagQueueTail');
    const sizeEl = document.getElementById('diagQueueSize');
    const emptyEl = document.getElementById('diagQueueEmpty');

    if (kitchenQueue) {
        if (headEl) headEl.innerText = kitchenQueue._head;
        if (tailEl) tailEl.innerText = kitchenQueue._tail;
        if (sizeEl) sizeEl.innerText = kitchenQueue.size();
        if (emptyEl) emptyEl.innerText = kitchenQueue.isEmpty() ? 'true' : 'false';
    }
}

// ============================================================================
// DEMO SEED DATA GENERATOR
// ============================================================================

function seedSampleOrders() {
    const demoOrders = [
        {
            id: 'CB-DEMO-101',
            studentName: 'Aarav Mehta',
            studentId: 'CB-2024-4112',
            studentDept: 'ECE 3rd Year',
            items: [{ id: 'item-1', name: 'Hyderabadi Dum Biryani', price: 120, quantity: 1, total: 120 }],
            subtotal: 120,
            discount: 24,
            totalAmount: 96,
            paymentMode: 'UPI',
            pickupTime: '12:15 PM',
            createdAt: '11:45 AM',
            status: 'In Queue',
            counter: 'Counter 2'
        },
        {
            id: 'CB-DEMO-102',
            studentName: 'Sneha Patel',
            studentId: 'CB-2024-7821',
            studentDept: 'IT 2nd Year',
            items: [
                { id: 'item-3', name: 'Crispy Masala Dosa', price: 45, quantity: 2, total: 90 },
                { id: 'item-7', name: 'Artisan Cold Coffee', price: 40, quantity: 1, total: 40 }
            ],
            subtotal: 130,
            discount: 26,
            totalAmount: 104,
            paymentMode: 'Campus Card',
            pickupTime: '12:30 PM',
            createdAt: '11:50 AM',
            status: 'In Queue',
            counter: 'Counter 2'
        },
        {
            id: 'CB-DEMO-103',
            studentName: 'Karthik Rao',
            studentId: 'CB-2024-9034',
            studentDept: 'ME 4th Year',
            items: [{ id: 'item-4', name: 'Crispy Veggie Burger', price: 70, quantity: 2, total: 140 }],
            subtotal: 140,
            discount: 28,
            totalAmount: 112,
            paymentMode: 'Counter Cash',
            pickupTime: '12:45 PM',
            createdAt: '11:55 AM',
            status: 'In Queue',
            counter: 'Counter 2'
        }
    ];

    demoOrders.forEach(o => {
        if (!allOrders.some(existing => existing.id === o.id)) {
            allOrders.push(o);
            kitchenQueue.enqueue(o);
        }
    });

    saveToStorage(STORAGE_KEYS.ORDERS, allOrders);
    renderStaffViews();
    renderStudentOrderHistory();
    updateDSAConsoleDiagnostics();
    showToast('Demo data seeded: 3 sample orders enqueued into FIFO line!', 'success');
}

// ============================================================================
// TOAST NOTIFICATIONS & UTILITY STORAGE HELPERS
// ============================================================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span style="font-size:1.1rem;">${type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ'}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 250);
    }, 3500);
}

function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.warn('LocalStorage quota or serialization error:', e);
    }
}

function loadFromStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.warn('LocalStorage parse error for key:', key, e);
        return null;
    }
}
