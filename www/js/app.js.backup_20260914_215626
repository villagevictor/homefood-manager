const KEY = "homefood_manager_state_v2";

const defaultState = {
    customers: [],

    menu: [],

    orders: [],

    payments: [],

    expenses: [],

    settings:{
        businessName:"HomeFood Manager",
        currency:"ETB"
    }
};

let state = loadState();

function loadState(){

    try{
        const saved = localStorage.getItem(KEY);

        if(saved){
            return JSON.parse(saved);
        }

    }catch(e){}

    localStorage.setItem(KEY,JSON.stringify(defaultState));

    return JSON.parse(JSON.stringify(defaultState));
}

function saveState(){
    localStorage.setItem(KEY,JSON.stringify(state));
}

function money(value){
    return Number(value || 0).toLocaleString("en-US",{
        minimumFractionDigits:2,
        maximumFractionDigits:2
    }) + " ETB";
}

function today(){
    return new Date().toISOString().slice(0,10);
}

function todayOrders(){
    return state.orders.filter(o =>
        String(o.date).slice(0,10) === today()
        && o.status !== "Voided"
    );
}

function todayPayments(){
    return state.payments.filter(p =>
        String(p.date).slice(0,10) === today()
    );
}

function todayExpenses(){
    return state.expenses.filter(e =>
        String(e.date).slice(0,10) === today()
    );
}

function salesToday(){
    return todayOrders().reduce((s,o)=>s+Number(o.total||0),0);
}

function paidToday(){
    return todayOrders().reduce((s,o)=>s+Number(o.paid||0),0);
}

function creditToday(){
    return todayOrders().reduce((s,o)=>s+Number(o.credit||0),0);
}

function expensesToday(){
    return todayExpenses().reduce((s,e)=>s+Number(e.amount||0),0);
}

function totalPayments(){
    return state.payments.reduce((s,p)=>s+Number(p.amount||0),0);
}

function totalCredit(){

    const credit = state.orders.reduce(
        (s,o)=>s+Number(o.credit||0),0
    );

    const payments = totalPayments();

    return Math.max(0,credit-payments);
}

function customerBalance(id){

    const credit = state.orders
        .filter(o=>Number(o.customerId)===Number(id))
        .reduce((s,o)=>s+Number(o.credit||0),0);

    const paid = state.payments
        .filter(p=>Number(p.customerId)===Number(id))
        .reduce((s,p)=>s+Number(p.amount||0),0);

    return Math.max(0,credit-paid);
}

function customerName(id){

    const c = state.customers.find(
        x=>Number(x.id)===Number(id)
    );

    return c ? c.name : "Walk-in";
}

function menuName(id){

    const m = state.menu.find(
        x=>Number(x.id)===Number(id)
    );

    return m ? m.name : "-";
}

function toast(message){

    const el = document.getElementById("toast");

    el.textContent = message;
    el.style.display = "block";

    setTimeout(()=>{
        el.style.display = "none";
    },2200);
}

