console.log("script.js loaded ✔");

let selectedDeath=null;
let selectedKailali=null;

let deathFiltered=[];
let kailaliFiltered=[];

const storage=[];


// ================= ENTER =================
window.enterApp=function(){

  document.getElementById("landing").style.display="none";
  document.getElementById("app").style.display="block";

  deathFiltered=[...deathData];
  kailaliFiltered=[...kailaliData];

  fillFilters();
  renderDeath(deathFiltered);
  renderKailali(kailaliFiltered);

  document.getElementById("deathSearch").addEventListener("input", filterDeathLive);
  document.getElementById("deathDistrict").addEventListener("change", filterDeathLive);

  document.getElementById("kailaliSearch").addEventListener("input", filterKailaliLive);
  document.getElementById("kailaliTopic").addEventListener("change", filterKailaliLive);
};


// ================= DATE FIX =================
function normDate(v){
  if(!v) return "";

  if(typeof v==="number"){
    let d=new Date(v);
    if(!isNaN(d)) return d.toLocaleDateString();
  }

  let d=new Date(v);
  if(!isNaN(d)) return d.toLocaleDateString();

  return v;
}


// ================= FILTER OPTIONS =================
function fillFilters(){

  let d=document.getElementById("deathDistrict");
  let t=document.getElementById("kailaliTopic");

  d.innerHTML=`<option value="">जिल्ला</option>`;
  [...new Set(deathData.map(x=>x["जिल्ला"]))].forEach(v=>{
    d.innerHTML+=`<option>${v}</option>`;
  });

  t.innerHTML=`<option value="">विषय</option>`;
  [...new Set(kailaliData.map(x=>x["उजुरीको विषय"]))].forEach(v=>{
    t.innerHTML+=`<option>${v}</option>`;
  });
}


// ================= FILTER =================
function filterDeathLive(){

  let n=document.getElementById("deathSearch").value.toLowerCase();
  let d=document.getElementById("deathDistrict").value;

  deathFiltered=deathData.filter(x=>
    (!n || (x["मृतकको नाम"]||"").toLowerCase().includes(n)) &&
    (!d || x["जिल्ला"]===d)
  );

  renderDeath(deathFiltered);
}

function filterKailaliLive(){

  let n=document.getElementById("kailaliSearch").value.toLowerCase();
  let t=document.getElementById("kailaliTopic").value;

  kailaliFiltered=kailaliData.filter(x=>
    (!n || (x["पिडितको नामथर"]||"").toLowerCase().includes(n)) &&
    (!t || x["उजुरीको विषय"]===t)
  );

  renderKailali(kailaliFiltered);
}


// ================= RENDER =================
function renderDeath(data){

  let t=document.getElementById("deathTable");

  let html=`<tr>
    <th>नाम</th><th>जिल्ला</th><th>मिति</th><th>Action</th>
  </tr>`;

  data.forEach((d,i)=>{
    html+=`<tr>
      <td>${d["मृतकको नाम"]||""}</td>
      <td>${d["जिल्ला"]||""}</td>
      <td>${normDate(d["मृत्यु भएको मिति"])}</td>
      <td>
        <button onclick="selectDeath(${i})">Match</button>
        <button onclick="viewProfile(${i}, 'death')">Profile</button>
      </td>
    </tr>`;
  });

  t.innerHTML=html;
}


function renderKailali(data){

  let t=document.getElementById("kailaliTable");

  let html=`<tr>
    <th>नाम</th><th>मिति</th><th>विषय</th><th>Action</th>
  </tr>`;

  data.forEach((d,i)=>{
    html+=`<tr>
      <td>${d["पिडितको नामथर"]||""}</td>
      <td>${normDate(d["घटना मिति"])}</td>
      <td>${d["उजुरीको विषय"]||""}</td>
      <td>
        <button onclick="selectKailali(${i})">Match</button>
        <button onclick="viewProfile(${i}, 'kailali')">Profile</button>
      </td>
    </tr>`;
  });

  t.innerHTML=html;
}


// ================= SELECT =================
window.selectDeath=function(i){
  selectedDeath=deathFiltered[i];
  alert("Death selected");
}

window.selectKailali=function(i){
  selectedKailali=kailaliFiltered[i];
  alert("Case selected");
}


// ================= PROFILE VIEW =================
window.viewProfile=function(i,type){

  let data = type==="death" ? deathFiltered[i] : kailaliFiltered[i];

  showProfile(data);
};


// ================= MATCH =================
window.completeMatch=function(){

  if(!selectedDeath || !selectedKailali){
    alert("Select both first");
    return;
  }

  storage.push({death:selectedDeath,kailali:selectedKailali});

  selectedDeath=null;
  selectedKailali=null;

  renderStorage();
}


// ================= STORAGE =================
function renderStorage(){

  let t=document.getElementById("storageTable");

  let html=`<tr>
    <th>मृतक</th><th>पिडित</th><th>Action</th>
  </tr>`;

  storage.forEach((s,i)=>{
    html+=`<tr>
      <td>${s.death["मृतकको नाम"]}</td>
      <td>${s.kailali["पिडितको नामथर"]}</td>
      <td>
        <button onclick="viewCombined(${i})">Profile</button>
        <button onclick="deleteRow(${i})">Clear</button>
      </td>
    </tr>`;
  });

  t.innerHTML=html;
}


// ================= COMBINED PROFILE =================
window.viewCombined=function(i){

  let combined = {
    ...storage[i].death,
    ...storage[i].kailali
  };

  showProfile(combined);
};


// ================= PROFILE MODAL =================
function showProfile(data){

  let modal=document.getElementById("profileModal");
  let content=document.getElementById("profileContent");

  let html="";

  for(let key in data){

    let val=data[key];

    if(key.includes("मिति")) val=normDate(val);

    html+=`<div class="profile-row">
      <div class="label">${key}</div>
      <div class="value">${val||"-"}</div>
    </div>`;
  }

  content.innerHTML=html;
  modal.style.display="flex";
}

window.closeProfile=function(){
  document.getElementById("profileModal").style.display="none";
}


// ================= DELETE =================
window.deleteRow=function(i){
  storage.splice(i,1);
  renderStorage();
}

window.clearAllStorage=function(){
  storage.length=0;
  renderStorage();
}

window.toggleStorage=function(){
  document.getElementById("storage").classList.toggle("active");
}


// ================= EXPORT =================
window.downloadExcel=function(){

  let exportData=storage.map(s=>({
    ...s.death,
    ...s.kailali
  }));

  let ws=XLSX.utils.json_to_sheet(exportData);
  let wb=XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb,ws,"Matches");

  XLSX.writeFile(wb,"TRC_MATCHED_DATA.xlsx");
}