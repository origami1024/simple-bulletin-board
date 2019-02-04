let datalastId = 0
let globalTitle = 'Orror horror'
function send(e){
    e.preventDefault();
    $.ajax({
        type: 'GET',
        url: 'new.bat',
        data : { 'title' : titleInp.value, 'text' : textInp.value , 'pic' : picInp.value, 'cont' : contactsInp.value },
        success: function(data) {
            //
        }
    })
    titleInp.value = ''
    textInp.value = ''
    picInp.value = ''
    setTimeout(function(){
        $('#myModal').modal('hide');
        $('#loader').hide();
    }, 200);
}

function upd(){
    $.ajax({
        type: 'GET',
        url: 'refresh.bat',
        data : { 'i' : datalastId},
        success: function(data) {
            //console.log("ajax refresh success", data.length);
            data.forEach(x => {
                let templ = document.querySelector('#noticeCardTemp')
                let view = document.querySelector("#mainView")
                let clone = document.importNode(templ.content, true);
                clone.querySelectorAll("h6")[0].textContent = x.title
                clone.querySelectorAll("p")[0].textContent = x.text
                clone.querySelectorAll("p")[1].textContent = x.contacts
                clone.querySelectorAll(".auId")[0].textContent = x.author_id
                clone.querySelectorAll(".hits")[0].textContent = x.hits
                let dat = x.created_on.split('T')
                clone.querySelectorAll(".date0")[0].textContent = dat[0]
                clone.querySelectorAll(".date1")[0].textContent = dat[1]
                view.appendChild(clone);
                datalastId = x.ad_id
            });
        },
        error: function(msg) {
            console.log("ajax refresh failed", msg);
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


$('#myModal').on('shown.bs.modal', function () {
    $('#textInp').trigger('focus')
})
$('#oldModal').on('shown.bs.modal', function () {
    //$('.oldModalTitle').text(globalTitle)
    //TODO: make  it work with dynamically generated content
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
initNotices.addEventListener("click", sendInit);

function setGlobalInfo(e){
    globalTitle = 'the durpest'
    if (e.target.nodeName == 'BUTTON'){
        if (e.target.parentElement.classList.contains('noticeCard')) {
            $('.oldModalTitle').text($(e.target.parentElement).find('h6').text())
            $('.oldModalText').text($(e.target.parentElement).find('.cardsText').text())
            $('.oldModalContacts').text($(e.target.parentElement).find('.cardsContacts').text())
            $('.oldModalAuthor').text($(e.target.parentElement).find('.auId').text())
            $('.oldModalHits').text($(e.target.parentElement).find('.hits').text())
            $('.oldModalDate').text($(e.target.parentElement).find('.date0').text() +'___'+ $(e.target.parentElement).find('.date1').text())
        }
    }
    else {
        globalTitle = 'errorest! no buttone'
    }
}

$(document).on("click touch", '.btnSeeMore', function(e) {
    setGlobalInfo(e)
    like(e)
});

function like(e){
    
    let tmp
    let id
    //send +1
    //find element and current val
    //redo there +1
    /*
    if (e.target.nodeName == 'BUTTON'){
        id = e.target.id.substring(7,e.target.id.length);
        tmp = $(e.target).find('.badge').text();
        $(e.target).find('.badge').text(parseInt(tmp) + 1);
    }
    else {
        id = e.target.parentElement.id.substring(7,e.target.parentElement.id.length);
        tmp = $(e.target.parentElement).find('.badge').text();
        $(e.target.parentElement).find('.badge').text(parseInt(tmp) + 1);
    }
    $.ajax({
            type: 'GET',
          url: 'like.php',
          data : { 'id' : id },
          success: function(data) {
          }
        });
    */
}