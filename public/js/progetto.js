// js pagina
$(document).ready(function(){

    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    function getProgetto() {
        var idProgetto = getParameterByName('id');

        $.ajax({
            url: "/json/lavori.json",
            dataType: "json",
            success: function(response) {
                
                var progetto = response[idProgetto];
                var nome = progetto.titolo;
                var descrizione = progetto.descrizione;
                var immagine = progetto.pathImmagine;
                var tipo = progetto.type;
                var softwares = progetto.softwares;
                
                var htmlTitle = '<h1 class="text-white">' + nome + ' | <span class="fw-light fs-4">' + tipo + '</span></h1><hr class="text-white w-50" />'
                var htmlImg = '<img class="w-100" src="' + immagine + '">';
                var htmlDesc =  '<div class="text-white w-100">' +
                                    '<h6 class="fw-normal">' + descrizione + '</h6>'
                                '</div>';

                // $("#projectImgs").append(htmlImg);

                var listaSoftwares = '';

                $.each(softwares, function(i, s) {
                    listaSoftwares += '<img class="object-fit" src="/img/' + s + '.png">';
                })

                var videos = "";
                var images = "";
                var model = "";
                var aosAttributes = 'data-aos="fade-up" data-aos-delay="100"';

                if (progetto.model != "") {
                    model = '<div class="container-fluid position-relative" ' + aosAttributes + '><iframe class="w-100 mt-2 mt-md-3 ratio ratio-16x9 h-auto" src="https://sketchfab.com/models/' + progetto.model + '/embed?autospin=0.07&autostart=1&camera=0&scrollwheel=0" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" onmousewheel=""></iframe></div>'
                }

                $.each(progetto.videos, function(i, video) {
                    videos +=   '<div class="container-fluid position-relative" ' + aosAttributes + '><video class="w-100 mt-2 mt-md-3" controls disablepictureinpicture autoplay muted loop>' +
                                    '<source src="' + video + '" type="video/mp4">' +
                                    'Your browser does not support the video tag.' +
                                '</video></div>';
                });

                $.each(progetto.imgs, function(i, image) {
                    images += '<div class="container-fluid position-relative" ' + aosAttributes + '><img class="w-100 mt-2 mt-md-3" src="' + image + '"></div>';
                });

                $("#projectImgs").append(model);
                $("#projectImgs").append(videos);
                $("#projectImgs").append(images);

                var htmlSoftwares = '<div class="text-white mt-3 mt-md-5 w-100 text-center">' +
                                        '<h5 class="mb-3 mb-md-4">Software utilizzati</h5>' +
                                        '<div class="d-flex justify-content-center align-items-center">' +
                                            listaSoftwares +
                                        '</div>' +
                                    '</div>';

                var dati =  '<div class="row container-fluid mt-2 mt-md-5 px-0 mx-0 text-white text-center">' +
                                '<div class="col-12 col-md-6">' +
                                    '<h6><span class="fa fa-calendar"></span> ' + progetto.date + '</h6>' +
                                '</div>' +
                                '<div class="col-12 col-md-6">' +
                                    '<h6><span class="fa fa-clock"></span> ' + progetto.time + '</h6>' +
                                '</div>' +
                            '</div>';

                $("#projectTitle").html(htmlTitle);
                $("#projectDescContainer").append(htmlDesc);
                $("#projectDescContainer").append(dati);
                $("#projectDescContainer").append(htmlSoftwares);
                $("#projectDescContainer").css("top", $("section > .row").position().top + "px");
            },
            error: function(xhr, status, error) {
                console.log("Error: " + error);
              }
          });
    };
    getProgetto();

    setTimeout(function() {
        var toast = $("#liveToast");

        const toastObj = bootstrap.Toast.getOrCreateInstance(toast)

        toastObj.show()
    }, 10000)

    $('#preload').delay(600).fadeOut(650);
 });