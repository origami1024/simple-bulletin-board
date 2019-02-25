let datalastId = 0


let state = {
    login: false,
    data: {
        contacts: {}
    }
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
    let tmpTitle = $('#titleInp').val()
    console.log(tmpTitle)
    $.ajax({
        type: 'POST',
        url: 'new.bat',
        data : formData,
        contentType: false,
        processData: false,
        success: function(data) {
            //console.log('cp33' + data.ad_id)
            console.log('succses')
            state.data.adslist.push(parseInt(data.ad_id))
            state.data.adsListX.push({ad_id:parseInt(data.ad_id), hits:0, title: tmpTitle})
            tmpAdListText = `<span style="position:relative"><a href="adinfo?ad_id=${data.ad_id}" target="_blank" class="text-white" style="position: relative; text-decoration: none">
            <img src="imgpls?imgId=${parseInt(data.ad_id)}" style="width:75px; height:75px; border:1px solid white;">
            <span style="position:absolute; left:0; bottom:-30px; font-size:10px" class="small bg-secondary">${tmpTitle.substring(0,15)}</span>
            <span class="small bg-secondary rounded border" style="position:absolute; left:0; top:-30px; font-size:10px"><i class="fa fa-eye"></i> ${0}</span>
            </a>
            <button data-ad_id=${parseInt(data.ad_id)} class="btn btn-sm btn-danger border px-1 py-0 btnDeleteAd" style="position:absolute; right:3px; top:-30px;"><i class="fa fa-trash"></i></button></span>`
            $('.userEditAdsBox').append(tmpAdListText)
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
                clone.querySelectorAll(".authorLink")[0].setAttribute("href", "/user?id=" + x.author_id)
                clone.querySelectorAll(".authorLink")[0].textContent = x.auname
                clone.querySelectorAll(".hits")[0].textContent = x.hits
                let dat = x.created_on.split('T')
                clone.querySelectorAll(".date0")[0].textContent = dat[0]
                clone.querySelectorAll(".date1")[0].textContent = dat[1].substring(0, 5)
                $(clone).find(".btnSeeMore").data('adId', x.ad_id)
                clone.querySelectorAll(".nCardCategories")[0].textContent = x.categories
                if (Array.isArray(x.categories)){
                    x.categories.forEach(xxx=>{
                        let newTag = document.createElement("span")
                        newTag.textContent = xxx
                        newTag.classList.add("badge", "bg-info", "my-0")
                        clone.querySelectorAll(".cardCategoriesVis")[0].appendChild(newTag)
                        newTag.insertAdjacentHTML('afterend', "&nbsp;")
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
    $(".loginPart").toggleClass('d-flex').hide(0)
    $(".registerControl").hide(0)
    $(".uc__statusBadge").text("logged in")
    $(".uc__statusBadge").removeClass("bg-warning")
    $(".uc__statusBadge").addClass("bg-success")
    $("#uc__btnProfile").text('Profile: ' + state.data.username)
    $('#uc__btnProfile').prop('disabled', false)
    $('#modalToggle').prop('disabled', false)    
    if (state.data.contacts == null) {
        state.data.contacts = {}
    }
    $('.profileModalTitle').text(`User: ${state.data.username}(id:${state.data.userid})`)
    $('#userEdit__mailField').text(`Inner email: ${state.data.usermail}`)
    $('#userEdit__about').text(state.data.userabout)
    let dat = state.data.created_at.split('T')
    $('#userEdit__dateField').text(`${dat[0]} ${dat[1].substring(0,5)}`)
    uEdit__refreshFromContactsObj()
    $('#userEdit__contactsView').find('.contactsRemoveBtn').hide()
    //adlist 
    /*let tmpAdListText = '' */
    //show the list
    //delete buttons
    //editing maybe in future versions????
    let tmpAdListText = ''
    state.data.adsListX.forEach(ad=>{
        // console.log(ad.ad_id)
        // console.log(ad.title)
        // console.log(ad.hits)
        tmpAdListText += `<span style="position:relative"><a href="adinfo?ad_id=${ad.ad_id}" target="_blank" class="text-white" style="position: relative; text-decoration: none">
            <img src="imgpls?imgId=${ad.ad_id}" style="width:75px; height:75px; border:1px solid white;">
            <span style="position:absolute; left:0; bottom:-30px; font-size:10px" class="small bg-secondary">${ad.title.substring(0,15)}</span>
            <span class="small bg-secondary rounded border" style="position:absolute; left:0; top:-30px; font-size:10px"><i class="fa fa-eye"></i> ${ad.hits}</span>
            </a>
            <button data-ad_id=${ad.ad_id} class="btn btn-sm btn-danger border px-1 py-0 btnDeleteAd" style="position:absolute; right:3px; top:-30px;"><i class="fa fa-trash"></i></button></span>`
    })
    $('.userEditAdsBox').empty()
    $('.userEditAdsBox').append(tmpAdListText)
    //send/modify additional data in cookies about ads of the user

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
    state.data.contacts = {}
    $('.profileModalTitle').text(`User: None(id:None)`)
    $('#userEdit__mailField').text(`Inner email: None`)
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
            //console.log(data)
            //console.log(200)
            state.data = JSON.parse(getCookie("state"))
            stateLogin()
            },
            201: function(data) {
            //console.log(data)
            //console.log(201)
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
    if (e.target.nodeName == 'BUTTON'){
        if (e.target.parentElement.parentElement.classList.contains('noticeCard')) {
            $('.oldModalPic').attr('src', $(e.target.parentElement.parentElement).find('img').attr('src') )
            $('.oldModalTitle').text($(e.target.parentElement.parentElement).find('h6').text())
            $('.oldModalText').text($(e.target.parentElement.parentElement).find('.cardsText').text())
            $('.oldModalContacts').text($(e.target.parentElement.parentElement).find('.cardsContacts').text())
            $('.oldModalAuthor').text($(e.target.parentElement.parentElement).find('.authorLink').text())
            $('.oldModalAuthor').attr("href", $(e.target.parentElement.parentElement).find('.authorLink').attr("href"))
            $('.oldModalHits').text($(e.target.parentElement.parentElement).find('.hits').text())
            $('.oldModalDate').text($(e.target.parentElement.parentElement).find('.date0').text() +' at '+ $(e.target.parentElement.parentElement).find('.date1').text())
            $('.oldModalCategories').empty()
            let tmp = $(e.target.parentElement.parentElement).find('.nCardCategories').text().split(',')
            tmp.forEach(x=>{
                $('.oldModalCategories').append('<span class="badge bg-info mx-1">' + x + '</span>')
            })
        }
    }
    else {
        
    }
}

$(document).on("click touch", '.btnSeeMore', function(e) {
    //console.log($(e.target).data('adId'))
    hit(e)
    setGlobalInfo(e)
});

function hit(e){    
    let id = $(e.target).data('adId')
    console.log('ad_id: ' + id)
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

//manage contactsObj
//when user is logged in
//load that obj on login or cookie check

function uEdit__addToContactsObj(){
    if ((userEdit__cProp.value.length>2) && (userEdit__cVal.value.length>2)) {
        state.data.contacts[userEdit__cProp.value] = userEdit__cVal.value
        userEdit__cProp.value = ''
        userEdit__cVal.value = ''
    }
    //refresh the 
}
function uEdit__refreshFromContactsObj(){
    $('#userEdit__contactsView').empty()
    
    for (let key in state.data.contacts) {
        //console.log(key)
        //key
        //state.contactsObj[key]
        /*span() contact 1 : lalala2
        
              input(type="button" class="btn btn-primary btn-sm contactsRemoveBtn" value="remove!") */
        $('#userEdit__contactsView').append(`<div>${key} : ${state.data.contacts[key]} <button data-key=${key} class='btn btn-danger btn-sm contactsRemoveBtn p-1' style='font-size:13px;line-height:1'><i class="fa fa-trash"></i></button></div>`)
    }
}
function uEdit__removeSelf(key){
    if (typeof state.data.contacts[key] != 'undefined'){
        delete state.data.contacts[key]
    }
}

$(document).on("click touch", "#userEdit__addToContactsObj", e =>{
    uEdit__addToContactsObj()
    uEdit__refreshFromContactsObj()
    $('#userEdit__cProp').focus()
})
$(document).on("click touch", ".contactsRemoveBtn", e =>{
    uEdit__removeSelf(e.target.dataset.key)
    uEdit__refreshFromContactsObj()
})
$(document).on("click touch", "#userEdit__submit", e =>{
    //send to fucks?
    //server checks cookies, if ok then puts it in db
    $.ajax({
        type: 'POST',
        url: 'cUpd',
        data : state.data.contacts,
        success: function(data) {
            console.log('contacts success')
        },
        error: function(data){
            console.log('contacts fail')
        }
    })
})

$(document).on("click touch", "#userEdit__addContactsBtn", e =>{
    $('.contactsRemoveBtn').toggle(250)
})
$('#userEdit__cVal').on("keypress", e => {
    if (e.which === 13) {
        $(this).attr("disabled", "disabled");
        uEdit__addToContactsObj()
        uEdit__refreshFromContactsObj()
        $('#userEdit__cProp').focus()
        $(this).removeAttr("disabled");
    }
})

$(document).on("click touch", ".btnDeleteAd", e =>{
    console.log('delete ad')
    let elemento
    if ($(e.target).is('button')) {
        elemento = e.target
    }
    else {
        elemento = e.target.parentElement
    }
    //console.log('cp1' + elemento.dataset.ad_id)
    state.data.adslist = state.data.adslist.filter(function(elem){
        return elem != elemento.dataset.ad_id; 
    })
    state.data.adsListX = state.data.adsListX.filter(function(elem){
        //console.log(elem.ad_id)
        //console.log(elemento.dataset.ad_id)
        return parseInt(elem.ad_id) != parseInt(elemento.dataset.ad_id); 
    })
    
    //send request about deletion to server
    $.ajax({
        type: 'POST',
        url: 'delAd',
        data: {'ad_id': elemento.dataset.ad_id},
        success: function(data) {
            console.log('delAd success')
        },
        error: function(data){
            console.log('delAd fail')
        }

    })
    $(elemento.parentElement).remove()
})

let degrees = 0
function userEdit__changePW(){
    let oldPW = $('#userEdit__oldPW').val()
    let newPW = $('#userEdit__newPW').val()
    let re = /(^[a-zA-Z\d]{3,20}$)/
    
    var intervalId = setInterval(function(){
        $('#loader').css({'transform' : 'rotate('+ degrees +'deg)'});
        degrees += 2
    },150)
    if (re.test(oldPW) && re.test(newPW)) {
        $('#loader').removeClass('d-none')
        $.ajax({
            type: 'POST',
            url: 'pwChange',
            data: {hash1: hashCode(oldPW), hash2: hashCode(newPW)},
            success: function(data) {
                
                if (data=='ok') {
                    console.log('pw change success')
                    $('#userEdit__oldPW').val('')
                    $('#userEdit__newPW').val('')
                    $('#pwChangeAccordion').collapse("hide")
                } else {
                    console.log('pw change wrong pw')
                }
                clearInterval(intervalId)
                $('#loader').addClass('d-none')
            },
            error: function(data){
                clearInterval(intervalId)
                $('#loader').addClass('d-none')
            }
        })
    }

}
function userEdit__changeAbout(){
    let newAbout = $('#userEdit__about').val()
    if (newAbout != state.data.userabout) {
        $.ajax({
            type: 'POST',
            url: 'abCh',
            data: {about: newAbout},
            success: function(data) {

            },
            error: function(data){}
        })
    } else {
        alert('userabout stays the same')
    }
}

$('#userEdit__changePWBtn').on("click touch", e => {
    userEdit__changePW()
})
$('#userEdit__changeAboutBtn').on("click touch", e => {
    userEdit__changeAbout()
})
