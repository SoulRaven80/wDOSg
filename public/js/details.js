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
                $("#developers").text(game.developers);
                $("#publishers").text(game.publishers);
                $("#genres").text(game.genres);
                $("#year").text(game.year);
                $("#play_button").attr('href', '/games/' + game.path);
            }
            catch (error) {
                appendAlert('An error has occurred while reading the game information');
            }
        }).fail(function(jqXHR, status, error) {
            appendAlert('An error has occurred while getting the game information');
        });
    }
    else {
        appendAlert('Cannot find the game information');
    }
});