function showPage(page){

    document.querySelectorAll(".nav-btn").forEach(btn=>{
        btn.classList.toggle(
            "active",
            btn.dataset.page===page
        );
    });

    document.querySelectorAll(".mobile-nav button").forEach(btn=>{
        btn.classList.toggle(
            "active",
            btn.dataset.page===page
        );
    });

    const content = document.getElementById("content");

    const pages = {
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

    (pages[page] || renderDashboard)(content);
}

function renderDashboard(el){

    const sales=salesToday();
    const paid=paidToday();
    const credit=creditToday();
    const exp=expensesToday();
    const net=sales-exp;

    el.innerHTML=`

        <div class="page-title">Dashboard</div>

        <div class="page-subtitle">
            Today's business overview
        </div>

        <div class="dashboard-grid">

            <div class="stat-card">
                <div class="stat-label">Today's Sales</div>
                <div class="stat-value">${money(sales)}</div>
            </div>

            <div class="stat-card">
                <div class="stat-label">Paid</div>
                <div class="stat-value stat-green">${money(paid)}</div>
            </div>

            <div class="stat-card">
                <div class="stat-label">Credit</div>
                <div class="stat-value stat-orange">${money(credit)}</div>
            </div>

            <div class="stat-card">
                <div class="stat-label">Expenses</div>
                <div class="stat-value stat-red">${money(exp)}</div>
            </div>

            <div class="stat-card">
                <div class="stat-label">Net</div>
                <div class="stat-value stat-blue">${money(net)}</div>
            </div>

        </div>

        <div class="section">

            <div class="section-header">

                <div class="section-title">
                    Quick Actions
                </div>

            </div>

            <div class="quick-actions">

                <button class="quick-action"
                    onclick="showPage('orders')">
                    🛒
                    <strong>New Order</strong>
                </button>

                <button class="quick-action"
                    onclick="showPage('customers')">
                    👥
                    <strong>Add Customer</strong>
                </button>

                <button class="quick-action"
                    onclick="showPage('payments')">
                    💵
                    <strong>Record Payment</strong>
                </button>

                <button class="quick-action"
                    onclick="showPage('expenses')">
                    💸
                    <strong>Add Expense</strong>
                </button>

            </div>

        </div>

        <div class="dashboard-grid" style="margin-top:20px">

            <div class="stat-card">
                <div class="stat-label">Customers</div>
                <div class="stat-value">${state.customers.length}</div>
            </div>

            <div class="stat-card">
                <div class="stat-label">Today's Orders</div>
                <div class="stat-value">${todayOrders().length}</div>
            </div>

            <div class="stat-card">
                <div class="stat-label">Outstanding Credit</div>
                <div class="stat-value stat-orange">${money(totalCredit())}</div>
            </div>

            <div class="stat-card">
                <div class="stat-label">Menu Items</div>
                <div class="stat-value">${state.menu.length}</div>
            </div>

            <div class="stat-card">
                <div class="stat-label">Total Payments</div>
                <div class="stat-value stat-green">${money(totalPayments())}</div>
            </div>

        </div>

        <div class="section">

            <div class="section-header">
                <div class="section-title">
                    Recent Orders
                </div>

                <button class="secondary-btn"
                    onclick="showPage('orders')">
                    View All
                </button>
            </div>

            ${renderRecentOrders()}

        </div>
    `;
}

function renderRecentOrders(){

    const rows =
        state.orders
            .slice(-8)
            .reverse();


    if(!rows.length){

        return `
            <div class="empty">
                No orders yet.
            </div>
        `;

    }


    return `

        <div class="table-wrap">

            <table>

                <thead>

                    <tr>

                        <th>
                            Customer
                        </th>

                        <th>
                            Date
                        </th>

                        <th>
                            Meal
                        </th>

                        <th>
                            Total
                        </th>

                        <th>
                            Paid
                        </th>

                        <th>
                            Credit
                        </th>

                        <th>
                            Status
                        </th>

                    </tr>

                </thead>


                <tbody>

                ${rows.map(o=>`

                    <tr>

                        <td>
                            ${customerName(
                                o.customerId
                            )}
                        </td>


                        <td>
                            ${o.date || "-"}
                        </td>


                        <td>

                            <span class="badge">

                                ${o.meal || "-"}

                            </span>

                        </td>


                        <td>
                            ${money(o.total)}
                        </td>


                        <td>
                            ${money(o.paid)}
                        </td>


                        <td>
                            ${money(o.credit)}
                        </td>


                        <td>

                            <span class="badge ${
                                o.status==="Credit"
                                ?"badge-orange"
                                :"badge-green"
                            }">

                                ${o.status}

                            </span>

                        </td>

                    </tr>

                `).join("")}

                </tbody>

            </table>

        </div>

    `;
}

