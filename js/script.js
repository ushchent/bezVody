var map,
    singleMarker,
    jsonData,
    icon,
    markerclusterer,
    timeSpan = 86400000 * 14,
    today = new Date(),
    remontData,
    request;

function insertMap() {
    var mapParameters = {
        center: new google.maps.LatLng(53.90, 27.56),
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("mapDiv"), mapParameters);
}

function setMenuEvents() {
    var buttons = document.getElementById("menu").getElementsByClassName("button");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].onclick = function() {
            markerclusterer.clearMarkers();
            if (singleMarker) {
                    singleMarker.setMap(null);
                };
            if (!map.setZoom(11)) {
                    map.setZoom(11);
                    map.setCenter(new google.maps.LatLng(53.90, 27.56));
                };
            selectData(this.getAttribute("id"));
        }
    }
}

function selectData(input) {
    var newData = [];
    for (var i = 0; i < jsonData.length; i++) {
        var startDate = new Date(jsonData[i].start);
        if (input == "uzhe_otkliuchili") {
            if (startDate.getTime() <= today.getTime() && startDate.getTime() >= today.getTime() - timeSpan) {
                newData.push(jsonData[i]);
                icon = "img/blue.png";
            }

        } else if (input == "skoro_otkliuchat") {
            if (startDate.getTime() > today.getTime()) {
                newData.push(jsonData[i]);
                icon = "img/yellow.png";
            }

        } else if (input == "dolzhny_vkliuchit") {
            if (startDate.getTime() < today.getTime() - timeSpan) {
                newData.push(jsonData[i]);
                icon = "img/red.png";
            }
        }
    }
    addMarkers(newData, input, icon);
}

function convertDate(d) {
    var months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    var month = d.getMonth();
    var date = d.getDate();
    return date + " " + months[month];
}

function writeMessage(d) {
    var noWater = [], isWater = [], soonNoWater = [];
    for (var i = 0; i < jsonData.length; i++) {
        var startDate = new Date(jsonData[i].start);
            if (startDate.getTime() <= d.getTime() && startDate.getTime() >= d.getTime() - timeSpan) {
                noWater.push(jsonData[i]);
            } else if (startDate.getTime() > d.getTime()) {
                soonNoWater.push(jsonData[i]);
            } else if (startDate.getTime() < d.getTime() - timeSpan) {
                isWater.push(jsonData[i]);
            }
        }
document.getElementById("message").appendChild(document.createTextNode(convertDate(d) + " без горячей воды остаются " + noWater.length + " домов и скоро отключат в " + soonNoWater.length + " домах:")); // и уже должна быть вода в " + isWater.length + " домов:"));
}

function addMarkers(indata, input) {
    var markers = [];
    for (var i = 0; i < indata.length; i++) {
            var coordinates = new google.maps.LatLng(indata[i].lat, indata[i].lon);
            var address = '<div style="width: 200px, height: 100px;"><b>Адрес:</b> ' +
                indata[i].address +
                '<br>Горячую воду отключают ' + indata[i].start + '</div>';
            var marker = new google.maps.Marker({
                position: coordinates,
                map: map,
                infowindow: new google.maps.InfoWindow({
                content: address
                })
            });
                google.maps.event.addListener(marker, 'click', function() {
                    this.infowindow.open(map, this);
                });
            markers.push(marker);
    };
    var mcOptions = {styles: [{
            height: 52,
            url: icon,
            width: 53
                }]
            };
    markerclusterer = new MarkerClusterer(map, markers, mcOptions);
}

