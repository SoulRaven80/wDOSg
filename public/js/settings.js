(() => {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation');
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated')
        }, false);
    });
})();

const openUploadModal = () => {
    $('#uploadForm').trigger("reset");
    const uploadModal = new bootstrap.Modal('#uploadModal', {});
    uploadModal.show();
}

$("#confirmDeleteButton").on("click", function(e) {
    var gameId = $("#gameIdDelete").val();
    $("#gameIdDelete").val("");
    $.ajax({
        url: `/api/delete?gameId=${gameId}`,
        type: 'DELETE',
        success: function(result) {
            $('#confirmDeleteModal').modal("hide");
            $("#games_list_link").trigger("click");
            appendInfo('Game removed');
        }
    });
});

const openDeleteConfirmation = (gameId) => {
    $("#gameIdDelete").val(gameId);
    const confirmDeleteModal = new bootstrap.Modal('#confirmDeleteModal', {});
    confirmDeleteModal.show();
}

const openEditModal = (gameId) => {
    $.getJSON("/api/game?gameId="+gameId, function(game) {
        try {
            $("#editInputId").val(game.id);
            $("#editInputName").val(game.name);
            $("#editInputImageUrl").val(game.img);
            $("#editTextareaDescription").text(game.description);
            $("#editTextareaDevelopers").text(game.developers);
            $("#editTextareaPublishers").text(game.publishers);
            $("#editTextareaGenres").text(game.genres);
            $("#editInputYear").val(game.year);
            $("#editInputTrailerUrl").val(game.trailer);
            const editModal = new bootstrap.Modal('#editModal', {});
            editModal.show();
        } catch (error) {
            appendAlert('An error has occurred while reading the game information');
        }
    }).fail(function(jqXHR, status, error) {
        appendAlert('An error has occurred while getting the game information');
    });
};

$("#games_list_link").on("click", function(e) {
    const contentDiv = document.getElementById('content_div');
    contentDiv.innerHTML = '';

    $.getJSON("/api/list", function(data) {
        try {
            if (data.length == 0) {
                contentDiv.append("Empty games library");
                return;
            }
            var wrapper = [
                '<table class="table">',
                '  <thead>',
                '    <tr>',
                '      <th scope="col">#</th>',
                '      <th scope="col">Name</th>',
                '      <th scope="col">Actions</th>',
                '    </tr>',
                '  </thead>',
                '  <tbody>'
            ].join('');
            var sortedData = data.sort((a, b) => {
                if (a.name < b.name) {
                  return -1;
                }
            });
            for (let i = 0; i < sortedData.length; i++) {
                const game = sortedData[i];
                wrapper += [
                    '<tr>',
                    `  <th scope="row">${i+1}</th>`,
                    `  <td>${game.name}</td>`,
                    '  <td>',
                    `    <button type="button" class="btn bi-pencil" aria-label="Edit" onclick="openEditModal('${game.id}')"></button>`,
                    `    <button type="button" class="btn bi-trash" aria-label="Delete" onclick="openDeleteConfirmation('${game.id}')"></button>`,
                    '  </td>',
                    '</tr>',
                ].join('');
            }
            wrapper += [
                '  </tbody>',
                '</table>'
            ].join('');
            contentDiv.innerHTML = wrapper;
        }
        catch (error) {
            appendAlert('An error has occurred while reading the games information');
        }
    }).fail(function(jqXHR, status, error) {
        appendAlert('An error has occurred while getting the game list information');
    });
});

$(document).ready(function() {
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('action')) {
        if (urlParams.get('action') === 'updated') {
            // game was updated
            appendInfo('Game updated');
        }
        else {
            // game was created
            appendInfo('Game created');
        }
    }
});