function renderCustomers(el){

    el.innerHTML=`

        <div class="page-title">
            Customers
        </div>

        <div class="page-subtitle">
            Manage customers and credit accounts
        </div>

        <div class="section">

            <div class="section-header">
                <div class="section-title">
                    Add Customer
                </div>
            </div>

            <form onsubmit="addCustomer(event)">

                <div class="form-grid">

                    <div class="field">

                        <label>
                            Name
                        </label>

                        <input
                            id="customerName"
                            type="text"
                            placeholder="Customer name"
                            autocomplete="name"
                            required>

                    </div>


                    <div class="field">

                        <label>
                            Phone
                        </label>

                        <input
                            id="customerPhone"
                            type="tel"
                            placeholder="09XXXXXXXX"
                            autocomplete="tel">

                    </div>


                    <div class="field">

                        <label>
                            Customer Type
                        </label>

                        <select id="customerType">

                            <option value="Regular">
                                Regular
                            </option>

                            <option value="Credit">
                                Credit
                            </option>

                            <option value="Company">
                                Company
                            </option>

                        </select>

                    </div>


                    <div class="field">

                        <label>
                            Credit Limit
                        </label>

                        <input
                            id="customerLimit"
                            type="number"
                            min="0"
                            step="0.01"
                            value="0"
                            placeholder="0">

                    </div>


                    <div class="full actions">

                        <button
                            type="submit"
                            class="primary-btn">

                            Add Customer

                        </button>

                    </div>

                </div>

            </form>

        </div>


        <div class="section">

            <div class="section-header">

                <div class="section-title">

                    Customer List
                    (${state.customers.length})

                </div>

            </div>


            <div class="table-wrap">

                <table>

                    <thead>

                        <tr>

                            <th>Name</th>

                            <th>Phone</th>

                            <th>Type</th>

                            <th>Credit Limit</th>

                            <th>Balance</th>

                        </tr>

                    </thead>


                    <tbody>

                    ${
                        state.customers.length

                        ? state.customers.map(c=>`

                            <tr>

                                <td>
                                    <strong>
                                        ${c.name}
                                    </strong>
                                </td>

                                <td>
                                    ${c.phone || "-"}
                                </td>

                                <td>

                                    <span class="badge">
                                        ${c.type}
                                    </span>

                                </td>

                                <td>
                                    ${money(c.creditLimit || 0)}
                                </td>

                                <td class="${
                                    customerBalance(c.id)>0
                                    ?"stat-orange"
                                    :"stat-green"
                                }">

                                    ${money(
                                        customerBalance(c.id)
                                    )}

                                </td>

                            </tr>

                        `).join("")

                        : `

                            <tr>

                                <td colspan="5">

                                    <div class="empty">

                                        No customers yet.
                                        Add your first customer above.

                                    </div>

                                </td>

                            </tr>

                        `
                    }

                    </tbody>

                </table>

            </div>

        </div>
    `;
}

function addCustomer(e){

    e.preventDefault();

    const name =
        document.getElementById(
            "customerName"
        ).value.trim();

    const phone =
        document.getElementById(
            "customerPhone"
        ).value.trim();

    const type =
        document.getElementById(
            "customerType"
        ).value;

    const creditLimit =
        Number(
            document.getElementById(
                "customerLimit"
            ).value || 0
        );

    if(!name){

        toast("Enter customer name");

        return;
    }

    if(creditLimit < 0){

        toast("Credit limit cannot be negative");

        return;
    }

    state.customers.push({

        id:Date.now(),

        name:name,

        phone:phone,

        type:type,

        creditLimit:creditLimit,

        createdAt:new Date().toISOString()

    });

    saveState();

    toast(
        "Customer added successfully"
    );

    renderCustomers(
        document.getElementById("content")
    );
}