function selectAddress() {
    var addresses = [];
    for (var i = 0; i < jsonData.length; i++) {
        addresses.push(jsonData[i].address);
    };;

    $( "#autocomplete" ).autocomplete({
        source: addresses,
        minLength: 4
    });

    var addressField = document.getElementById("autocomplete");
    addressField.onfocus = function() {
        if (addressField.value == "Проверить адрес") {
            addressField.value = "";
        }
    }
    addressField.onblur = function() {
        if (addressField.value == "") {
            addressField.value = "Проверить адрес";
        }
    }
    var addressButton = document.getElementById("address_button");
    addressButton.onclick = function() {
        if (singleMarker) {
                singleMarker.setMap(null);
            };
        var checker = false;
        var givenAddress = document.getElementById("autocomplete").value;
        if (givenAddress == "Проверить адрес") {
            givenAddress = "Введите адрес";
            checker = true;
        };
        for (var i = 0; i < jsonData.length; i++) {
            if (givenAddress == jsonData[i].address) {
                checker = true;
                var givenAddressLatLng = new google.maps.LatLng(jsonData[i].lat, jsonData[i].lon);
                markerclusterer.clearMarkers();
                map.setCenter(givenAddressLatLng);
                map.setZoom(15);
                var address = '<div style="width: 200px, height: 100px;"><b>Адрес:</b> ' +
                    jsonData[i].address +
                    '<br>Горячую воду отключают ' + jsonData[i].start + '</div>';
                singleMarker = new google.maps.Marker({
                    position: givenAddressLatLng,
                    map: map,
                    infowindow: new google.maps.InfoWindow({
                        content: address
                        })
                    });
                google.maps.event.addListener(singleMarker, 'click', function() {
                        this.infowindow.open(map, this);
                    });
                }
            };
        if (checker == false) {
            alert("По адресу " + givenAddress + " в ближайшее время отключения не ожидается. Вы также можете проверить этот адрес в первоисточнике http://minsk.gov.by/ru/actual/view/625/.");
        };
    }
}

function get_remont_data() {
    
}

window.onload = function() {
    insertMap();
    if (window.XMLHttpRequest) {
        request = new XMLHttpRequest();
    } else {  
        request = new ActiveXObject("Microsoft.XMLHTTP");
    }
    request.onreadystatechange = function(){
        if (request.readyState === 4) {
            data = request.responseText;
            jsonData = JSON.parse(data);
            writeMessage(today);
            selectData("skoro_otkliuchat")
            setMenuEvents();
            selectAddress();
        }
    };
    request.open("GET", "data/data_16.json", true);
    request.send(null);
};

$(document).ready(function() {
    
var itemField = document.getElementById("remont");
    itemField.onfocus = function() {
        if (itemField.value == "Ваш адрес") {
            itemField.value = "";
        }
    }
    itemField.onblur = function() {
        if (itemField.value == "") {
            itemField.value = "Ваш адрес";
        }
    }
var remont_addresses = [];

$.ajax({
            url: 'data/remont_16.json',
            dataType: 'json',
            success: function(data) {
                remontData = data;
                for (var i = 0; i < remontData.length; i++) {
        remont_addresses.push(remontData[i].adres);
    }
            },
            error: function( remontData, status, error ) { 
                console.log(status);
                console.log(error);
            }
        });

$( "#remont" ).autocomplete({
        source: remont_addresses,
        minLength: 4
    });

var remontButton = document.getElementById("remont_button");

remontButton.onclick = function() {
     
if (document.getElementById("remont_table").getElementsByTagName("table")[0]) {
            document.getElementById("remont_table").removeChild(document.getElementById("remont_table").getElementsByTagName("table")[0]);
       } else if (document.getElementById("remont_table").getElementsByTagName("p")[0]){
           document.getElementById("remont_table").removeChild(document.getElementById("remont_table").getElementsByTagName("p")[0]);
       }
    var selectedAddress = document.getElementById("remont").value;
    var tableData = remontData.filter(function(d) { return d.adres == selectedAddress; });


var target = document.getElementById("remont_table");

if (tableData.length != 0) {
    
    var table = document.createElement("table");
    
    var thead = document.createElement("thead");
    var trHead = document.createElement("tr");
    thead.appendChild(trHead);
    table.appendChild(thead);

    var theaders = ["Адрес", "Год постройки", "Начало капремонта"];
    for (var i = 1; i < theaders.length; i++) {
        var headerText = document.createTextNode(theaders[i]);
        var tdHead = document.createElement("td");
        tdHead.appendChild(headerText);
        trHead.appendChild(tdHead);
    }

    var tbody = document.createElement("tbody");
    var trBody = document.createElement("tr");

    var gpostr = tableData[0].gpostr;
    var grem = tableData[0].grem;
    var bodyData = [];
    bodyData.push(gpostr);
    bodyData.push(grem);
    for (var i = 0; i < bodyData.length; i++) {
        var bodyText = document.createTextNode(bodyData[i]);
        var tdBody = document.createElement("td");
        tdBody.appendChild(bodyText);
        trBody.appendChild(tdBody);
    }
    tbody.appendChild(trBody);
    table.appendChild(tbody);
    
    target.appendChild(table);
 } else {
     var message = "<p>У нас пока нет данных о проведении капремонта по указанному адресу.<br>Зайдите позже или обратитесь в свое ЖЭУ.</p>";
     target.innerHTML = message;
 };
};
});
