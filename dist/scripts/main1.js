let datalastId = 0
let globalTitle = 'Orror hor'

let state = {
    login: false
}
////UTILS PART
//import hashCode from './utils'
//import getCookie from './utils'
const hashCode = function(string) {
    let hash = 0;
    if (string.length == 0) {
        return hash;
    }
    for (let i = 0; i < string.length; i++) {
        let char = string.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
const getCookie = function(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}
////


function send(e){
    e.preventDefault();
    let formData = new FormData(document.querySelector('#theForm'))
    formData.append('auName', state.data.username)
    $.ajax({
        type: 'POST',
        url: 'new.bat',
        data : formData,
        //contentType: "multipart/form-data",
        //cache: false,
        contentType: false,
        processData: false,
        success: function(data) {
            console.log(data)
        }
    })
    titleInp.value = ''
    textInp.value = ''
    $('#myModal').modal('hide');
}

function upd(){
    $.ajax({
        type: 'GET',
        url: 'refresh.bat',
        data : { 'i' : datalastId},
        success: function(data) {
            //console.log("ajax refresh success", data.length);
            data.forEach(x => {
                //console.log(x)
                let templ = document.querySelector('#noticeCardTemp')
                let view = document.querySelector("#mainView")
                let clone = document.importNode(templ.content, true);
                //imgpls?imgId=96
                clone.querySelectorAll("img")[0].src = "imgpls?imgId=" + x.ad_id
                clone.querySelectorAll("h6")[0].textContent = x.title
                clone.querySelectorAll("p")[0].textContent = x.text
                clone.querySelectorAll("p")[1].textContent = x.contacts
                clone.querySelectorAll(".authorLink")[0].setAttribute("href", x.author_id)
                clone.querySelectorAll(".authorLink")[0].textContent = x.auname
                clone.querySelectorAll(".hits")[0].textContent = x.hits
                let dat = x.created_on.split('T')
                clone.querySelectorAll(".date0")[0].textContent = dat[0]
                clone.querySelectorAll(".date1")[0].textContent = dat[1]
                $(clone).find(".btnSeeMore").data('adId', x.ad_id)
                clone.querySelectorAll(".nCardCategories")[0].textContent = x.categories
                if (Array.isArray(x.categories)){
                    x.categories.forEach(xxx=>{
                        let newTag = document.createElement("span")
                        newTag.textContent = xxx
                        newTag.classList.add("badge", "bg-info", "mx-1", "my-0")
                        clone.querySelectorAll(".cardCategoriesVis")[0].appendChild(newTag)
                    })
                    
                }
                view.appendChild(clone);
                datalastId = x.ad_id               
            });
        },
        error: function(msg) {
            console.log("ajax refresh failed", msg);
        }
    })
}

function stateLogin(){
    state.login = true
    $(".logoutPart").removeClass("d-none")
    $(".loginPart").toggleClass('d-flex').hide(0)//.addClass("d-none")
    //$(".registerControl").addClass("d-none")
    $(".registerControl").hide(0)
    $(".uc__statusBadge").text("logged in")
    $(".uc__statusBadge").removeClass("bg-warning")
    $(".uc__statusBadge").addClass("bg-success")
    $("#uc__btnProfile").text('Profile: ' + state.data.username)
    $('#uc__btnProfile').prop('disabled', false)
    $('#modalToggle').prop('disabled', false)
}
function stateLogout(){
    state.login = false
    $(".logoutPart").addClass("d-none")
    $(".loginPart").toggleClass('d-flex').show(0)//.addClass("d-none")
    //$(".registerControl").addClass("d-none")
    $(".registerControl").show(0)
    $(".uc__statusBadge").text("not logged in")
    $(".uc__statusBadge").addClass("bg-warning")
    $(".uc__statusBadge").removeClass("bg-success")
    $("#uc__btnProfile").text("Profile: None")
    $('#uc__btnProfile').prop('disabled', true)
    $('#modalToggle').prop('disabled', true)
}
function login(e){
    e.preventDefault();
    $.ajax({
        type: 'GET',
        url: 'login',
        data : {
            login: $("#logLogin")[0].value,
            pw: hashCode($("#logPW")[0].value)
        },
        statusCode: {
            200: function(data) {
            console.log(data)
            console.log(200)
            state.data = JSON.parse(getCookie("state")) 
            stateLogin()
            },
            201: function(data) {
            console.log(data)
            console.log(201)
            }
        }
    })
}
function logout(e){
    e.preventDefault();
    $.ajax({
        type: 'GET',
        url: 'logout',
        success: function(data) {
            stateLogout()
        }
    })
}


upd();
function timerGo() {
    setTimeout(function() {
        upd();
        timerGo();
  }, 3000);
}

timerGo();




$( document ).ready(function() {
    $(".btnLogin").on("click", login)
    $(".btnLogout").on("click", logout)
    $('#myModal').on('shown.bs.modal', function () {
        $('#textInp').trigger('focus')
    })
    $('#categoriesInp').tagsInput({
        'height':'48px',
        'width':'100%',
        'maxChars' : 14
    });

    if (getCookie("state")!=''){
        state.data = JSON.parse(getCookie("state"))
        stateLogin()
    }
})


function sendInit(e){
    //ajax on that init
    $.ajax({
        type: 'GET',
        url: 'init.bat',
        data : { 'hi' : 'dud' },
        success: function(data) {
            console.log('init success')
        },
        error: function(data){
            console.log('init fail')
        }
    })
}

theForm.addEventListener("submit", send);
//initNotices.addEventListener("click", sendInit);
//picInp.addEventListener("change", getBase64);
function setGlobalInfo(e){
    globalTitle = 'the durpest'
    if (e.target.nodeName == 'BUTTON'){
        if (e.target.parentElement.parentElement.classList.contains('noticeCard')) {
            $('.oldModalPic').attr('src', $(e.target.parentElement.parentElement).find('img').attr('src') )
            $('.oldModalTitle').text($(e.target.parentElement.parentElement).find('h6').text())
            $('.oldModalText').text($(e.target.parentElement.parentElement).find('.cardsText').text())
            $('.oldModalContacts').text($(e.target.parentElement.parentElement).find('.cardsContacts').text())
            $('.oldModalAuthor').text($(e.target.parentElement.parentElement).find('.auId').text())
            $('.oldModalHits').text($(e.target.parentElement.parentElement).find('.hits').text())
            $('.oldModalDate').text($(e.target.parentElement.parentElement).find('.date0').text() +'___'+ $(e.target.parentElement.parentElement).find('.date1').text())
            $('.oldModalCategories').empty()
            let tmp = $(e.target.parentElement.parentElement).find('.nCardCategories').text().split(',')
            tmp.forEach(x=>{
                $('.oldModalCategories').append('<span class="badge bg-info mx-1">' + x + '</span>')
            })
        }
    }
    else {
        globalTitle = 'errorest! no buttone'
    }
}

$(document).on("click touch", '.btnSeeMore', function(e) {
    //console.log($(e.target).data('adId'))
    hit(e)
    setGlobalInfo(e)
});

function hit(e){    
    let id = $(e.target).data('adId')
    console.log(id)
    let tmp = $(e.target.parentElement.parentElement).find('.hits').text()
    $(e.target.parentElement.parentElement).find('.hits').text(parseInt(tmp) + 1);
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'hit.bat?id=' + id, true);
    xhr.onload = function() {
        /*if (xhr.status === 200) {
            console.log('User\'s name is ' + xhr.responseText);
        }
        else {
            console.log('Request failed.  Returned status of ' + xhr.status);
        }*/
    };
    xhr.send();    
    
}