function renderOrders(el){

    if(!state.customers.length){

        el.innerHTML=`

            <div class="page-title">
                New Order
            </div>

            <div class="section">

                <div class="empty">

                    <h3>No customers yet</h3>

                    <p>
                        Add a customer first before
                        creating an order.
                    </p>

                    <button
                        class="primary-btn"
                        onclick="showPage('customers')">

                        Add Customer

                    </button>

                </div>

            </div>

        `;

        return;
    }


    if(!state.menu.length){

        el.innerHTML=`

            <div class="page-title">
                New Order
            </div>

            <div class="section">

                <div class="empty">

                    <h3>No menu items yet</h3>

                    <p>
                        Add food or drinks to the Menu
                        before creating an order.
                    </p>

                    <button
                        class="primary-btn"
                        onclick="showPage('menu')">

                        Add Food / Drink

                    </button>

                </div>

            </div>

        `;

        return;
    }


    el.innerHTML=`

        <div class="page-title">
            New Order
        </div>

        <div class="page-subtitle">
            Record food consumed by a customer
        </div>


        <div class="section">

            <form onsubmit="saveOrder(event)">

                <div class="form-grid">


                    <div class="field">

                        <label>
                            Customer
                        </label>

                        <select
                            id="orderCustomer"
                            required>

                            <option value="">
                                Select customer
                            </option>

                            ${state.customers.map(c=>`

                                <option value="${c.id}">
                                    ${c.name}
                                </option>

                            `).join("")}

                        </select>

                    </div>


                    <div class="field">

                        <label>
                            Date
                        </label>

                        <input
                            id="orderDate"
                            type="date"
                            value="${today()}"
                            required>

                    </div>


                    <div class="field">

                        <label>
                            Meal
                        </label>

                        <select
                            id="orderMeal"
                            required>

                            <option value="Breakfast">
                                Breakfast
                            </option>

                            <option
                                value="Lunch"
                                selected>

                                Lunch

                            </option>

                            <option value="Dinner">
                                Dinner
                            </option>

                        </select>

                    </div>


                    <div class="field">

                        <label>
                            Payment Type
                        </label>

                        <select
                            id="orderPaymentType"
                            onchange="updatePaymentField()">

                            <option value="paid">
                                Paid
                            </option>

                            <option value="partial">
                                Partial
                            </option>

                            <option value="credit">
                                Credit
                            </option>

                        </select>

                    </div>

                </div>


                <div
                    class="section-header"
                    style="margin-top:25px">

                    <div class="section-title">
                        Food Items
                    </div>

                    <button
                        type="button"
                        class="secondary-btn"
                        onclick="addOrderItem()">

                        + Add Item

                    </button>

                </div>


                <div
                    id="orderItems"
                    class="order-items">
                </div>


                <div class="summary-box">

                    <div class="summary-line">

                        <span>
                            Total
                        </span>

                        <strong id="orderTotal">
                            0.00 ETB
                        </strong>

                    </div>


                    <div
                        class="field"
                        style="margin-top:12px">

                        <label>
                            Paid Amount
                        </label>

                        <input
                            id="orderPaid"
                            type="number"
                            value="0"
                            min="0"
                            step="0.01"
                            oninput="calculateOrder()">

                    </div>


                    <div
                        class="summary-line summary-total">

                        <span>
                            Credit
                        </span>

                        <strong id="orderCredit">
                            0.00 ETB
                        </strong>

                    </div>

                </div>


                <div
                    class="actions"
                    style="margin-top:15px">

                    <button
                        type="submit"
                        class="primary-btn">

                        Save Order

                    </button>


                    <button
                        type="button"
                        class="secondary-btn"
                        onclick="showPage('dashboard')">

                        Cancel

                    </button>

                </div>

            </form>

        </div>


        <div class="section">

            <div class="section-header">

                <div class="section-title">
                    Order History
                </div>

            </div>

            ${renderRecentOrders()}

        </div>

    `;


    addOrderItem();
}

function addOrderItem(){

    const box =
        document.getElementById(
            "orderItems"
        );

    if(!box || !state.menu.length){

        return;
    }

    const row =
        document.createElement("div");

    row.className = "item-row";

    row.innerHTML = `

        <select
            class="food-select"
            onchange="calculateOrder()">

            ${state.menu
                .filter(m=>m.available !== false)
                .map(m=>`

                    <option value="${m.id}">

                        ${m.name}
                        - ${money(m.price)}

                    </option>

                `).join("")}

        </select>


        <input
            class="food-qty"
            type="number"
            min="1"
            step="1"
            value="1"
            oninput="calculateOrder()">


        <input
            class="food-total"
            readonly
            value="0.00">


        <button
            type="button"
            class="danger-btn"
            onclick="
                this.parentElement.remove();
                calculateOrder();
            ">

            ×

        </button>

    `;

    box.appendChild(row);

    calculateOrder();
}

