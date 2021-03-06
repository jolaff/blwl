$(document).ready(function () {
  $('.sidenav').sidenav();
  $('.collapsible').collapsible({
    accordion: false
  });
  $('select').formSelect();
  $('.modal').modal();
});

var config = {
  apiKey: "AIzaSyB-_xk8ctGywA0IpJ-DbN8RdQ02HbxyHK8",
  authDomain: "blwl-db.firebaseapp.com",
  databaseURL: "https://blwl-db.firebaseio.com",
  projectId: "blwl-db",
  storageBucket: "",
  messagingSenderId: "1039685493167"
};

firebase.initializeApp(config);
var db = firebase.database();
var ref = db.ref('items');

function loadMain(data) {
  let itemLoad = data.val();
  let table = document.getElementById(itemLoad.list);
  let row = table.insertRow(0);
  row.id = data.key;
  row.insertCell(0).innerHTML = itemLoad.item;
  row.insertCell(1).innerHTML = itemLoad.quant;
  row.insertCell(2).innerHTML = itemLoad.dolarValue;
  row.insertCell(3).innerHTML = itemLoad.reaisValue;
  //let btn = row.insertCell(4);
  //let editBtn = document.createElement('a');
  //editBtn.className = 'btn-small blue right edit';
  //editBtn.appendChild(document.createTextNode('Edit'));
  //btn.appendChild(editBtn);
  sumTotals();
}

function changeData(data) {
  let itemChange = data.val();
  let row = document.getElementById(data.key);
  let columns = row.children;
  if (row.parentNode.id !== itemChange.list) {
    const newList = itemChange.list;
    const parentList = document.getElementById(newList);
    const firstRow = parentList.firstElementChild;
    parentList.insertBefore(row, firstRow);
  }
  if (row.firstElementChild.innerHTML !== itemChange.item) {
    row.firstElementChild.innerHTML = itemChange.item;
  }
  if (row.firstElementChild.nextElementSibling.innerHTML !== itemChange.quant) {
    row.firstElementChild.nextElementSibling.innerHTML = itemChange.quant;
  }
  if (row.firstElementChild.nextElementSibling.nextElementSibling.innerHTML !== itemChange.dolarValue) {
    row.firstElementChild.nextElementSibling.nextElementSibling.innerHTML = itemChange.dolarValue;
  }
  if (row.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling.innerHTML !== itemChange.reaisValue) {
    row.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling.innerHTML = itemChange.reaisValue;
  }
  sumTotals();
}

function excludeData(data) {
  let itemLoad = data.val();
  let table = document.getElementById(itemLoad.list);
  let rowI = document.getElementById(data.key).rowIndex;
  table.deleteRow(rowI - 1);
  sumTotals();
}

ref.on('child_added', loadMain, function(error) {
  console.log("Error: " + error.code);
});

ref.on('child_changed', changeData, function(error) {
  console.log("Error: " + error.code);
});

ref.on('child_removed', excludeData, function(error) {
  console.log("Error: " + error.code);
});

function converter() {
  $.getJSON('https://free.currencyconverterapi.com/api/v5/convert?q=USD_BRL,BRL_USD&compact=ultra&callback=?', function (data) {
    document.getElementById('conversion').innerHTML = data.USD_BRL.toFixed(3);
  });
}
converter();

const search = document.getElementsByClassName('searchPanel');
[].forEach.call(search, function (el) {
  el.addEventListener('click', searchItem);
});
function searchItem() {
  document.getElementById('searchPanel').classList.remove('hide');
}
document.getElementById('cancelSearch').addEventListener('click', function () {
  document.getElementById('searchPanel').classList.add('hide');
  searchField.value = '';
  var items = document.querySelectorAll('tbody tr');
  Array.from(items).forEach(function (item) {
    item.classList.remove('hide');
  });
});

const add = document.getElementsByClassName('itemCardPanel');
[].forEach.call(add, function (el) {
  el.addEventListener('click', function () {
    document.getElementById('submitAdd').classList.remove('hide');
    document.getElementById('delBtn').classList.add('hide');
    document.getElementById('editBtn').classList.add('hide');
  });
});

let dolar = document.getElementById('dolar');
dolar.addEventListener('input', function () {
  let conversion = document.getElementById('conversion').innerHTML;
  document.getElementById('real').value = (dolar.value * conversion).toFixed(2);
});
let real = document.getElementById('real');
real.addEventListener('input', function () {
  let conversion = document.getElementById('conversion').innerHTML;
  document.getElementById('dolar').value = (real.value / conversion).toFixed(2);
});

const submitAdd = document.getElementById('submitAdd');
submitAdd.addEventListener('click', addData);
function addData() {
  let keyData;
  keyData = ref.child('items').push().key;
  let data = {
    list: document.getElementById('selectList').value,
    item: document.getElementById('itemDesc').value,
    quant: document.getElementById('quantity').value,
    dolarValue: (document.getElementById('dolar').value * document.getElementById('quantity').value).toFixed(2),
    reaisValue: (document.getElementById('real').value * document.getElementById('quantity').value).toFixed(2)
  }
  let updates = {};
  updates[keyData] = data;
  ref.update(updates);
  clear();
}

