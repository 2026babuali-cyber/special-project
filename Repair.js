
// ------------------------------------------------------------
// LOGIN / SESSION
// Demo credentials: admin / password
// ------------------------------------------------------------
const AUTH_USER = "admin";
const AUTH_PASSWORD = "password";

function isLoggedIn() {
  return sessionStorage.getItem("ims_logged_in") === "1";
}

function applyLoginState() {
  const loginScreen = document.getElementById("loginScreen");
  const appShell = document.getElementById("appShell");

  if (isLoggedIn()) {
    loginScreen.style.display = "none";
    appShell.style.display = "flex";
  } else {
    loginScreen.style.display = "flex";
    appShell.style.display = "none";
  }
}

function doLogin(event) {
  event.preventDefault();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const error = document.getElementById("loginError");

  if (username === AUTH_USER && password === AUTH_PASSWORD) {
    sessionStorage.setItem("ims_logged_in", "1");
    sessionStorage.setItem("ims_user", username);

    error.textContent = "";
    applyLoginState();
    render();
    toast("Login successful");
  } else {
    error.textContent = "Invalid username or password";
  }
}

document.getElementById("loginForm").addEventListener("submit", doLogin);

function logout() {
  sessionStorage.removeItem("ims_logged_in");
  sessionStorage.removeItem("ims_user");
  sessionStorage.removeItem("ims_financial_year");
  applyLoginState();

  document.getElementById("loginUsername").value = "";
  document.getElementById("loginPassword").value = "";
  document.getElementById("loginError").textContent = "";
}

const state={
 parties:JSON.parse(localStorage.getItem("parties")||"[]"),
 products:JSON.parse(localStorage.getItem("products")||"[]"),
 purchases:JSON.parse(localStorage.getItem("purchases")||"[]"),
 sales:JSON.parse(localStorage.getItem("sales")||"[]")
};
const save=()=>{Object.keys(state).forEach(k=>localStorage.setItem(k,JSON.stringify(state[k])));};
const money=n=>"₹ "+Number(n||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.style.display="block";setTimeout(()=>t.style.display="none",2200)}
function nav(page){document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));render(page)}
document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>nav(b.dataset.page));

function setFinancialYear(value){
  sessionStorage.setItem("ims_financial_year", value);
  const loginFY=document.getElementById("financialYear");
  if(loginFY) loginFY.value=value;
  const mainFY=document.getElementById("mainFinancialYear");
  if(mainFY) mainFY.value=value;
  toast("Financial year changed to " + value);
  if(isLoggedIn()) render();
}

const mainFY=document.getElementById("mainFinancialYear");
if(mainFY){
  mainFY.value=sessionStorage.getItem("ims_financial_year") || "2026-27";
  mainFY.addEventListener("change", e=>setFinancialYear(e.target.value));
}