function calculateOrder(){

    let total=0;

    document.querySelectorAll(".item-row").forEach(row=>{

        const id=Number(
            row.querySelector(".food-select").value
        );

        const qty=Number(
            row.querySelector(".food-qty").value||0
        );

        const item=state.menu.find(m=>m.id===id);

        const line=item ? item.price*qty : 0;

        row.querySelector(".food-total").value =
            line.toFixed(2);

        total+=line;
    });

    const paid=Number(
        document.getElementById("orderPaid")?.value||0
    );

    const credit=Math.max(0,total-paid);

    if(document.getElementById("orderTotal"))
        document.getElementById("orderTotal").textContent=money(total);

    if(document.getElementById("orderCredit"))
        document.getElementById("orderCredit").textContent=money(credit);
}

function updatePaymentField(){

    const type=document.getElementById("orderPaymentType").value;

    const paid=document.getElementById("orderPaid");

    if(type==="paid"){
        paid.value="";
    }

    if(type==="credit"){
        paid.value="0";
    }

    calculateOrder();
}

function saveOrder(e){

    e.preventDefault();


    const customerId =
        Number(
            document.getElementById(
                "orderCustomer"
            ).value
        );


    const orderDate =
        document.getElementById(
            "orderDate"
        ).value;


    const orderMeal =
        document.getElementById(
            "orderMeal"
        ).value;


    if(!customerId){

        toast(
            "Select a customer"
        );

        return;
    }


    if(!orderDate){

        toast(
            "Select order date"
        );

        return;
    }


    if(!orderMeal){

        toast(
            "Select meal"
        );

        return;
    }


    let total = 0;

    const items = [];


    document
        .querySelectorAll(".item-row")
        .forEach(row=>{

            const select =
                row.querySelector(
                    ".food-select"
                );

            const qtyInput =
                row.querySelector(
                    ".food-qty"
                );


            if(!select || !qtyInput){

                return;
            }


            const id =
                Number(select.value);


            const qty =
                Number(
                    qtyInput.value || 0
                );


            const item =
                state.menu.find(
                    m=>Number(m.id)===id
                );


            if(item && qty > 0){

                const lineTotal =
                    Number(item.price) * qty;


                total += lineTotal;


                items.push({

                    menuItemId:item.id,

                    name:item.name,

                    category:item.category,

                    unitPrice:Number(item.price),

                    quantity:qty,

                    total:lineTotal

                });

            }

        });


    if(!items.length || total <= 0){

        toast(
            "Add at least one food item"
        );

        return;
    }


    const type =
        document.getElementById(
            "orderPaymentType"
        ).value;


    let paid =
        Number(
            document.getElementById(
                "orderPaid"
            ).value || 0
        );


    if(type === "paid"){

        paid = total;

    }


    if(type === "credit"){

        paid = 0;

    }


    if(paid < 0){

        paid = 0;

    }


    paid =
        Math.min(
            paid,
            total
        );


    const credit =
        Math.max(
            0,
            total - paid
        );


    const order = {

        id:Date.now(),

        customerId:customerId,

        items:items,

        total:Number(total),

        paid:Number(paid),

        credit:Number(credit),

        status:
            credit === 0
            ? "Paid"
            : (paid > 0
                ? "Partial"
                : "Credit"),

        date:orderDate,

        meal:orderMeal,

        createdAt:
            new Date().toISOString()

    };


    state.orders.push(order);


    saveState();


    toast(
        "Order saved successfully"
    );


    showPage("dashboard");
}

