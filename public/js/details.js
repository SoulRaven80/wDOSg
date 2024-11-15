$(document).ready(function() {
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('game')) {
        $.getJSON("/api/game?gameId=" + urlParams.get('game'), function(game) {
            try {
                $("#title").text(game.name);
                $("#description").text(game.description);
                $("#image").attr('src', game.img);
                $("#image").attr('alt', game.name);
                $("#video").attr('src', game.trailer);
                if (typeof game.developers === "string") {
                    $("#developers").text(game.developers);
                }
                else {
                    $("#developers").text(game.developers.join('\r\n'));
                }
                if (typeof game.publishers === "string") {
                    $("#publishers").text(game.publishers);
                }
                else {
                    $("#publishers").text(game.publishers.join('\r\n'));
                }
                if (typeof game.genres === "string") {
                    $("#genres").text(game.genres);
                }
                else {
                    $("#genres").text(game.genres.join('\r\n'));
                }
                $("#year").text(game.year);
                $("#play_button").attr('href', '/games/' + game.path);
            }
            catch (error) {
                appendAlert(`An error has occurred while reading the game information: ${error}`);
            }
        }).fail(function(jqXHR, status, error) {
            appendAlert('An error has occurred while getting the game information');
        });
    }
    else {
        appendAlert('Cannot find the game information');
    }
});
