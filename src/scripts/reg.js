
//utils
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
//

function reg(e){
  //console.log('trolo')
  e.preventDefault();
  $.ajax({
    type: 'POST',
    url: 'newUser',
    data : {
      login: $("#usernameInp")[0].value,
      pw: hashCode($("#pwInp")[0].value),
      mail: $("#mailInp")[0].value,
      about: $("#userAboutInp")[0].value
    },
    success: function(data) {
      console.log(data)
      if (data == "ok"){
        window.location.href = "/";
        //maybe do automatic login too here
      }
    }
  })
  
}


$("#regSubmit").on("click", reg)