function renderPayments(el){

    el.innerHTML=`

        <div class="page-title">Payments</div>

        <div class="page-subtitle">
            Record customer payments
        </div>

        <div class="section">

            <form onsubmit="savePayment(event)">

                <div class="form-grid">

                    <div class="field">
                        <label>Customer</label>

                        <select id="paymentCustomer" required>

                            <option value="">
                                Select customer
                            </option>

                            ${state.customers.map(c=>`
                                <option value="${c.id}">
                                    ${c.name} — ${money(customerBalance(c.id))}
                                </option>
                            `).join("")}

                        </select>
                    </div>

                    <div class="field">
                        <label>Amount</label>
                        <input id="paymentAmount"
                            type="number"
                            min="1"
                            required>
                    </div>

                    <div class="field">
                        <label>Payment Method</label>

                        <select id="paymentMethod">

                            <option>Cash</option>
                            <option>Telebirr</option>
                            <option>CBE Birr</option>
                            <option>Bank Transfer</option>
                            <option>Other</option>

                        </select>

                    </div>

                    <div class="field">
                        <label>Reference Number</label>
                        <input id="paymentReference">
                    </div>

                    <div class="full actions">
                        <button class="primary-btn">
                            Record Payment
                        </button>
                    </div>

                </div>

            </form>

        </div>

        <div class="section">

            <div class="section-title">
                Payment History
            </div>

            <div class="table-wrap">

            <table>

                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Reference</th>
                        <th>Date</th>
                    </tr>
                </thead>

                <tbody>

                ${state.payments.slice().reverse().map(p=>`

                    <tr>
                        <td>${customerName(p.customerId)}</td>
                        <td class="stat-green">${money(p.amount)}</td>
                        <td>${p.method}</td>
                        <td>${p.reference || "-"}</td>
                        <td>${String(p.date).slice(0,10)}</td>
                    </tr>

                `).join("") || `
                    <tr>
                        <td colspan="5">
                            <div class="empty">
                                No payments yet.
                            </div>
                        </td>
                    </tr>
                `}

                </tbody>

            </table>

            </div>

        </div>
    `;
}

function savePayment(e){

    e.preventDefault();

    const customerId=Number(
        document.getElementById("paymentCustomer").value
    );

    const amount=Number(
        document.getElementById("paymentAmount").value
    );

    if(!customerId || amount<=0){
        toast("Enter valid payment information");
        return;
    }

    state.payments.push({

        id:Date.now(),

        customerId,

        amount,

        method:document.getElementById("paymentMethod").value,

        reference:
            document.getElementById("paymentReference").value,

        date:new Date().toISOString()

    });

    saveState();

    toast("Payment recorded successfully");

    showPage("payments");
}

function renderCredit(el){

    const debtors=state.customers.filter(
        c=>customerBalance(c.id)>0
    );

    el.innerHTML=`

        <div class="page-title">Credit & Debts</div>

        <div class="page-subtitle">
            Customer outstanding balances
        </div>

        <div class="dashboard-grid">

            <div class="stat-card">
                <div class="stat-label">Outstanding Credit</div>
                <div class="stat-value stat-orange">
                    ${money(totalCredit())}
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-label">Debtors</div>
                <div class="stat-value">
                    ${debtors.length}
                </div>
            </div>

        </div>

        <div class="section">

            <div class="section-header">
                <div class="section-title">
                    Debtors
                </div>
            </div>

            <div class="table-wrap">

            <table>

                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Credit Limit</th>
                        <th>Outstanding</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>

                ${debtors.map(c=>{

                    const balance=customerBalance(c.id);

                    const over=
                        c.creditLimit>0 &&
                        balance>=c.creditLimit;

                    return `

                    <tr>

                        <td><strong>${c.name}</strong></td>

                        <td>${c.phone||"-"}</td>

                        <td>${money(c.creditLimit)}</td>

                        <td class="stat-orange">
                            ${money(balance)}
                        </td>

                        <td>
                            <span class="badge ${
                                over
                                ?"badge-red"
                                :"badge-orange"
                            }">
                                ${over
                                ?"Credit Limit"
                                :"Outstanding"}
                            </span>
                        </td>

                    </tr>

                    `;

                }).join("") || `
                    <tr>
                        <td colspan="5">
                            <div class="empty">
                                No outstanding credit.
                            </div>
                        </td>
                    </tr>
                `}

                </tbody>

            </table>

            </div>

        </div>
    `;
}

