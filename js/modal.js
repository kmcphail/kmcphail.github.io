$(document).ready(function () {
    $("img").on("click", function () {
        var image = $(this).attr("src");
        $("#portfolioModal").on("show.bs.modal", function () {
            $(".modal-content").attr("src", image);
        });
    });
});