function render(page="dashboard"){
 const c=document.getElementById("content");
 if(page==="dashboard") return dashboard(c);
 if(page==="parties") return parties(c);
 if(page==="ledger") return ledger(c);
 if(page==="products") return products(c);
 if(page==="stock") return stock(c);
 if(page==="purchase") return purchase(c);
 if(page==="sales") return sales(c);
 if(page==="reports") return reports(c);
 if(page==="activities") return activities(c);
 if(page==="settings") return settings(c);
}
function dashboard(c){
 const purchase=state.purchases.reduce((a,x)=>a+Number(x.total||0),0), sale=state.sales.reduce((a,x)=>a+Number(x.total||0),0);
 c.innerHTML=`<div class="page"><div class="page-head"><div><h2>Dashboard</h2><small>Financial Year: <b>${sessionStorage.getItem("ims_financial_year")||"2026-27"}</b> &nbsp;|&nbsp; Welcome to Assam Inventory Management System</small></div><button class="btn" onclick="nav('activities')">📋 View Activity</button></div>
 <div class="cards">
 <div class="card blue">Total Parties<b>${state.parties.length}</b></div><div class="card green">Total Products<b>${state.products.length}</b></div>
 <div class="card orange">Total Purchase<b>${money(purchase)}</b></div><div class="card purple">Total Sales<b>${money(sale)}</b></div>
 <div class="card teal">Today's Collection<b>${money(sale)}</b></div><div class="card red">Outstanding<b>${money(0)}</b></div></div>
 <div class="grid2"><div class="panel"><h3>Stock Summary</h3>${stockTable()}</div><div class="panel"><h3>Sales & Purchase Overview</h3><div class="chart">${[45,60,52,70,58,82,75].map((v,i)=>`<div class="bar" style="height:${v}%"><span>${22+i} Sep</span></div>`).join("")}</div></div></div>
 <div class="grid3"><div class="panel"><h3>Recent Transactions</h3>${transactions()}</div><div class="panel"><h3>Top Products</h3>${topProducts()}</div><div class="panel quick"><h3>Quick Actions</h3>
 <button class="btn" onclick="nav('parties')">👤 Add Party</button><button class="btn greenbtn" onclick="nav('products')">📦 Add Product</button><button class="btn orangebtn" onclick="nav('purchase')">🛒 New Purchase</button><button class="btn" onclick="nav('sales')">🧾 New Invoice</button><button class="btn greenbtn" onclick="nav('reports')">📊 Generate Report</button></div></div>
 <div class="footer">Assam Inventory Management System | Version 1.0</div></div>`;
}
function stockTable(){
 if(!state.products.length)return '<div class="empty">No products yet. Add your first stock item.</div>';
 return `<table class="table"><tr><th>Product</th><th>Opening</th><th>Purchase</th><th>Sales</th><th>Closing</th><th>Status</th></tr>${state.products.map(p=>{let pur=state.purchases.filter(x=>x.product===p.name).reduce((a,x)=>a+Number(x.qty),0), sal=state.sales.filter(x=>x.product===p.name).reduce((a,x)=>a+Number(x.qty),0), close=Number(p.opening||0)+pur-sal;return `<tr><td>${esc(p.name)}</td><td>${p.opening||0}</td><td>${pur}</td><td>${sal}</td><td>${close}</td><td><span class="status">${close>0?"In Stock":"Out of Stock"}</span></td></tr>`}).join("")}</table>`;
}
function transactions(){
 const arr=[...state.sales.map(x=>({...x,type:"Sales"})),...state.purchases.map(x=>({...x,type:"Purchase"}))].slice(-8).reverse();
 if(!arr.length)return '<div class="empty">No transactions yet.</div>';
 return `<table class="table"><tr><th>Date</th><th>Type</th><th>Party</th><th>Amount</th></tr>${arr.map(x=>`<tr><td>${esc(x.date)}</td><td>${x.type}</td><td>${esc(x.party)}</td><td>${money(x.total)}</td></tr>`).join("")}</table>`;
}
function topProducts(){if(!state.products.length)return '<div class="empty">No products.</div>';return `<table class="table"><tr><th>Product</th><th>Unit</th><th>Min</th></tr>${state.products.slice(0,8).map(p=>`<tr><td>${esc(p.name)}</td><td>${esc(p.unit)}</td><td>${p.min||0}</td></tr>`).join("")}</table>`}
function parties(c){
 c.innerHTML=`<div class="page"><div class="page-head"><h2>Party Management</h2><button class="btn" onclick="document.getElementById('partyForm').scrollIntoView()">+ Add Party</button></div>
 <div class="panel"><h3>Add Party</h3><form id="partyForm" onsubmit="addParty(event)"><div class="form-grid">
 <div class="field"><label>Party Name *</label><input id="pname" required></div><div class="field"><label>Mobile</label><input id="pmobile"></div><div class="field"><label>GSTIN</label><input id="pgstin"></div>
 <div class="field full"><label>Address</label><textarea id="paddress"></textarea></div></div><br><button class="btn">Save Party</button></form></div>
 <div class="panel" style="margin-top:16px"><h3>Party List</h3><table class="table"><tr><th>ID</th><th>Name</th><th>Mobile</th><th>GSTIN</th><th>Action</th></tr>${state.parties.map((p,i)=>`<tr><td>PTY${String(i+1).padStart(4,"0")}</td><td>${esc(p.name)}</td><td>${esc(p.mobile)}</td><td>${esc(p.gstin)}</td><td><button class="btn redbtn" onclick="deleteParty(${i})">Delete</button></td></tr>`).join("")}</table></div></div>`;
}
function addParty(e){e.preventDefault();state.parties.push({name:pname.value,mobile:pmobile.value,gstin:pgstin.value,address:paddress.value});save();toast("Party saved successfully");parties(document.getElementById("content"))}
function deleteParty(i){if(confirm("Delete this party?")){state.parties.splice(i,1);save();parties(document.getElementById("content"))}}
function products(c){
 c.innerHTML=`<div class="page"><div class="page-head"><h2>Inventory / Stock Master</h2></div><div class="panel"><h3>Add Stock / Product</h3><form onsubmit="addProduct(event)"><div class="form-grid">
 <div class="field"><label>Stock Code</label><input id="scode"></div><div class="field"><label>Stock Name *</label><input id="sname" required></div><div class="field"><label>Category</label><input id="scat"></div>
 <div class="field"><label>Unit</label><select id="sunit"><option>Piece</option><option>Ream</option><option>Sheet</option><option>Kg</option><option>Box</option></select></div><div class="field"><label>Opening Quantity</label><input id="opening" type="number" min="0" value="0"></div><div class="field"><label>Minimum Stock</label><input id="min" type="number" min="0" value="0"></div><div class="field"><label>GST %</label><input id="gst" type="number" min="0" value="0"></div>
 </div><br><button class="btn">Save Product</button></form></div>
 <div class="panel" style="margin-top:16px"><h3>Stock List</h3><table class="table"><tr><th>Code</th><th>Product</th><th>Category</th><th>Unit</th><th>Opening</th><th>Min</th><th>Action</th></tr>${state.products.map((p,i)=>`<tr><td>${esc(p.code)}</td><td>${esc(p.name)}</td><td>${esc(p.category)}</td><td>${esc(p.unit)}</td><td>${p.opening}</td><td>${p.min}</td><td><button class="btn redbtn" onclick="deleteProduct(${i})">Delete</button></td></tr>`).join("")}</table></div></div>`;
}
function addProduct(e){e.preventDefault();state.products.push({code:scode.value,name:sname.value,category:scat.value,unit:sunit.value,opening:Number(opening.value),min:Number(min.value),gst:Number(gst.value)});save();toast("Product saved successfully");products(document.getElementById("content"))}
function deleteProduct(i){if(confirm("Delete product?")){state.products.splice(i,1);save();products(document.getElementById("content"))}}
function stock(c){c.innerHTML=`<div class="page"><div class="page-head"><h2>Stock Register</h2><button class="btn greenbtn" onclick="exportCSV()">Export Excel (CSV)</button></div><div class="panel"><h3>Automatic Closing Stock</h3>${stockTable()}</div></div>`}
function purchase(c){
 c.innerHTML=`<div class="page"><div class="page-head"><h2>New Purchase</h2></div><div class="panel"><form onsubmit="savePurchase(event)"><div class="form-grid">
 <div class="field"><label>Supplier / Party</label><select id="party">${state.parties.map(p=>`<option>${esc(p.name)}</option>`).join("")}</select></div><div class="field"><label>Invoice No</label><input id="invno" required></div><div class="field"><label>Date</label><input id="date" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
 <div class="field"><label>Product</label><select id="product">${state.products.map(p=>`<option>${esc(p.name)}</option>`).join("")}</select></div><div class="field"><label>Quantity</label><input id="qty" type="number" min="1" value="1" required></div><div class="field"><label>Rate</label><input id="rate" type="number" min="0" value="0" required></div>
 </div><br><button class="btn orangebtn">Save Purchase</button></form></div></div>`;
}
function sales(c){
 c.innerHTML=`<div class="page"><div class="page-head"><h2>New Invoice</h2></div><div class="panel"><form onsubmit="saveSale(event)"><div class="form-grid">
 <div class="field"><label>Party</label><select id="party">${state.parties.map(p=>`<option>${esc(p.name)}</option>`).join("")}</select></div><div class="field"><label>Invoice No</label><input id="invno" value="INV-${String(state.sales.length+1).padStart(5,"0")}" required></div><div class="field"><label>Date</label><input id="date" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
 <div class="field"><label>Product</label><select id="product">${state.products.map(p=>`<option>${esc(p.name)}</option>`).join("")}</select></div><div class="field"><label>Quantity</label><input id="qty" type="number" min="1" value="1" required></div><div class="field"><label>Rate</label><input id="rate" type="number" min="0" value="0" required></div>
 <div class="field"><label>GST %</label><input id="gst" type="number" min="0" value="18"></div><div class="field"><label>Discount</label><input id="discount" type="number" min="0" value="0"></div>
 </div><br><button class="btn">Save Invoice</button></form></div></div>`;
}
function savePurchase(e){e.preventDefault();let total=Number(qty.value)*Number(rate.value);state.purchases.push({party:party.value,invoice:invno.value,date:date.value,product:product.value,qty:Number(qty.value),rate:Number(rate.value),total});save();toast("Purchase saved");dashboard(document.getElementById("content"))}
function saveSale(e){e.preventDefault();let subtotal=Number(qty.value)*Number(rate.value),g=Number(gst.value),d=Number(discount.value),tax=Math.max(0,subtotal-d),total=tax+(tax*g/100);state.sales.push({party:party.value,invoice:invno.value,date:date.value,product:product.value,qty:Number(qty.value),rate:Number(rate.value),total});save();toast("Invoice saved");dashboard(document.getElementById("content"))}
function ledger(c){c.innerHTML=`<div class="page"><div class="page-head"><h2>Party Ledger</h2></div><div class="panel"><div class="empty">Select a party from the Party Management section. Ledger transactions will appear here as purchases, sales and payments are added.</div></div></div>`}
function reports(c){c.innerHTML=`<div class="page"><div class="page-head"><h2>Reports</h2></div><div class="report-tools"><button class="btn" onclick="exportCSV()">Stock CSV</button><button class="btn greenbtn" onclick="window.print()">Print Report</button></div><div class="grid2"><div class="panel"><h3>Stock Report</h3>${stockTable()}</div><div class="panel"><h3>Transaction Report</h3>${transactions()}</div></div></div>`}
function activities(c){
 const fy=sessionStorage.getItem("ims_financial_year")||"2026-27";
 const items=[
   ...state.sales.map(x=>({date:x.date,type:"Sales Invoice",party:x.party,detail:x.product,amount:x.total})),
   ...state.purchases.map(x=>({date:x.date,type:"Purchase Entry",party:x.party,detail:x.product,amount:x.total}))
 ].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 c.innerHTML=`<div class="page"><div class="page-head"><div><h2>Work & Other Activity</h2><small>Financial Year: <b>${fy}</b></small></div><button class="btn" onclick="nav('dashboard')">← Dashboard</button></div>
 <div class="cards activity-cards">
   <div class="card blue">Purchases<b>${state.purchases.length}</b><small>entries</small></div>
   <div class="card green">Sales<b>${state.sales.length}</b><small>invoices</small></div>
   <div class="card orange">Parties<b>${state.parties.length}</b><small>masters</small></div>
   <div class="card purple">Products<b>${state.products.length}</b><small>stock items</small></div>
 </div>
 <div class="grid2" style="margin-top:18px"><div class="panel"><h3>Recent Activity</h3>${items.length?`<div class="activity-list">${items.slice(0,12).map(x=>`<div class="activity-item"><div class="activity-icon">${x.type.startsWith("Sales")?"🧾":"🛒"}</div><div class="activity-info"><b>${esc(x.type)}</b><span>${esc(x.party||"")} • ${esc(x.detail||"")}</span><small>${esc(x.date||"")}</small></div><strong>${money(x.amount)}</strong></div>`).join("")}</div>`:'<div class="empty">No activity recorded yet.</div>'}</div>
 <div class="panel"><h3>Other Activities</h3><div class="activity-actions"><button class="btn" onclick="nav('parties')">👤 Party Master</button><button class="btn greenbtn" onclick="nav('products')">📦 Stock Master</button><button class="btn orangebtn" onclick="nav('purchase')">🛒 Purchase Entry</button><button class="btn" onclick="nav('sales')">🧾 Sales Invoice</button><button class="btn greenbtn" onclick="nav('stock')">📊 Stock Register</button><button class="btn secondary" onclick="nav('reports')">📑 Reports</button></div></div></div></div>`;
}
function settings(c){c.innerHTML=`<div class="page"><div class="page-head"><h2>Settings</h2></div><div class="panel"><h3>Company Information</h3><div class="form-grid"><div class="field"><label>Company Name</label><input value="Assam Inventory Management"></div><div class="field"><label>Phone</label><input value="9864724813"></div><div class="field"><label>GSTIN</label><input value="NOT REGISTER"></div><div class="field full"><label>Address</label><textarea>Guwahati, Assam</textarea></div></div><br><button class="btn" onclick="toast('Settings saved')">Save Settings</button></div></div>`}
function exportCSV(){let rows=[["Product","Opening","Purchase","Sales","Closing"]];state.products.forEach(p=>{let pur=state.purchases.filter(x=>x.product===p.name).reduce((a,x)=>a+Number(x.qty),0),sal=state.sales.filter(x=>x.product===p.name).reduce((a,x)=>a+Number(x.qty),0);rows.push([p.name,p.opening,pur,sal,Number(p.opening)+pur-sal])});let csv=rows.map(r=>r.join(",")).join("\\n"),a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download="Stock_Report.csv";a.click();toast("CSV exported")}
function logout(){
  sessionStorage.removeItem("ims_logged_in");
  sessionStorage.removeItem("ims_user");
  sessionStorage.removeItem("ims_financial_year");
  applyLoginState();
}
applyLoginState();
const savedFY=sessionStorage.getItem("ims_financial_year")||"2026-27";
const fySelect=document.getElementById("mainFinancialYear");
if(fySelect) fySelect.value=savedFY;
if (isLoggedIn()) render();