function renderMenu(el){

    el.innerHTML=`

        <div class="page-title">
            Menu
        </div>

        <div class="page-subtitle">
            Add your own food and drink items
        </div>


        <div class="section">

            <div class="section-header">

                <div class="section-title">
                    Add Menu Item
                </div>

            </div>


            <form
                onsubmit="addMenuItem(event)">

                <div class="form-grid">


                    <div class="field">

                        <label>
                            Food / Drink Name
                        </label>

                        <input
                            id="menuName"
                            type="text"
                            placeholder="e.g. Shiro"
                            required>

                    </div>


                    <div class="field">

                        <label>
                            Category
                        </label>

                        <select
                            id="menuCategory">

                            <option value="Food">
                                Food
                            </option>

                            <option value="Drink">
                                Drink
                            </option>

                        </select>

                    </div>


                    <div class="field">

                        <label>
                            Price
                        </label>

                        <input
                            id="menuPrice"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            required>

                    </div>


                    <div class="full">

                        <button
                            type="submit"
                            class="primary-btn">

                            Add Menu Item

                        </button>

                    </div>

                </div>

            </form>

        </div>


        <div class="section">

            <div class="section-header">

                <div class="section-title">

                    Menu Items
                    (${state.menu.length})

                </div>

            </div>


            <div class="table-wrap">

                <table>

                    <thead>

                        <tr>

                            <th>
                                Food / Drink Name
                            </th>

                            <th>
                                Category
                            </th>

                            <th>
                                Price
                            </th>

                            <th>
                                Available
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                    ${
                        state.menu.length

                        ? state.menu.map(m=>`

                            <tr>

                                <td>
                                    <strong>
                                        ${m.name}
                                    </strong>
                                </td>

                                <td>
                                    ${m.category}
                                </td>

                                <td>
                                    ${money(m.price)}
                                </td>

                                <td>

                                    <span
                                        class="badge badge-green">

                                        Available

                                    </span>

                                </td>

                            </tr>

                        `).join("")

                        : `

                            <tr>

                                <td colspan="4">

                                    <div class="empty">

                                        No food or drinks yet.
                                        Add your first item above.

                                    </div>

                                </td>

                            </tr>

                        `
                    }

                    </tbody>

                </table>

            </div>

        </div>
    `;
}

function addMenuItem(e){

    e.preventDefault();


    const name =
        document.getElementById(
            "menuName"
        ).value.trim();


    const category =
        document.getElementById(
            "menuCategory"
        ).value;


    const price =
        Number(
            document.getElementById(
                "menuPrice"
            ).value || 0
        );


    if(!name){

        toast(
            "Enter food or drink name"
        );

        return;
    }


    if(price < 0){

        toast(
            "Price cannot be negative"
        );

        return;
    }


    if(price === 0){

        toast(
            "Enter a valid price"
        );

        return;
    }


    state.menu.push({

        id:Date.now(),

        name:name,

        category:category,

        price:price,

        available:true,

        createdAt:
            new Date().toISOString()

    });


    saveState();


    toast(
        "Menu item added successfully"
    );


    showPage("menu");
}

function renderExpenses(el){

    el.innerHTML=`

        <div class="page-title">Expenses</div>

        <div class="page-subtitle">
            Record business expenses
        </div>

        <div class="section">

            <form onsubmit="saveExpense(event)">

                <div class="form-grid">

                    <div class="field">
                        <label>Category</label>

                        <select id="expenseCategory">

                            <option>Ingredients</option>
                            <option>Water</option>
                            <option>Electricity</option>
                            <option>Gas</option>
                            <option>Employee Salary</option>
                            <option>Transport</option>
                            <option>Rent</option>
                            <option>Other</option>

                        </select>

                    </div>

                    <div class="field">
                        <label>Amount</label>
                        <input id="expenseAmount"
                            type="number"
                            min="1"
                            required>
                    </div>

                    <div class="field full">
                        <label>Description</label>
                        <input id="expenseDescription">
                    </div>

                    <div class="full">
                        <button class="primary-btn">
                            Save Expense
                        </button>
                    </div>

                </div>

            </form>

        </div>

        <div class="section">

            <div class="section-title">
                Expense History
            </div>

            <div class="table-wrap">

            <table>

                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Date</th>
                    </tr>
                </thead>

                <tbody>

                ${state.expenses.slice().reverse().map(x=>`

                    <tr>
                        <td>${x.category}</td>
                        <td>${x.description||"-"}</td>
                        <td class="stat-red">${money(x.amount)}</td>
                        <td>${String(x.date).slice(0,10)}</td>
                    </tr>

                `).join("") || `
                    <tr>
                        <td colspan="4">
                            <div class="empty">
                                No expenses recorded.
                            </div>
                        </td>
                    </tr>
                `}

                </tbody>

            </table>

            </div>

        </div>
    `;
}

