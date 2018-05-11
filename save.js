$(document).ready(function () {
    $('.sidenav').sidenav();
    $('.collapsible').collapsible({
      accordion: false
    });
    $('select').formSelect();
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
  
  ref.on('child_added', function (data) {
    let itemLoad = data.val();
    let table = document.getElementById(itemLoad.list);
    let row = table.insertRow(0);
    row.insertCell(0).innerHTML = itemLoad.item;
    row.insertCell(1).innerHTML = itemLoad.quant;
    row.insertCell(2).innerHTML = itemLoad.dolarsValue;
    row.insertCell(3).innerHTML = itemLoad.reaisValue;
    let btn = row.insertCell(4);
    let delBtn = document.createElement('button');
    delBtn.className = 'btn-small btn-floating red right delete';
    delBtn.appendChild(document.createTextNode('X'));
    btn.appendChild(delBtn);
    sumTotals();
  }, function (error) {
    console.log("Error: " + error.code);
  });
  
  function converter() {
    $.getJSON('https://free.currencyconverterapi.com/api/v5/convert?q=USD_BRL,BRL_USD&compact=ultra&callback=?', function (data) {
      document.getElementById('conversion').innerHTML = data.USD_BRL.toFixed(3);
    });
  }
  converter();
  
  const add = document.getElementsByClassName('itemCardPanel');
  [].forEach.call(add, function (el) {
    el.addEventListener('click', addItemPanel);
  });
  function addItemPanel() {
    document.getElementById('addPanel').classList.remove('hide');
    document.getElementById('searchPanel').classList.add('hide');
  }
  document.getElementById('cancelAdd').addEventListener('click', function () {
    document.getElementById('addPanel').classList.add('hide');
  });
  
  const search = document.getElementsByClassName('searchPanel');
  [].forEach.call(search, function (el) {
    el.addEventListener('click', searchItem);
  });
  function searchItem() {
    document.getElementById('addPanel').classList.add('hide');
    document.getElementById('searchPanel').classList.remove('hide');
  }
  document.getElementById('cancelSearch').addEventListener('click', function () {
    document.getElementById('searchPanel').classList.add('hide');
  });
  
  let dolars = document.getElementById('dolars');
  dolars.addEventListener('input', function () {
    let conversion = document.getElementById('conversion').innerHTML;
    document.getElementById('reais').value = (dolars.value * conversion).toFixed(2);
  });
  let reais = document.getElementById('reais');
  reais.addEventListener('input', function () {
    let conversion = document.getElementById('conversion').innerHTML;
    document.getElementById('dolars').value = (reais.value / conversion).toFixed(2);
  });
  
  const submitAdd = document.getElementById('submitAdd');
  submitAdd.addEventListener('click', addItem);
  function addItem() {
    let data = {
      list: document.getElementById('selectList').value,
      item: document.getElementById('description').value,
      quant: document.getElementById('quantity').value,
      dolarsValue: document.getElementById('dolars').value,
      reaisValue: document.getElementById('reais').value
    }
    ref.push(data);
    document.getElementById('addPanel').classList.add('hide');
    document.getElementById('description').value = '';
    document.getElementById('quantity').value = '1';
    document.getElementById('dolars').value = '';
    document.getElementById('reais').value = '';
  }
  
  /* function addItem() {
    let newItem = document.getElementById('description').value;
    let newItemQtd = document.getElementById('quantity').value;
    let dolars = document.getElementById('dolars').value;
    let reais = document.getElementById('reais').value;
    let selectList = document.getElementById('selectList').value;
    function insertRow(lista) {
      let table = document.getElementById(lista);
      let row = table.insertRow(0);
      let item = row.insertCell(0);
      let qtd = row.insertCell(1);
      let usd = row.insertCell(2);
      let brl = row.insertCell(3);
      let btn = row.insertCell(4);
      item.innerHTML = newItem;
      qtd.innerHTML = newItemQtd;
      usd.innerHTML = (dolars * newItemQtd).toFixed(2);
      brl.innerHTML = (reais * newItemQtd).toFixed(2);
      let delBtn = document.createElement('button');
      delBtn.className = 'btn-small btn-floating red right delete';
      delBtn.appendChild(document.createTextNode('X'));
      btn.appendChild(delBtn);
      document.getElementById('addPanel').classList.add('hide');
      document.getElementById('description').value = '';
      document.getElementById('quantity').value = '1';
      document.getElementById('dolars').value = '';
      document.getElementById('reais').value = '';
    }
    if (selectList === 'buy') {
      insertRow('buyBody');
      sumTotals();
    }
    else {
      insertRow('wishBody');
      sumTotals();
    }
  } */
  
  const tables = document.getElementsByClassName('highlight');
  [].forEach.call(tables, function (el) {
    el.addEventListener('click', removeRow);
  });
  function removeRow(e) {
    if (e.target.classList.contains('delete')) {
      if (confirm('Você tem certeza?')) {
        var rowT = e.target.parentElement.parentElement.firstChild.innerText;
        var rowI = e.target.parentElement.parentElement.rowIndex;
        this.deleteRow(rowI);
        ref.on('child_added', function (data) {
          if (rowT === data.val().item) {
            ref.child(data.key).remove();
          }
        });
        sumTotals();
      }
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
    console.log(items);
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