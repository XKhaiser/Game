// js pagina
$(document).ready(function(){

    function getListaProgetti() {

        $.ajax({
            url: "/json/lavori.json",
            dataType: "json",
            success: function(response) {
                $.each(response, function (i, a) {
                    var progetto = template.lavori
                    .replace("[id]", a.id)
                    .replace("[titolo]", a.titolo)
                    .replace("[descrizione]", a.descrizione)
                    .replace("[pathImmagine]", a.pathImmagine)
                    .replace("[type]", a.type);

                    $("#containerProgetti").append(progetto);
                });

                $(".cardList").off("click").on("click", function() {
                    var id = $(this).attr("id");
                    window.location="/page/Progetto.html?id=" + id;
                })
            },
            error: function(xhr, status, error) {
                console.log("Error: " + error);
              }
          });
    };
    getListaProgetti();

    setTimeout(function() {
        var toast = $("#liveToast");

        const toastObj = bootstrap.Toast.getOrCreateInstance(toast)

        toastObj.show()
    }, 10000);

    $('#preload').delay(600).fadeOut(650);
 });