let datalastId = 0
let globalTitle = 'Orror horror'
let theFile

function getBase64() {
    var reader = new FileReader();
    reader.readAsDataURL(picInp.files[0]);
    reader.onload = function () {
      console.log(reader.result);
      theFile = reader.result
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
 }

/*function send(e){
    e.preventDefault();
    $.ajax({
        type: 'POST',
        url: 'new.bat',
        data : {
            'title' : titleInp.value,
            'text' : textInp.value,
            'cont' : contactsInp.value
        },
        success: function(data) {
            console.log(data)
            if (theFile != undefined){
                $.ajax({
                    type: 'POST',
                    url: 'img.bat',
                    data : {'ad_id':67, 'f': theFile},
                    success: function(data) {
                        console.log('img: ', data)
                        
                    }
                })
            }
        }
    })
    titleInp.value = ''
    textInp.value = ''
    $('#myModal').modal('hide');
}*/

function send(e){
    e.preventDefault();
    let formData = new FormData(document.querySelector('#theForm'))
    //let formData = new FormData()
    //formData.append('title','yolo')
    //formData.append('filll','swag')
    //formData.append('file',picInp)
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
    //textInp.value = ''
    //picInp.value = ''
    $('#myModal').modal('hide');
    /*setTimeout(function(){
        $('#myModal').modal('hide');
        $('#loader').hide(100);
    }, 100);*/

}

function upd(){
    $.ajax({
        type: 'GET',
        url: 'refresh.bat',
        data : { 'i' : datalastId},
        success: function(data) {
            //console.log("ajax refresh success", data.length);
            data.forEach(x => {
                //x = x['row'].substring(1,x['row'].length-1).split(',')
                x = x['row'].substring(1,x['row'].length-1)
                //console.log(x)
                x = JSON.parse('[' + x + ']')
                /*x = x.map(y =>{
                    if ((y[0] == '"') && (y[y.length-1] == '"') ) {
                        return y.substring(1,y.length-1)
                    } else return y
                })*/
                //console.log(x)
                let templ = document.querySelector('#noticeCardTemp')
                let view = document.querySelector("#mainView")
                let clone = document.importNode(templ.content, true);
                //imgpls?imgId=96
                clone.querySelectorAll("img")[0].src = "imgpls?imgId=" + x[0]
                clone.querySelectorAll("h6")[0].textContent = x[2]//x.title
                clone.querySelectorAll("p")[0].textContent = x[3]//x.text
                clone.querySelectorAll("p")[1].textContent = x[4]//x.contacts
                clone.querySelectorAll(".auId")[0].textContent = x[1]//x.author_id
                clone.querySelectorAll(".hits")[0].textContent = x[6]//x.hits
                let dat = x[5].split('T')
                clone.querySelectorAll(".date0")[0].textContent = dat[0]
                clone.querySelectorAll(".date1")[0].textContent = dat[1]
                $(clone).find(".btnSeeMore").data('adId', x[0])//x.ad_id) 
                //$(clone).find(".btnSeeMore").data('hurp', 'durp')
                view.appendChild(clone);
                datalastId = x[0] //x.ad_id
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
//picInp.addEventListener("change", getBase64);
function setGlobalInfo(e){
    globalTitle = 'the durpest'
    if (e.target.nodeName == 'BUTTON'){
        if (e.target.parentElement.classList.contains('noticeCard')) {
            $('.oldModalPic').attr('src', $(e.target.parentElement).find('img').attr('src') )
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
    //console.log($(e.target).data('adId'))
    hit(e)
    setGlobalInfo(e)
});

function hit(e){    
    let id = $(e.target).data('adId')
    let tmp = $(e.target.parentElement).find('.hits').text()
    $(e.target.parentElement).find('.hits').text(parseInt(tmp) + 1);
    
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