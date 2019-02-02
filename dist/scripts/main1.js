let datalastId = 0

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
    //$('.oldModal-title').text(globalTitle)
    //TODO: make  it work with dynamically generated content
})
theForm.addEventListener("submit", send);

