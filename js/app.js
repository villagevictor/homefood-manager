const KEY = "homefood_manager_v3";

const emptyState = {
    customers: [],
    menu: [],
    orders: [],
    payments: [],
    expenses: [],
    settings: {
        businessName: "HomeFood Manager",
        phone: "",
        address: "",
        currency: "ETB"
    }
};

let state = loadState();
let currentPage = "dashboard";

function clone(x){
    return JSON.parse(JSON.stringify(x));
}

function loadState(){
    try{
        const raw = localStorage.getItem(KEY);

        if(raw){
            const data = JSON.parse(raw);

            return {
                ...clone(emptyState),
                ...data,
                settings:{
                    ...clone(emptyState.settings),
                    ...(data.settings || {})
                }
            };
        }
    }catch(e){
        console.warn(e);
    }

    localStorage.setItem(KEY, JSON.stringify(emptyState));
    return clone(emptyState);
}

function saveState(){
    localStorage.setItem(KEY, JSON.stringify(state));
}

function currency(){
    return state.settings.currency || "ETB";
}

function money(n){
    return `${currency()} ${Number(n || 0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
}

function dateNow(){
    return new Date().toISOString();
}

function today(){
    return new Date().toISOString().slice(0,10);
}

function esc(value){
    return String(value ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}

function id(){
    return Date.now() + Math.floor(Math.random()*1000);
}

function customerName(id){
    return state.customers.find(c=>String(c.id)===String(id))?.name || "Walk-in / Unknown";
}

function menuItem(id){
    return state.menu.find(m=>String(m.id)===String(id));
}

function customerBalance(customerId){
    const credit = state.orders
        .filter(o=>String(o.customerId)===String(customerId) && o.status!=="Cancelled")
        .reduce((sum,o)=>sum + Number(o.credit || 0),0);

    const paid = state.payments
        .filter(p=>String(p.customerId)===String(customerId))
        .reduce((sum,p)=>sum + Number(p.amount || 0),0);

    return Math.max(0,credit-paid);
}

function totalOutstanding(){
    return state.customers.reduce((sum,c)=>sum+customerBalance(c.id),0);
}

function ordersForToday(){
    return state.orders.filter(o=>(o.date || "").slice(0,10)===today());
}

function revenueToday(){
    return ordersForToday()
        .filter(o=>o.status!=="Cancelled")
        .reduce((sum,o)=>sum+Number(o.total||0),0);
}

function expensesToday(){
    return state.expenses
        .filter(e=>(e.date||"").slice(0,10)===today())
        .reduce((sum,e)=>sum+Number(e.amount||0),0);
}

function pendingCount(){
    return state.orders.filter(o=>o.status==="Pending" || o.status==="Preparing").length;
}

function totalRevenue(){
    return state.orders
        .filter(o=>o.status!=="Cancelled")
        .reduce((sum,o)=>sum+Number(o.total||0),0);
}

function totalExpenses(){
    return state.expenses.reduce((sum,e)=>sum+Number(e.amount||0),0);
}

function netProfit(){
    return totalRevenue()-totalExpenses();
}

function toast(message,type="success"){
    const box=document.createElement("div");
    box.className=`toast ${type}`;
    box.textContent=message;

    document.getElementById("toast-container").appendChild(box);

    setTimeout(()=>box.remove(),3000);
}

function showPage(page){
    currentPage=page;

    document.querySelectorAll(".nav-item").forEach(btn=>{
        btn.classList.toggle("active",btn.dataset.page===page);
    });

    document.querySelectorAll(".mobile-nav button").forEach(btn=>{
        btn.classList.toggle("active",btn.dataset.page===page);
    });

    const renders={
        dashboard:renderDashboard,
        customers:renderCustomers,
        orders:renderOrders,
        payments:renderPayments,
        credit:renderCredit,
        menu:renderMenu,
        expenses:renderExpenses,
        reports:renderReports,
        settings:renderSettings
    };

    (renders[page] || renderDashboard)();

    document.getElementById("sidebar").classList.remove("open");
}

function toggleSidebar(){
    document.getElementById("sidebar").classList.toggle("open");
}

function pageHead(title,subtitle,button=""){
    return `
        <div class="page-head">
            <div>
                <h1>${title}</h1>
                <p>${subtitle}</p>
            </div>
            ${button}
        </div>
    `;
}

function renderDashboard(){

    const orders=ordersForToday();

    document.getElementById("main").innerHTML=`

    ${pageHead(
        "Dashboard",
        `${new Date().toLocaleDateString()} · Business overview`
    )}

    <div class="stats-grid">

        <div class="card stat">
            <div class="stat-top">
                <span>Total Revenue</span>
                <div class="stat-icon">💰</div>
            </div>
            <div class="stat-value">${money(totalRevenue())}</div>
            <div class="stat-note">All non-cancelled orders</div>
        </div>

        <div class="card stat">
            <div class="stat-top">
                <span>Pending Orders</span>
                <div class="stat-icon">🛒</div>
            </div>
            <div class="stat-value">${pendingCount()}</div>
            <div class="stat-note">Pending + preparing</div>
        </div>

        <div class="card stat">
            <div class="stat-top">
                <span>Outstanding Credit</span>
                <div class="stat-icon">📒</div>
            </div>
            <div class="stat-value amount-negative">${money(totalOutstanding())}</div>
            <div class="stat-note">Customer debt</div>
        </div>

        <div class="card stat">
            <div class="stat-top">
                <span>Total Expenses</span>
                <div class="stat-icon">💸</div>
            </div>
            <div class="stat-value">${money(totalExpenses())}</div>
            <div class="stat-note">All recorded expenses</div>
        </div>

        <div class="card stat">
            <div class="stat-top">
                <span>Net Profit</span>
                <div class="stat-icon">📈</div>
            </div>
            <div class="stat-value ${netProfit()>=0?"amount-positive":"amount-negative"}">
                ${money(netProfit())}
            </div>
            <div class="stat-note">Revenue minus expenses</div>
        </div>

    </div>

    <div class="dashboard-grid">

        <div>

            <div class="card section-card">

                <div class="section-title">
                    <h2>Quick Actions</h2>
                </div>

                <div class="quick-actions">

                    <button class="quick" onclick="showPage('orders')">
                        <div class="quick-icon">🛒</div>
                        <strong>New Order</strong>
                    </button>

                    <button class="quick" onclick="showPage('customers')">
                        <div class="quick-icon">👤</div>
                        <strong>Add Customer</strong>
                    </button>

                    <button class="quick" onclick="showPage('payments')">
                        <div class="quick-icon">💵</div>
                        <strong>Record Payment</strong>
                    </button>

                </div>

            </div>

            <div class="card section-card">

                <div class="section-title">
                    <h2>Today's Activity</h2>
                    <button class="btn btn-secondary btn-small" onclick="showPage('reports')">Reports</button>
                </div>

                <div class="report-grid">

                    <div class="card report-number">
                        <div class="label">Today's Revenue</div>
                        <div class="value">${money(revenueToday())}</div>
                    </div>

                    <div class="card report-number">
                        <div class="label">Today's Orders</div>
                        <div class="value">${orders.length}</div>
                    </div>

                    <div class="card report-number">
                        <div class="label">Today's Expenses</div>
                        <div class="value">${money(expensesToday())}</div>
                    </div>

                </div>

            </div>

        </div>

        <div class="card section-card">

            <div class="section-title">
                <h2>Recent Orders</h2>
                <button class="btn btn-secondary btn-small" onclick="showPage('orders')">View All</button>
            </div>

            ${recentOrdersHTML(8)}

        </div>

    </div>
    `;
}

function recentOrdersHTML(limit=8){

    const list=[...state.orders]
        .sort((a,b)=>new Date(b.createdAt||b.date)-new Date(a.createdAt||a.date))
        .slice(0,limit);

    if(!list.length){
        return emptyHTML("🛒","No orders yet","Create your first order.");
    }

    return `
    <div class="table-wrap">
    <table>
        <thead>
            <tr>
                <th>Customer</th>
                <th>Date</th>
                <th>Meal</th>
                <th>Total</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
        ${list.map(o=>`
            <tr>
                <td>${esc(customerName(o.customerId))}</td>
                <td>${esc(o.date||"")}</td>
                <td>${esc(o.meal||"-")}</td>
                <td>${money(o.total)}</td>
                <td>${statusBadge(o.status)}</td>
            </tr>
        `).join("")}
        </tbody>
    </table>
    </div>`;
}

function statusBadge(status){

    const cls={
        Paid:"badge-green",
        Partial:"badge-orange",
        Credit:"badge-red",
        Pending:"badge-orange",
        Preparing:"badge-orange",
        Delivered:"badge-green",
        Cancelled:"badge-red"
    }[status] || "badge-gray";

    return `<span class="badge ${cls}">${esc(status)}</span>`;
}

function emptyHTML(icon,title,text){
    return `
        <div class="empty">
            <div class="empty-icon">${icon}</div>
            <strong>${title}</strong>
            <div>${text}</div>
        </div>
    `;
}

function renderCustomers(){

    const list=state.customers;

    document.getElementById("main").innerHTML=`

    ${pageHead(
        "Customers",
        `${list.length} customer${list.length===1?"":"s"} registered`,
        `<button class="btn btn-primary" onclick="openCustomerModal()">＋ Add Customer</button>`
    )}

    <div class="card section-card">

        <div class="search-row">
            <input id="customerSearch" placeholder="Search name, phone or address..." oninput="filterCustomers()">
        </div>

        <div id="customerList">
            ${customersHTML(list)}
        </div>

    </div>
    `;
}

function customersHTML(list){

    if(!list.length){
        return emptyHTML("👥","No customers yet","Add your first customer to start creating orders.");
    }

    return `
    <div class="customer-grid">
    ${list.map(c=>{

        const balance=customerBalance(c.id);
        const initial=(c.name||"?").charAt(0).toUpperCase();

        return `
        <div class="card customer-card">

            <div class="customer-avatar">${esc(initial)}</div>

            <h3>${esc(c.name)}</h3>

            <div class="muted small">📞 ${esc(c.phone||"-")}</div>
            <div class="muted small">📍 ${esc(c.address||"-")}</div>

            <div style="margin-top:12px">
                <span class="badge ${c.type==="Credit"?"badge-orange":"badge-blue"}">
                    ${esc(c.type||"Regular")}
                </span>
            </div>

            <div style="margin-top:13px">
                <div class="small muted">Current Balance</div>
                <strong class="${balance>0?"amount-negative":"amount-positive"}">
                    ${money(balance)}
                </strong>
            </div>

            <div class="actions" style="margin-top:14px">

                <button class="btn btn-secondary btn-small"
                    onclick="customerProfile(${c.id})">
                    Profile
                </button>

                <button class="btn btn-primary btn-small"
                    onclick="openCustomerModal(${c.id})">
                    Edit
                </button>

            </div>

        </div>`;
    }).join("")}
    </div>`;
}

function filterCustomers(){

    const q=(document.getElementById("customerSearch")?.value||"").toLowerCase();

    const filtered=state.customers.filter(c=>
        `${c.name} ${c.phone} ${c.address}`.toLowerCase().includes(q)
    );

    document.getElementById("customerList").innerHTML=customersHTML(filtered);
}

function openCustomerModal(customerId=null){

    const c=customerId ? state.customers.find(x=>x.id===customerId) : null;

    document.getElementById("modal-container").innerHTML=`

    <div class="modal-backdrop" onclick="closeModal(event)">

        <div class="modal" onclick="event.stopPropagation()">

            <div class="modal-head">
                <h2>${c?"Edit Customer":"Add Customer"}</h2>
                <button class="modal-close" onclick="closeModal()">✕</button>
            </div>

            <div class="modal-body">

                <form onsubmit="saveCustomer(event,${customerId||"null"})">

                    <div class="form-grid">

                        <div class="field">
                            <label>Name *</label>
                            <input id="customerName" required value="${esc(c?.name||"")}">
                        </div>

                        <div class="field">
                            <label>Phone</label>
                            <input id="customerPhone" value="${esc(c?.phone||"")}" inputmode="tel">
                        </div>

                        <div class="field full">
                            <label>Address</label>
                            <input id="customerAddress" value="${esc(c?.address||"")}">
                        </div>

                        <div class="field">
                            <label>Customer Type</label>
                            <select id="customerType">
                                ${["Regular","Credit","Company"].map(x=>
                                    `<option ${c?.type===x?"selected":""}>${x}</option>`
                                ).join("")}
                            </select>
                        </div>

                        <div class="field">
                            <label>Credit Limit</label>
                            <input id="customerLimit" type="number" min="0" step="0.01"
                                value="${c?.creditLimit||0}">
                        </div>

                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn btn-primary">${c?"Save Changes":"Add Customer"}</button>
                    </div>

                </form>

            </div>

        </div>

    </div>
    `;
}

function saveCustomer(event,customerId){

    event.preventDefault();

    const data={
        name:document.getElementById("customerName").value.trim(),
        phone:document.getElementById("customerPhone").value.trim(),
        address:document.getElementById("customerAddress").value.trim(),
        type:document.getElementById("customerType").value,
        creditLimit:Number(document.getElementById("customerLimit").value||0)
    };

    if(!data.name){
        toast("Customer name is required","error");
        return;
    }

    if(customerId){

        const c=state.customers.find(x=>x.id===customerId);

        if(c) Object.assign(c,data);

        toast("Customer updated");

    }else{

        state.customers.push({
            id:id(),
            ...data,
            createdAt:dateNow()
        });

        toast("Customer added");
    }

    saveState();
    closeModal();
    renderCustomers();
}

function customerProfile(customerId){

    const c=state.customers.find(x=>x.id===customerId);

    if(!c) return;

    const orders=state.orders.filter(o=>String(o.customerId)===String(customerId));
    const balance=customerBalance(customerId);

    document.getElementById("modal-container").innerHTML=`

    <div class="modal-backdrop" onclick="closeModal(event)">

        <div class="modal" onclick="event.stopPropagation()">

            <div class="modal-head">
                <h2>${esc(c.name)}</h2>
                <button class="modal-close" onclick="closeModal()">✕</button>
            </div>

            <div class="modal-body">

                <div class="report-grid">

                    <div class="card report-number">
                        <div class="label">Orders</div>
                        <div class="value">${orders.length}</div>
                    </div>

                    <div class="card report-number">
                        <div class="label">Purchase Total</div>
                        <div class="value">
                            ${money(orders.filter(o=>o.status!=="Cancelled").reduce((s,o)=>s+Number(o.total||0),0))}
                        </div>
                    </div>

                    <div class="card report-number">
                        <div class="label">Current Debt</div>
                        <div class="value amount-negative">${money(balance)}</div>
                    </div>

                </div>

                <div class="section-card" style="padding:0;margin-top:18px">

                    <div class="section-title">
                        <h2>Purchase History</h2>
                    </div>

                    ${orders.length ? `
                    <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Meal</th>
                                <th>Total</th>
                                <th>Credit</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                        ${orders.map(o=>`
                            <tr>
                                <td>${esc(o.date||"")}</td>
                                <td>${esc(o.meal||"-")}</td>
                                <td>${money(o.total)}</td>
                                <td>${money(o.credit)}</td>
                                <td>${statusBadge(o.status)}</td>
                            </tr>
                        `).join("")}
                        </tbody>
                    </table>
                    </div>
                    `:emptyHTML("🧾","No purchase history","This customer has no orders yet.")}

                </div>

            </div>

        </div>

    </div>`;
}

function renderOrders(){

    document.getElementById("main").innerHTML=`

    ${pageHead(
        "Orders",
        `${state.orders.length} total orders`,
        `<button class="btn btn-primary" onclick="openOrderModal()">＋ New Order</button>`
    )}

    <div class="card section-card">

        ${state.orders.length ? `
        <div class="table-wrap">
        <table>

            <thead>
                <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Meal</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Credit</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>

            <tbody>

            ${[...state.orders].sort((a,b)=>new Date(b.createdAt||b.date)-new Date(a.createdAt||a.date)).map(o=>`

                <tr>

                    <td>${esc(o.date||"")}</td>
                    <td>${esc(customerName(o.customerId))}</td>
                    <td>${esc(o.meal||"-")}</td>
                    <td>${money(o.total)}</td>
                    <td>${money(o.paid)}</td>
                    <td class="${o.credit>0?"amount-negative":""}">${money(o.credit)}</td>
                    <td>${esc(o.paymentStatus||"-")}</td>
                    <td>${statusBadge(o.status)}</td>

                    <td>

                        <div class="actions">

                            <button class="btn btn-secondary btn-small"
                                onclick="printReceipt(${o.id})">
                                🖨
                            </button>

                            <button class="btn btn-secondary btn-small"
                                onclick="whatsappOrder(${o.id})">
                                WhatsApp
                            </button>

                            ${o.status!=="Delivered" && o.status!=="Cancelled" ?
                            `<button class="btn btn-primary btn-small" onclick="changeOrderStatus(${o.id})">Status</button>`:""}

                        </div>

                    </td>

                </tr>

            `).join("")}

            </tbody>

        </table>
        </div>
        ` : emptyHTML("🛒","No orders yet","Add customers and menu items first, then create an order.")}

    </div>
    `;
}

function openOrderModal(){

    if(!state.customers.length){
        toast("Add a customer first","error");
        showPage("customers");
        return;
    }

    if(!state.menu.filter(m=>m.available!==false).length){
        toast("Add an available menu item first","error");
        showPage("menu");
        return;
    }

    document.getElementById("modal-container").innerHTML=`

    <div class="modal-backdrop" onclick="closeModal(event)">

        <div class="modal" onclick="event.stopPropagation()">

            <div class="modal-head">
                <h2>Create New Order</h2>
                <button class="modal-close" onclick="closeModal()">✕</button>
            </div>

            <div class="modal-body">

                <form onsubmit="saveOrder(event)">

                    <div class="form-grid">

                        <div class="field">
                            <label>Customer *</label>
                            <select id="orderCustomer" required>
                                <option value="">Select customer</option>
                                ${state.customers.map(c=>
                                    `<option value="${c.id}">${esc(c.name)}${customerBalance(c.id)>0?" · debt "+money(customerBalance(c.id)):""}</option>`
                                ).join("")}
                            </select>
                        </div>

                        <div class="field">
                            <label>Date *</label>
                            <input id="orderDate" type="date" value="${today()}" required>
                        </div>

                        <div class="field">
                            <label>Meal *</label>
                            <select id="orderMeal" required>
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch" selected>Lunch</option>
                                <option value="Dinner">Dinner</option>
                            </select>
                        </div>

                        <div class="field">
                            <label>Order Status</label>
                            <select id="orderStatus">
                                <option>Pending</option>
                                <option>Preparing</option>
                                <option>Delivered</option>
                            </select>
                        </div>

                    </div>

                    <div style="margin-top:18px">

                        <div class="section-title">
                            <h2>Food Items</h2>
                            <button type="button" class="btn btn-secondary btn-small" onclick="addOrderItemRow()">
                                ＋ Add Item
                            </button>
                        </div>

                        <div id="orderItems"></div>

                    </div>

                    <div class="form-grid" style="margin-top:15px">

                        <div class="field">
                            <label>Tax</label>
                            <input id="orderTax" type="number" min="0" step="0.01" value="0" oninput="calculateOrderTotal()">
                        </div>

                        <div class="field">
                            <label>Discount</label>
                            <input id="orderDiscount" type="number" min="0" step="0.01" value="0" oninput="calculateOrderTotal()">
                        </div>

                        <div class="field">
                            <label>Payment Status</label>
                            <select id="orderPaymentStatus" onchange="calculateOrderTotal()">
                                <option value="Paid">Paid</option>
                                <option value="Partial">Partial</option>
                                <option value="Credit">Credit</option>
                            </select>
                        </div>

                        <div class="field">
                            <label>Paid Amount</label>
                            <input id="orderPaid" type="number" min="0" step="0.01" value="0" oninput="calculateOrderTotal()">
                        </div>

                        <div class="field full">
                            <label>Order Notes</label>
                            <textarea id="orderNotes" rows="3"
                                placeholder="Special request, no onion, delivery note..."></textarea>
                        </div>

                    </div>

                    <div id="orderTotals"></div>

                    <div class="form-actions">

                        <button type="button" class="btn btn-secondary" onclick="closeModal()">
                            Cancel
                        </button>

                        <button class="btn btn-primary">
                            Save Order
                        </button>

                    </div>

                </form>

            </div>

        </div>

    </div>
    `;

    addOrderItemRow();
    calculateOrderTotal();
}

function addOrderItemRow(){

    const box=document.getElementById("orderItems");

    if(!box) return;

    const row=document.createElement("div");
    row.className="order-item";

    row.innerHTML=`

        <div class="order-item-grid">

            <div class="field">
                <label>Food / Drink</label>
                <select class="item-menu" onchange="calculateOrderTotal()">
                    ${state.menu.filter(m=>m.available!==false).map(m=>
                        `<option value="${m.id}" data-price="${m.price}">
                            ${esc(m.name)} · ${money(m.price)}
                        </option>`
                    ).join("")}
                </select>
            </div>

            <div class="field">
                <label>Qty</label>
                <input class="item-qty" type="number" min="1" value="1" oninput="calculateOrderTotal()">
            </div>

            <div class="field">
                <label>Total</label>
                <input class="item-total" readonly value="${money(0)}">
            </div>

            <button type="button" class="btn btn-danger btn-small"
                onclick="this.closest('.order-item').remove();calculateOrderTotal()">
                ✕
            </button>

        </div>
    `;

    box.appendChild(row);
    calculateOrderTotal();
}

function calculateOrderTotal(){

    const rows=[...document.querySelectorAll(".order-item")];

    let subtotal=0;

    rows.forEach(row=>{

        const select=row.querySelector(".item-menu");
        const qty=Number(row.querySelector(".item-qty")?.value||0);

        const item=menuItem(select?.value);

        const total=(item?.price||0)*qty;

        const output=row.querySelector(".item-total");

        if(output) output.value=money(total);

        subtotal+=total;
    });

    const tax=Number(document.getElementById("orderTax")?.value||0);
    const discount=Number(document.getElementById("orderDiscount")?.value||0);

    const total=Math.max(0,subtotal+tax-discount);

    const status=document.getElementById("orderPaymentStatus")?.value||"Paid";

    let paid=Number(document.getElementById("orderPaid")?.value||0);

    if(status==="Paid") paid=total;
    if(status==="Credit") paid=0;
    if(status==="Partial") paid=Math.min(paid,total);

    if(document.getElementById("orderPaid")){
        document.getElementById("orderPaid").value=paid;
    }

    const credit=Math.max(0,total-paid);

    const box=document.getElementById("orderTotals");

    if(box){
        box.innerHTML=`

        <div class="total-box">

            <div class="total-row">
                <span>Subtotal</span>
                <strong>${money(subtotal)}</strong>
            </div>

            <div class="total-row">
                <span>Tax</span>
                <strong>${money(tax)}</strong>
            </div>

            <div class="total-row">
                <span>Discount</span>
                <strong>-${money(discount)}</strong>
            </div>

            <div class="total-row final">
                <span>Total</span>
                <strong>${money(total)}</strong>
            </div>

            <div class="total-row">
                <span>Paid</span>
                <strong class="amount-positive">${money(paid)}</strong>
            </div>

            <div class="total-row">
                <span>Credit</span>
                <strong class="${credit>0?"amount-negative":"amount-positive"}">
                    ${money(credit)}
                </strong>
            </div>

        </div>
        `;
    }

    return {subtotal,tax,discount,total,paid,credit};
}

function saveOrder(event){

    event.preventDefault();

    const calc=calculateOrderTotal();

    if(calc.total<=0){
        toast("Add at least one food item","error");
        return;
    }

    const customerId=document.getElementById("orderCustomer").value;

    const rows=[...document.querySelectorAll(".order-item")];

    const items=rows.map(row=>{

        const menuId=row.querySelector(".item-menu").value;
        const qty=Number(row.querySelector(".item-qty").value||1);
        const m=menuItem(menuId);

        return {
            menuItemId:m.id,
            name:m.name,
            category:m.category,
            unitPrice:Number(m.price),
            quantity:qty,
            total:Number(m.price)*qty
        };

    });

    const paymentStatus=document.getElementById("orderPaymentStatus").value;

    const order={

        id:id(),

        customerId:Number(customerId),

        date:document.getElementById("orderDate").value,

        meal:document.getElementById("orderMeal").value,

        items,

        subtotal:calc.subtotal,

        tax:calc.tax,

        discount:calc.discount,

        total:calc.total,

        paid:calc.paid,

        credit:calc.credit,

        paymentStatus,

        status:document.getElementById("orderStatus").value,

        notes:document.getElementById("orderNotes").value.trim(),

        createdAt:dateNow()

    };

    state.orders.push(order);

    /*
       If money was paid during order creation, record it in
       Payments as well so the financial history remains complete.
    */

    if(calc.paid>0){

        state.payments.push({

            id:id(),

            orderId:order.id,

            customerId:order.customerId,

            amount:calc.paid,

            method:"Cash",

            date:dateNow(),

            note:"Payment recorded with order"

        });
    }

    saveState();

    closeModal();

    toast("Order created successfully");

    renderOrders();
}

function changeOrderStatus(orderId){

    const o=state.orders.find(x=>x.id===orderId);

    if(!o) return;

    const statuses=["Pending","Preparing","Delivered","Cancelled"];
    const current=statuses.indexOf(o.status);

    const next=statuses[(current+1)%statuses.length];

    if(next==="Cancelled"){
        if(!confirm("Cancel this order?")) return;
    }

    o.status=next;

    saveState();

    toast(`Order status: ${next}`);

    renderOrders();
}

function whatsappOrder(orderId){

    const o=state.orders.find(x=>x.id===orderId);

    if(!o) return;

    const customer=customerName(o.customerId);

    const lines=[
        `HomeFood Manager`,
        `Order for: ${customer}`,
        `Date: ${o.date}`,
        `Meal: ${o.meal}`,
        ``,
        ...o.items.map(i=>`${i.name} x${i.quantity} = ${money(i.total)}`),
        ``,
        `Total: ${money(o.total)}`,
        `Paid: ${money(o.paid)}`,
        `Credit: ${money(o.credit)}`,
        o.notes ? `Notes: ${o.notes}` : ""
    ].filter(Boolean);

    const url=`https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`;

    window.open(url,"_blank");
}

function printReceipt(orderId){

    const o=state.orders.find(x=>x.id===orderId);

    if(!o) return;

    const business=state.settings.businessName || "HomeFood Manager";

    const html=`

    <!DOCTYPE html>
    <html>
    <head>
    <title>Receipt</title>
    <style>
        body{
            font-family:Arial,sans-serif;
            max-width:420px;
            margin:30px auto;
            padding:20px;
        }
        h1{text-align:center}
        .line{
            display:flex;
            justify-content:space-between;
            margin:8px 0;
        }
        hr{border:0;border-top:1px solid #ddd}
        .total{font-size:20px;font-weight:bold}
    </style>
    </head>

    <body>

    <h1>${esc(business)}</h1>

    <p>
        Customer: ${esc(customerName(o.customerId))}<br>
        Date: ${esc(o.date)}<br>
        Meal: ${esc(o.meal)}<br>
        Status: ${esc(o.status)}
    </p>

    <hr>

    ${o.items.map(i=>`
        <div class="line">
            <span>${esc(i.name)} × ${i.quantity}</span>
            <span>${money(i.total)}</span>
        </div>
    `).join("")}

    <hr>

    <div class="line">
        <span>Subtotal</span>
        <span>${money(o.subtotal)}</span>
    </div>

    <div class="line">
        <span>Tax</span>
        <span>${money(o.tax)}</span>
    </div>

    <div class="line">
        <span>Discount</span>
        <span>-${money(o.discount)}</span>
    </div>

    <div class="line total">
        <span>Total</span>
        <span>${money(o.total)}</span>
    </div>

    <div class="line">
        <span>Paid</span>
        <span>${money(o.paid)}</span>
    </div>

    <div class="line">
        <span>Credit</span>
        <span>${money(o.credit)}</span>
    </div>

    ${o.notes?`<p><strong>Notes:</strong> ${esc(o.notes)}</p>`:""}

    <p style="text-align:center;margin-top:30px">
        Thank you!
    </p>

    </body>
    </html>
    `;

    const win=window.open("","_blank");

    if(!win){
        toast("Popup blocked. Allow popups to print.","error");
        return;
    }

    win.document.write(html);
    win.document.close();

    setTimeout(()=>win.print(),300);
}

function renderPayments(){

    document.getElementById("main").innerHTML=`

    ${pageHead(
        "Payments",
        `${state.payments.length} recorded payments`,
        `<button class="btn btn-success" onclick="openPaymentModal()">＋ Record Payment</button>`
    )}

    <div class="card section-card">

        ${state.payments.length ? `

        <div class="table-wrap">

        <table>

            <thead>
                <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Order</th>
                    <th>Note</th>
                </tr>
            </thead>

            <tbody>

            ${[...state.payments].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(p=>`

                <tr>
                    <td>${new Date(p.date).toLocaleString()}</td>
                    <td>${esc(customerName(p.customerId))}</td>
                    <td class="amount-positive">${money(p.amount)}</td>
                    <td>${esc(p.method)}</td>
                    <td>${p.orderId ? "#"+p.orderId : "-"}</td>
                    <td>${esc(p.note||"-")}</td>
                </tr>

            `).join("")}

            </tbody>

        </table>

        </div>

        ` : emptyHTML("💵","No payments yet","Payments recorded here will appear in the payment history.")}

    </div>
    `;
}

function openPaymentModal(customerId=null){

    const customers=state.customers.filter(c=>customerBalance(c.id)>0);

    document.getElementById("modal-container").innerHTML=`

    <div class="modal-backdrop" onclick="closeModal(event)">

        <div class="modal" onclick="event.stopPropagation()">

            <div class="modal-head">
                <h2>Record Payment</h2>
                <button class="modal-close" onclick="closeModal()">✕</button>
            </div>

            <div class="modal-body">

                <form onsubmit="savePayment(event)">

                    <div class="form-grid">

                        <div class="field">
                            <label>Customer *</label>
                            <select id="paymentCustomer" required onchange="showPaymentBalance()">

                                <option value="">Select customer</option>

                                ${state.customers.map(c=>`
                                    <option value="${c.id}" ${String(customerId)===String(c.id)?"selected":""}>
                                        ${esc(c.name)}
                                    </option>
                                `).join("")}

                            </select>
                        </div>

                        <div class="field">
                            <label>Amount *</label>
                            <input id="paymentAmount" type="number" min="0.01" step="0.01" required>
                        </div>

                        <div class="field">
                            <label>Payment Method</label>
                            <select id="paymentMethod">
                                <option>Cash</option>
                                <option>Telebirr</option>
                                <option>CBE Birr</option>
                                <option>Mobile Money</option>
                                <option>Bank Transfer</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div class="field">
                            <label>Date</label>
                            <input id="paymentDate" type="datetime-local"
                                value="${new Date().toISOString().slice(0,16)}">
                        </div>

                        <div class="field full">
                            <label>Note</label>
                            <textarea id="paymentNote" rows="2"></textarea>
                        </div>

                    </div>

                    <div id="paymentBalance" style="margin-top:12px"></div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn btn-success">Save Payment</button>
                    </div>

                </form>

            </div>

        </div>

    </div>
    `;

    showPaymentBalance();
}

function showPaymentBalance(){

    const id=document.getElementById("paymentCustomer")?.value;

    if(!id) return;

    const balance=customerBalance(id);

    const box=document.getElementById("paymentBalance");

    if(box){

        box.innerHTML=`
            <div class="card" style="padding:13px;background:#fff7ed;border-color:#fed7aa">
                Outstanding balance:
                <strong class="${balance>0?"amount-negative":"amount-positive"}">
                    ${money(balance)}
                </strong>
            </div>
        `;
    }
}

function savePayment(event){

    event.preventDefault();

    const customerId=Number(document.getElementById("paymentCustomer").value);
    const amount=Number(document.getElementById("paymentAmount").value||0);

    if(!customerId || amount<=0){
        toast("Customer and valid amount are required","error");
        return;
    }

    const balance=customerBalance(customerId);

    if(balance<=0){
        toast("This customer has no outstanding balance","error");
        return;
    }

    if(amount>balance){

        if(!confirm(
            `Payment ${money(amount)} is greater than balance ${money(balance)}. Continue?`
        )) return;
    }

    state.payments.push({

        id:id(),

        customerId,

        amount,

        method:document.getElementById("paymentMethod").value,

        date:new Date(document.getElementById("paymentDate").value).toISOString(),

        note:document.getElementById("paymentNote").value.trim()

    });

    saveState();

    closeModal();

    toast("Payment recorded");

    renderPayments();
}

function renderCredit(){

    const rows=state.customers
        .map(c=>({
            ...c,
            balance:customerBalance(c.id)
        }))
        .filter(c=>c.balance>0)
        .sort((a,b)=>b.balance-a.balance);

    document.getElementById("main").innerHTML=`

    ${pageHead(
        "Credit / Debt Ledger",
        "Track unpaid and partially paid customer balances"
    )}

    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">

        <div class="card stat">
            <div class="stat-top">
                <span>Total Outstanding</span>
                <div class="stat-icon">📒</div>
            </div>
            <div class="stat-value amount-negative">${money(totalOutstanding())}</div>
        </div>

        <div class="card stat">
            <div class="stat-top">
                <span>Customers With Debt</span>
                <div class="stat-icon">👥</div>
            </div>
            <div class="stat-value">${rows.length}</div>
        </div>

        <div class="card stat">
            <div class="stat-top">
                <span>Payments Recorded</span>
                <div class="stat-icon">💵</div>
            </div>
            <div class="stat-value">${state.payments.length}</div>
        </div>

    </div>

    <div class="card section-card">

        ${rows.length ? `

        <div class="table-wrap">

        <table>

            <thead>
                <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Credit Limit</th>
                    <th>Outstanding</th>
                    <th>Action</th>
                </tr>
            </thead>

            <tbody>

            ${rows.map(c=>`

                <tr>

                    <td><strong>${esc(c.name)}</strong></td>

                    <td>${esc(c.phone||"-")}</td>

                    <td>${money(c.creditLimit||0)}</td>

                    <td class="amount-negative">${money(c.balance)}</td>

                    <td>

                        <div class="actions">

                            <button class="btn btn-success btn-small"
                                onclick="openPaymentModal(${c.id})">
                                Pay
                            </button>

                            <button class="btn btn-secondary btn-small"
                                onclick="reminderWhatsApp(${c.id})">
                                Reminder
                            </button>

                        </div>

                    </td>

                </tr>

            `).join("")}

            </tbody>

        </table>

        </div>

        ` : emptyHTML("🎉","No outstanding debt","All customer balances are currently clear.")}

    </div>
    `;
}

function reminderWhatsApp(customerId){

    const c=state.customers.find(x=>x.id===customerId);

    if(!c) return;

    const balance=customerBalance(customerId);

    const message=
`Hello ${c.name},

This is a friendly payment reminder from ${state.settings.businessName || "HomeFood Manager"}.

Your current outstanding balance is ${money(balance)}.

Thank you.`;

    let phone=(c.phone||"").replace(/\D/g,"");

    if(phone.startsWith("0")) phone="251"+phone.slice(1);

    const url=phone
        ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
        : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(url,"_blank");
}

function renderMenu(){

    document.getElementById("main").innerHTML=`

    ${pageHead(
        "Menu Management",
        `${state.menu.length} menu items`,
        `<button class="btn btn-primary" onclick="openMenuModal()">＋ Add Menu Item</button>`
    )}

    <div class="card section-card">

        ${state.menu.length ? `

        <div class="table-wrap">

        <table>

            <thead>
                <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Availability</th>
                    <th>Action</th>
                </tr>
            </thead>

            <tbody>

            ${state.menu.map(m=>`

                <tr>

                    <td><strong>${esc(m.name)}</strong></td>

                    <td>${esc(m.category)}</td>

                    <td>${money(m.price)}</td>

                    <td>
                        <button class="btn btn-small ${m.available!==false?"btn-success":"btn-secondary"}"
                            onclick="toggleMenu(${m.id})">
                            ${m.available!==false?"Available":"Unavailable"}
                        </button>
                    </td>

                    <td>
                        <button class="btn btn-primary btn-small"
                            onclick="openMenuModal(${m.id})">
                            Edit
                        </button>
                    </td>

                </tr>

            `).join("")}

            </tbody>

        </table>

        </div>

        ` : emptyHTML("🍲","No menu items yet","Add your food and drink items with your own prices.")}

    </div>
    `;
}

function openMenuModal(menuId=null){

    const m=menuId ? state.menu.find(x=>x.id===menuId) : null;

    document.getElementById("modal-container").innerHTML=`

    <div class="modal-backdrop" onclick="closeModal(event)">

        <div class="modal" onclick="event.stopPropagation()">

            <div class="modal-head">

                <h2>${m?"Edit Menu Item":"Add Menu Item"}</h2>

                <button class="modal-close" onclick="closeModal()">✕</button>

            </div>

            <div class="modal-body">

                <form onsubmit="saveMenu(event,${menuId||"null"})">

                    <div class="form-grid">

                        <div class="field full">
                            <label>Food / Drink Name *</label>
                            <input id="menuName" required value="${esc(m?.name||"")}">
                        </div>

                        <div class="field">
                            <label>Category</label>
                            <select id="menuCategory">
                                ${["Food","Drink","Package","Other"].map(x=>
                                    `<option ${m?.category===x?"selected":""}>${x}</option>`
                                ).join("")}
                            </select>
                        </div>

                        <div class="field">
                            <label>Price *</label>
                            <input id="menuPrice" type="number" min="0" step="0.01"
                                required value="${m?.price||""}">
                        </div>

                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn btn-primary">${m?"Save Changes":"Add Menu Item"}</button>
                    </div>

                </form>

            </div>

        </div>

    </div>
    `;
}

function saveMenu(event,menuId){

    event.preventDefault();

    const data={
        name:document.getElementById("menuName").value.trim(),
        category:document.getElementById("menuCategory").value,
        price:Number(document.getElementById("menuPrice").value||0)
    };

    if(!data.name || data.price<0){
        toast("Name and valid price are required","error");
        return;
    }

    if(menuId){

        const m=state.menu.find(x=>x.id===menuId);

        if(m) Object.assign(m,data);

        toast("Menu item updated");

    }else{

        state.menu.push({
            id:id(),
            ...data,
            available:true,
            createdAt:dateNow()
        });

        toast("Menu item added");
    }

    saveState();
    closeModal();
    renderMenu();
}

function toggleMenu(menuId){

    const m=state.menu.find(x=>x.id===menuId);

    if(!m) return;

    m.available=m.available===false;

    saveState();

    toast(m.available?"Item is now available":"Item is now unavailable");

    renderMenu();
}

function renderExpenses(){

    const categories=["Ingredients","Rent","Utilities","Transport","Salary","Packaging","Marketing","Other"];

    document.getElementById("main").innerHTML=`

    ${pageHead(
        "Expenses",
        `${state.expenses.length} recorded expenses`,
        `<button class="btn btn-danger" onclick="openExpenseModal()">＋ Add Expense</button>`
    )}

    <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">

        <div class="card stat">
            <div class="stat-top">
                <span>Total Expenses</span>
                <div class="stat-icon">💸</div>
            </div>
            <div class="stat-value amount-negative">${money(totalExpenses())}</div>
        </div>

        <div class="card stat">
            <div class="stat-top">
                <span>Today's Expenses</span>
                <div class="stat-icon">📅</div>
            </div>
            <div class="stat-value">${money(expensesToday())}</div>
        </div>

        <div class="card stat">
            <div class="stat-top">
                <span>Expense Entries</span>
                <div class="stat-icon">🧾</div>
            </div>
            <div class="stat-value">${state.expenses.length}</div>
        </div>

    </div>

    <div class="card section-card">

        ${state.expenses.length ? `

        <div class="table-wrap">

        <table>

            <thead>
                <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Payment</th>
                </tr>
            </thead>

            <tbody>

            ${[...state.expenses].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(e=>`

                <tr>
                    <td>${esc(e.date)}</td>
                    <td>${esc(e.category)}</td>
                    <td>${esc(e.description||"-")}</td>
                    <td class="amount-negative">${money(e.amount)}</td>
                    <td>${esc(e.paymentMethod||"-")}</td>
                </tr>

            `).join("")}

            </tbody>

        </table>

        </div>

        ` : emptyHTML("💸","No expenses yet","Record rent, ingredients, utilities, transport and other costs.")}

    </div>
    `;
}

function openExpenseModal(){

    document.getElementById("modal-container").innerHTML=`

    <div class="modal-backdrop" onclick="closeModal(event)">

        <div class="modal" onclick="event.stopPropagation()">

            <div class="modal-head">
                <h2>Add Expense</h2>
                <button class="modal-close" onclick="closeModal()">✕</button>
            </div>

            <div class="modal-body">

                <form onsubmit="saveExpense(event)">

                    <div class="form-grid">

                        <div class="field">
                            <label>Date *</label>
                            <input id="expenseDate" type="date" value="${today()}" required>
                        </div>

                        <div class="field">
                            <label>Category *</label>
                            <select id="expenseCategory">
                                ${["Ingredients","Rent","Utilities","Transport","Salary","Packaging","Marketing","Other"].map(x=>`<option>${x}</option>`).join("")}
                            </select>
                        </div>

                        <div class="field full">
                            <label>Description</label>
                            <input id="expenseDescription" placeholder="What was the expense for?">
                        </div>

                        <div class="field">
                            <label>Amount *</label>
                            <input id="expenseAmount" type="number" min="0.01" step="0.01" required>
                        </div>

                        <div class="field">
                            <label>Payment Method</label>
                            <select id="expenseMethod">
                                <option>Cash</option>
                                <option>Telebirr</option>
                                <option>CBE Birr</option>
                                <option>Bank Transfer</option>
                                <option>Other</option>
                            </select>
                        </div>

                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn btn-danger">Save Expense</button>
                    </div>

                </form>

            </div>

        </div>

    </div>
    `;
}

function saveExpense(event){

    event.preventDefault();

    const amount=Number(document.getElementById("expenseAmount").value||0);

    if(amount<=0){
        toast("Enter a valid amount","error");
        return;
    }

    state.expenses.push({

        id:id(),

        date:document.getElementById("expenseDate").value,

        category:document.getElementById("expenseCategory").value,

        description:document.getElementById("expenseDescription").value.trim(),

        amount,

        paymentMethod:document.getElementById("expenseMethod").value,

        createdAt:dateNow()

    });

    saveState();

    closeModal();

    toast("Expense recorded");

    renderExpenses();
}

function renderReports(){

    const salesByItem={};

    state.orders
        .filter(o=>o.status!=="Cancelled")
        .forEach(o=>{
            (o.items||[]).forEach(i=>{
                if(!salesByItem[i.name]){
                    salesByItem[i.name]={name:i.name,qty:0,revenue:0};
                }

                salesByItem[i.name].qty+=Number(i.quantity||0);
                salesByItem[i.name].revenue+=Number(i.total||0);
            });
        });

    const topItems=Object.values(salesByItem)
        .sort((a,b)=>b.revenue-a.revenue)
        .slice(0,10);

    const revenue=totalRevenue();
    const expenses=totalExpenses();
    const profit=netProfit();
    const margin=revenue>0?(profit/revenue)*100:0;

    document.getElementById("main").innerHTML=`

    ${pageHead(
        "Reports & Analytics",
        "Financial and sales performance"
    )}

    <div class="report-grid">

        <div class="card report-number">
            <div class="label">Income</div>
            <div class="value amount-positive">${money(revenue)}</div>
        </div>

        <div class="card report-number">
            <div class="label">Expenses</div>
            <div class="value amount-negative">${money(expenses)}</div>
        </div>

        <div class="card report-number">
            <div class="label">Net Profit</div>
            <div class="value ${profit>=0?"amount-positive":"amount-negative"}">${money(profit)}</div>
        </div>

        <div class="card report-number">
            <div class="label">Profit Margin</div>
            <div class="value">${margin.toFixed(1)}%</div>
        </div>

        <div class="card report-number">
            <div class="label">Orders</div>
            <div class="value">${state.orders.filter(o=>o.status!=="Cancelled").length}</div>
        </div>

        <div class="card report-number">
            <div class="label">Customers</div>
            <div class="value">${state.customers.length}</div>
        </div>

    </div>

    <div class="dashboard-grid" style="margin-top:18px">

        <div class="card section-card">

            <div class="section-title">
                <h2>Top Selling Food Items</h2>
            </div>

            ${topItems.length ? `

            ${topItems.map((i,index)=>{

                const pct=topItems[0].revenue>0
                    ?(i.revenue/topItems[0].revenue)*100
                    :0;

                return `
                <div style="margin-bottom:17px">

                    <div style="display:flex;justify-content:space-between;font-size:13px">

                        <strong>${index+1}. ${esc(i.name)}</strong>

                        <span>
                            ${i.qty} sold · ${money(i.revenue)}
                        </span>

                    </div>

                    <div class="progress">
                        <div style="width:${Math.min(100,pct)}%"></div>
                    </div>

                </div>
                `;

            }).join("")}

            ` : emptyHTML("📊","No sales data","Create orders to see top selling items.")}

        </div>

        <div class="card section-card">

            <div class="section-title">
                <h2>Order Status</h2>
            </div>

            ${["Pending","Preparing","Delivered","Cancelled"].map(status=>{

                const count=state.orders.filter(o=>o.status===status).length;

                return `
                <div class="total-row">

                    <span>${status}</span>

                    <strong>${count}</strong>

                </div>
                `;

            }).join("")}

        </div>

    </div>

    <div class="card section-card" style="margin-top:18px">

        <div class="section-title">
            <h2>Expense Breakdown</h2>
        </div>

        ${expenseBreakdownHTML()}

    </div>
    `;
}

function expenseBreakdownHTML(){

    const map={};

    state.expenses.forEach(e=>{
        map[e.category]=(map[e.category]||0)+Number(e.amount||0);
    });

    const list=Object.entries(map).sort((a,b)=>b[1]-a[1]);

    if(!list.length){
        return emptyHTML("💸","No expenses","Expense categories will appear here.");
    }

    return list.map(([category,value])=>`

        <div style="margin-bottom:14px">

            <div style="display:flex;justify-content:space-between">

                <strong>${esc(category)}</strong>

                <span>${money(value)}</span>

            </div>

            <div class="progress">
                <div style="width:${totalExpenses()>0?(value/totalExpenses())*100:0}%"></div>
            </div>

        </div>

    `).join("");
}

function renderSettings(){

    document.getElementById("main").innerHTML=`

    ${pageHead(
        "Settings",
        "Business information and local data management"
    )}

    <div class="setting-grid">

        <div class="card section-card">

            <div class="section-title">
                <h2>Business Information</h2>
            </div>

            <form onsubmit="saveSettings(event)">

                <div class="form-grid">

                    <div class="field full">
                        <label>Business Name</label>
                        <input id="settingBusinessName"
                            value="${esc(state.settings.businessName||"")}">
                    </div>

                    <div class="field">
                        <label>Phone</label>
                        <input id="settingPhone"
                            value="${esc(state.settings.phone||"")}">
                    </div>

                    <div class="field">
                        <label>Currency Symbol</label>
                        <input id="settingCurrency"
                            value="${esc(state.settings.currency||"ETB")}">
                    </div>

                    <div class="field full">
                        <label>Address</label>
                        <textarea id="settingAddress" rows="3">${esc(state.settings.address||"")}</textarea>
                    </div>

                </div>

                <div class="form-actions">
                    <button class="btn btn-primary">Save Settings</button>
                </div>

            </form>

        </div>

        <div class="card section-card">

            <div class="section-title">
                <h2>Backup & Restore</h2>
            </div>

            <p class="muted small">
                Export all local data as JSON or restore a previous backup.
            </p>

            <div class="actions" style="margin-top:15px">

                <button class="btn btn-primary" onclick="exportData()">
                    ⬇ Export JSON
                </button>

                <label class="btn btn-secondary">
                    ⬆ Restore JSON
                    <input type="file" accept=".json,application/json"
                        onchange="importData(event)" hidden>
                </label>

            </div>

        </div>

        <div class="card section-card danger-zone">

            <div class="section-title">
                <h2>Danger Zone</h2>
            </div>

            <p class="muted small">
                Clear all customers, menu items, orders, payments and expenses.
                This cannot be undone unless you have a backup.
            </p>

            <button class="btn btn-danger" onclick="clearData()">
                Clear Local Data
            </button>

        </div>

    </div>
    `;
}

function saveSettings(event){

    event.preventDefault();

    state.settings.businessName=document.getElementById("settingBusinessName").value.trim() || "HomeFood Manager";
    state.settings.phone=document.getElementById("settingPhone").value.trim();
    state.settings.currency=document.getElementById("settingCurrency").value.trim() || "ETB";
    state.settings.address=document.getElementById("settingAddress").value.trim();

    saveState();

    document.getElementById("brandName").textContent=state.settings.businessName;

    toast("Settings saved");

    renderSettings();
}

function exportData(){

    const data={
        exportedAt:dateNow(),
        app:"HomeFood Manager",
        version:"V1",
        data:state
    };

    const blob=new Blob(
        [JSON.stringify(data,null,2)],
        {type:"application/json"}
    );

    const url=URL.createObjectURL(blob);

    const a=document.createElement("a");

    a.href=url;
    a.download=`homefood-manager-backup-${today()}.json`;

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);

    toast("Backup exported");
}

function importData(event){

    const file=event.target.files?.[0];

    if(!file) return;

    const reader=new FileReader();

    reader.onload=()=>{

        try{

            const parsed=JSON.parse(reader.result);

            const imported=parsed.data || parsed;

            if(
                !imported ||
                !Array.isArray(imported.customers) ||
                !Array.isArray(imported.menu) ||
                !Array.isArray(imported.orders)
            ){
                throw new Error("Invalid backup");
            }

            if(!confirm("Restore this backup? Current local data will be replaced.")){
                return;
            }

            state={
                ...clone(emptyState),
                ...imported,
                settings:{
                    ...clone(emptyState.settings),
                    ...(imported.settings||{})
                }
            };

            saveState();

            toast("Backup restored");

            showPage("dashboard");

        }catch(e){

            console.error(e);

            toast("Invalid backup file","error");
        }

    };

    reader.readAsText(file);
}

function clearData(){

    const answer=prompt(
        'Type DELETE to clear all local HomeFood Manager data.'
    );

    if(answer!=="DELETE"){
        toast("Clear cancelled");
        return;
    }

    state=clone(emptyState);

    saveState();

    toast("All local data cleared");

    showPage("dashboard");
}

function closeModal(event){

    if(event && event.target!==event.currentTarget){
        return;
    }

    document.getElementById("modal-container").innerHTML="";
}

function init(){

    document.getElementById("brandName").textContent=
        state.settings.businessName || "HomeFood Manager";

    showPage("dashboard");
}

document.addEventListener("DOMContentLoaded",init);
