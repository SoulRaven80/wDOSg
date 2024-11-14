const openUploadModal = () => {
    $('#gameMetadataForm').trigger("reset");
    const uploadModal = new bootstrap.Modal('#gameMetadataModal', {});
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
            $("#editInputIgdbId").val(game.igdb_id);
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

const onCreateSubmit = () => {
    if (sessionStorage.searchResults) {
        var searchResults = JSON.parse(sessionStorage.searchResults);
        var igdb_id = $('input[name=igdb_id]:checked', '#gameMetadataForm').val();
        var result = searchResults.filter(function(i) {
            return i.id == igdb_id;
        })[0];
        $("#gameMetadataInputImageUrl").val(`https://images.igdb.com/igdb/image/upload/t_cover_big/${result.cover.image_id}.jpg`);
        $("#gameMetadataTextareaDescription").val(`${result.summary}`);
        var developers = result.involved_companies.filter(function (i) {
            return i.developer;
        }).map(function (i) {
            return i.company.name;
        });
        $("#gameMetadataTextareaDevelopers").val(`${developers}`);
        var publishers = result.involved_companies.filter(function (i) {
            return i.publisher;
        }).map(function (i) {
            return i.company.name;
        });
        $("#gameMetadataTextareaPublishers").val(`${publishers}`);
        $("#gameMetadataTextareaGenres").val(`${result.genres.map(function (i) {
            return i.name;
        })}`);
        $("#gameMetadataInputYear").val(`${new Date(result.first_release_date * 1000).getFullYear()}`);
        $("#gameMetadataInputTrailerUrl").val(`https://www.youtube.com/embed/${result.videos[0].video_id}`);
        $("#gameMetadataInputName").val(`${result.name}`);
    }
}

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

const getCover = (igdb_id, parentElement) => {
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    for (let i = 0; i < popoverTriggerList.length; i++) {
        const element = popoverTriggerList[i];
        if(bootstrap.Popover.getInstance(element)) {
            bootstrap.Popover.getInstance(element).dispose();
        }
    }
    var data_content = parentElement.getAttribute('data-bs-content');
    if (data_content !== null && data_content !== undefined && data_content !== '') {
        const popover = new bootstrap.Popover(parentElement, {
            html: true,
            container: '.modal-body',
            trigger: 'focus'
        }).show();              
    }
    else {
        var searchResults = JSON.parse(sessionStorage.searchResults);
        var result = searchResults.filter(function(i) {
            return i.id === igdb_id;
        })[0];
        parentElement.setAttribute('data-bs-content', `<img src='https://images.igdb.com/igdb/image/upload/t_cover_big/${result.cover.image_id}.jpg'>`);
        const popover = new bootstrap.Popover(parentElement, {
            html: true,
            container: '.modal-body',
            trigger: 'focus'
        }).show();
        /*
        $.getJSON(`/api/gamemecover?gameId=${igdb_id}`, function(result) {
            if (result !== null && result !== undefined) {
                parentElement.setAttribute('data-bs-content', `<img src='https://images.igdb.com/igdb/image/upload/t_cover_big/${result}.jpg'>`);
                
                const popover = new bootstrap.Popover(parentElement, {
                    html: true,
                    container: '.modal-body',
                    trigger: 'focus'
                }).show();
            }
        });
        */
    }
}

const findMetadata = () => {
    var gameName = $('#gameMetadataInputName').val();
    if (!gameName) {
        $('#gameMetadataInputName').removeClass('is-valid is-invalid').addClass('is-invalid');
        return;
    }
    $('#gameMetadataInputName').removeClass('is-valid is-invalid').addClass('is-valid');
    $.getJSON(`/api/gamemetadata?gameName=${gameName}`, function(result) {
        // console.log(result);
        if (result.length > 0) {
            sessionStorage.setItem('searchResults', JSON.stringify(result));
            var wrapper = '<ul class="list-group">';
            for (let i = 0; i < result.length; i++) {
                const game = result[i];
                // IN THIS CONTEXT, "ID" IS "IGDB_ID"
                wrapper += ['<li class="list-group-item">',
                    '  <div class="row">',
                    '    <div class="col">',
                    `      <input class="form-check-input me-1" type="radio" name="igdb_id" value="${game.id}" id="radio${game.id}">`,
                    `      <label class="form-check-label" for="radio${game.id}">${game.name} (${new Date(game.first_release_date * 1000).getFullYear()})</label>`,
                    '    </div>',
                    '    <div class="col-auto">',
                    `      <a href="#" onclick="getCover(${game.id}, this)" tabindex="0" data-bs-toggle="popover" data-bs-placement="left" data-bs-title="Cover"><i class="bi bi-images"></i></a>`,
                    '    </div>',
                    '</li>'
                ].join('');
            }
            wrapper += '</ul>';
            $('#gameMetadataDiv').html(wrapper);
        }
    }).fail(function(jqXHR, status, error) {
        appendAlert('An error has occurred while getting the game information');
    });
} 

const afterLoadingPage = () => {
// $(document).ready(function() {
    // Load alert after update / create
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

    $("#gameMetadataForm").get(0).addEventListener('submit', event => {
        onCreateSubmit();
    });
};