function saveExpense(e){

    e.preventDefault();

    const amount=Number(
        document.getElementById("expenseAmount").value
    );

    if(amount<=0){
        toast("Enter valid amount");
        return;
    }

    state.expenses.push({

        id:Date.now(),

        category:
            document.getElementById("expenseCategory").value,

        description:
            document.getElementById("expenseDescription").value,

        amount,

        date:new Date().toISOString()

    });

    saveState();

    toast("Expense saved");

    showPage("expenses");
}

function renderReports(el){

    const sales=state.orders.reduce(
        (s,o)=>s+Number(o.total||0),0
    );

    const paid=state.orders.reduce(
        (s,o)=>s+Number(o.paid||0),0
    );

    const credit=state.orders.reduce(
        (s,o)=>s+Number(o.credit||0),0
    );

    const expenses=state.expenses.reduce(
        (s,e)=>s+Number(e.amount||0),0
    );

    el.innerHTML=`

        <div class="page-title">Reports</div>

        <div class="page-subtitle">
            Business performance overview
        </div>

        <div class="report-grid">

            <div class="report-card">
                <h3>Total Sales</h3>
                <strong>${money(sales)}</strong>
            </div>

            <div class="report-card">
                <h3>Total Paid</h3>
                <strong class="stat-green">
                    ${money(paid)}
                </strong>
            </div>

            <div class="report-card">
                <h3>Total Credit</h3>
                <strong class="stat-orange">
                    ${money(credit)}
                </strong>
            </div>

            <div class="report-card">
                <h3>Total Expenses</h3>
                <strong class="stat-red">
                    ${money(expenses)}
                </strong>
            </div>

            <div class="report-card">
                <h3>Net</h3>
                <strong class="stat-blue">
                    ${money(sales-expenses)}
                </strong>
            </div>

            <div class="report-card">
                <h3>Total Orders</h3>
                <strong>
                    ${state.orders.length}
                </strong>
            </div>

        </div>

        <div class="section">

            <div class="section-title">
                Business Summary
            </div>

            <div class="summary-box">

                <div class="summary-line">
                    <span>Total Customers</span>
                    <strong>${state.customers.length}</strong>
                </div>

                <div class="summary-line">
                    <span>Total Menu Items</span>
                    <strong>${state.menu.length}</strong>
                </div>

                <div class="summary-line">
                    <span>Total Payments</span>
                    <strong>${money(totalPayments())}</strong>
                </div>

                <div class="summary-line">
                    <span>Outstanding Credit</span>
                    <strong class="stat-orange">
                        ${money(totalCredit())}
                    </strong>
                </div>

            </div>

        </div>
    `;
}

function renderSettings(el){

    el.innerHTML=`

        <div class="page-title">Settings</div>

        <div class="page-subtitle">
            HomeFood Manager settings
        </div>

        <div class="section">

            <div class="form-grid">

                <div class="field">
                    <label>Business Name</label>

                    <input id="businessName"
                        value="${state.settings.businessName}">
                </div>

                <div class="field">
                    <label>Currency</label>

                    <input value="ETB" disabled>
                </div>

                <div class="full actions">

                    <button class="primary-btn"
                        onclick="saveSettings()">
                        Save Settings
                    </button>

                    <button class="danger-btn"
                        onclick="resetDemoData()">
                        Reset Demo Data
                    </button>

                </div>

            </div>

        </div>

        <div class="section">

            <div class="section-title">
                Current Application
            </div>

            <p style="margin-top:10px;color:#64748b">
                HomeFood Manager V1.1<br>
                Customer → Order → Credit → Payment → Balance → Reports
            </p>

        </div>
    `;
}

function saveSettings(){

    state.settings.businessName =
        document.getElementById("businessName").value;

    saveState();

    toast("Settings saved");
}

function resetDemoData(){

    if(!confirm("Reset all local demo data?")) return;

    state=JSON.parse(JSON.stringify(defaultState));

    saveState();

    toast("Demo data reset");

    showPage("dashboard");
}

document.addEventListener("DOMContentLoaded",()=>{

    showPage("dashboard");

});
