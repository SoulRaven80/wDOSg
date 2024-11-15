$(document).ready(function() {
    $.getJSON("/api/list", function(data) {
        try {
            if (data.length == 0) {
                appendInfo("Empty games library. Please upload games under Settings");
                return;
            }
            const gamesList = document.getElementById('games_list');
            var sortedData = data.sort((a, b) => {
                if (a.name < b.name) {
                  return -1;
                }
            });
            for (let i = 0; i < sortedData.length; i++) {
                const game = sortedData[i];
                const wrapper = document.createElement('div');
                wrapper.classList.add("col");
                wrapper.innerHTML = [
                    '<div class="card shadow-sm">',
                    `  <img src="${game.img ? game.img : '/img/image-not-found.png'}" class="img-content mx-auto rounded m-1" alt="${game.name}">`,
                    '  <div class="card-body">',
                    '    <div class="d-flex justify-content-between align-items-center">',
                    `      <a href="details.html?game=${game.id}" class="link-offset-2 link-offset-2-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover">`,
                    `        <span class="small text-body-secondary d-inline-block text-truncate" style="max-width: 215px;" data-bs-toggle="tooltip" data-bs-title="${game.name}"><strong>${game.name}</strong></span>`,
                    '      </a>',
                    '      <div class="btn-group">',
                    `        <a class="btn btn-sm btn-outline-secondary" href="/games/${game.path}/index.html">Play!</a>`,
                    '      </div>',
                    '    </div>',
                    '  </div>',
                    '</div>'
                ].join('');
                gamesList.append(wrapper);
            }
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
        }
        catch (error) {
            appendAlert('An error has occurred while reading the games information');
        }
    }).fail(function(jqXHR, status, error) {
        appendAlert('An error has occurred while getting the game list information');
    });
});