const cancelAdd = document.getElementById('cancelAdd');
cancelAdd.addEventListener('click', clear);
function clear() {
  document.getElementById('itemDesc').value = '';
  document.getElementById('selectList').selectedIndex = 0;
  document.getElementById('quantity').value = '1';
  document.getElementById('dolar').value = '';
  document.getElementById('real').value = '';
}

const tables = document.querySelectorAll('table.highlight > tbody');
[].forEach.call(tables, function (el, i) {
  console.log(tables[i]);
  let touch = new Hammer(tables[i]);
  //el.addEventListener('click', editItem);
  touch.on('press', editItem);
  el.addEventListener('dblclick', makePreju);
});

var indexOfRow;
function editItem(e) {
  e.preventDefault();
  //if (e.target.classList.contains('edit')) {
    let item = e.target;
    let selectList = document.getElementById('selectList');
    item.setAttribute('href', '#addModal');
    item.classList.add('modal-trigger')
    document.getElementById('delBtn').classList.remove('hide');
    document.getElementById('editBtn').classList.remove('hide');
    document.getElementById('submitAdd').classList.add('hide');
    indexOfRow = item.parentNode.id;
    console.log(indexOfRow);
    loadData(indexOfRow);
  //}
}

function loadData(rowID) {
  ref.on('child_added', function(data) {
    if (rowID === data.key) {
      document.getElementById('itemDesc').value = data.val().item;
      document.getElementById('quantity').value = data.val().quant;
      if (data.val().list === 'buyList') {
        document.getElementById('selectList').selectedIndex = 0;
      } else {
        document.getElementById('selectList').selectedIndex = 1;
      }
      document.getElementById('dolar').value = data.val().dolarValue / data.val().quant;
      document.getElementById('real').value = data.val().reaisValue / data.val().quant;
    }
  });
}

function makePreju(el) {
  const row = el.target.parentElement;
  const parentList = document.getElementById('prejuList');
  parentList.insertBefore(row, parentList.childNodes[0]);
  ref.on('child_added', function(data) {
    if (row.id === data.key) {
      ref.child(data.key).update({ list: 'prejuList' });
    }
  });
  sumTotals();
}

const editBtn = document.getElementById('editBtn');
editBtn.addEventListener('click', editData);
function editData(e) {
  ref.on('child_added', function(data) {
    if (indexOfRow === data.key) {
      let keyData = data.key;
      let datas = {
        list: document.getElementById('selectList').value,
        item: document.getElementById('itemDesc').value,
        quant: document.getElementById('quantity').value,
        dolarValue: (document.getElementById('dolar').value * document.getElementById('quantity').value).toFixed(2),
        reaisValue: (document.getElementById('real').value * document.getElementById('quantity').value).toFixed(2)
      }
      let updates = {};
      updates[keyData] = datas;
      ref.update(updates);
    }
  });
}

const delBtn = document.getElementById('delBtn');
delBtn.addEventListener('click', removeRow);
function removeRow(e) {
  if (confirm('Você tem certeza?')) {
    ref.on('child_added', function (data) {
      if (indexOfRow === data.key) {
        ref.child(data.key).remove();
      }
    });
    sumTotals();
    clear();
  }
}

function sumTotals() {
  var total = 0;
  const childTable = document.getElementsByClassName('highlight');
  [].forEach.call(childTable, function (el, index) {
    var sumTotal = 0;
    if (childTable[index].children[1].rows.length == 0) {
      if (index == 0) {
        document.getElementById('totalBuy').innerHTML = 'Total: R$ 0.00';
      }
      else if (index == 1) {
        document.getElementById('totalWish').innerHTML = 'Total: R$ 0.00';
      }
      else if (index == 2) {
        document.getElementById('totalPreju').innerHTML = 'Total: R$ 0.00';
      }
    }
    else {
      if (index == 0) {
        let sum = 0;
        var row = childTable[index].children[1].rows;
        [].forEach.call(row, function (el, index) {
          sum += parseFloat(row[index].cells[3].innerText);
        });
        document.getElementById('totalBuy').innerHTML = 'Total: R$ ' + sum.toFixed(2);
        total += sum;
      }
      else if (index == 1) {
        let sum = 0;
        var row = childTable[index].children[1].rows;
        [].forEach.call(row, function (el, index) {
          sum += parseFloat(row[index].cells[3].innerText);
        });
        document.getElementById('totalWish').innerHTML = 'Total: R$ ' + sum.toFixed(2);
        total += sum;
      }
      else if (index == 2) {
        let sum = 0;
        var row = childTable[index].children[1].rows;
        [].forEach.call(row, function (el, index) {
          sum += parseFloat(row[index].cells[3].innerText);
        });
        document.getElementById('totalPreju').innerHTML = 'Total: R$ ' + sum.toFixed(2);
      }
    }
  });
  document.getElementById('total').innerHTML = 'R$ ' + total.toFixed(2);
}
sumTotals();

const searchField = document.getElementById('searchField');
searchField.addEventListener('keyup', searchItems);
function searchItems(e) {
  var text = e.target.value.toLowerCase();
  var items = document.querySelectorAll('tbody tr');
  Array.from(items).forEach(function (item) {
    var itemText = item.firstChild.textContent;
    if (itemText.toLowerCase().indexOf(text) != -1) {
      item.classList.remove('hide');
    }
    else {
      item.classList.add('hide');
    }
  });
}