const openGameStudio = () => {
    $('#bundleStudioForm').trigger("reset");
    $('#createBundleStepOneFile').removeClass('is-valid is-invalid');
    $('#radioExecutables').empty();
    const uploadModal = new bootstrap.Modal('#createBundleStepOneModal', {});
    uploadModal.show();
}

const enableToolTips = () => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

var zipFile;

const toggleEye = (button, eye) => {
    $(button).on('click', () => {
        var classes = $(eye)[0].classList;
        var open = classes.contains("bi-eye");
        if (open) {
            classes.remove("bi-eye");
            classes.add("bi-eye-slash");
        }
        else {
            classes.add("bi-eye");
            classes.remove("bi-eye-slash");
        }
    });
}

const setCollapsibleEvents = () => {
    toggleEye('#buttonEyeDosbox', '#eyeDosbox');
    toggleEye('#buttonEyeCpu', '#eyeCpu');
    toggleEye('#buttonEyeSdl', '#eyeSdl');
    toggleEye('#buttonEyeMixer', '#eyeMixer');
}

const configureModalNavigation = () => {
    $('#createBundleStepOneModalNext').on('click', () => {
        var inputFile = $('#createBundleStepOneFile');
        inputFile.removeClass('is-valid is-invalid');
        if (inputFile.val() != '') {
            inputFile.addClass('is-valid');
            getExecutableFiles(inputFile[0].files);
            $('#createBundleStepOneModal').modal('hide');
            $('#createBundleStepTwoModal').modal('show');
        }
        else {
            inputFile.addClass('is-invalid');
        }
    });
}

const prepareGameStudio = () => {
    enableToolTips();
    setCollapsibleEvents();
    configureModalNavigation();
}

function getExecutableFiles(files) {
    if (files.length === 0) {
        return;
    }
    const file = files[0];
    const reader = new FileReader();
    reader.addEventListener("load", async (e) => {
        zipFile = new Uint8Array(reader.result);
        try {
            const jsdosZipData = await getZipData(zipFile);
            for (let i = 0; i < jsdosZipData.executables.length; i++) {
                const exec = jsdosZipData.executables[i];
                const wrapper = document.createElement('div');
                wrapper.innerHTML = [
                    '<div class="form-check">',
                    `   <input class="form-check-input" id="exec${i}" type="radio" name="executable" value="${exec}">`,
                    `   <label class="form-check-label" for="exec${i}">${exec}</label>`,
                    '</div>'
                ].join('');
                $('#radioExecutables').append(wrapper);
                $('#exec0').attr('checked', 'checked');
            }
        } catch (e) {
            console.log(e);
        }
    });
    reader.readAsArrayBuffer(file);
}

async function getZipData(data) {
    const zipData = {
        executables: [],
    };
    const zipReader = new zip.ZipReader(new zip.Uint8ArrayReader(data), {
        Workers: false,
    });
    try {
        const entries = await zipReader.getEntries();
        for (const entry of entries) {
            const filename = entry.filename;
            if (filename.toLocaleLowerCase().endsWith(".com") ||
                filename.toLocaleLowerCase().endsWith(".exe") ||
                filename.toLocaleLowerCase().endsWith(".bat")) {
                zipData.executables.push(filename);
            }

            if (filename === ".jsdos/jsdos.json") {
                const config = await entry.getData(new zip.TextWriter(), { useWebWorkers: false });
                if (config.length > 0) {
                    zipData.config = JSON.parse(config);
                }
            }

            if (filename === ".jsdos/dosbox.conf") {
                const dosboxConf = await entry.getData(new zip.TextWriter(), { useWebWorkers: false });
                if (dosboxConf.length > 0) {
                    zipData.dosboxConf = dosboxConf;
                }
            }
        }

        return zipData;
    } finally {
        zipReader.close();
    }
}

function populateConfig(config) {
    var formValues = $("#bundleStudioForm").serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
    }, {});
    // add checkboxes
    $("form input:checkbox").each(function() {
        formValues[this.name] = this.checked;
    });

    config.autoexec.options.script.value = formValues['executable'];
    config.cpu.options.core.value = formValues['core'];
    config.cpu.options.cputype.value = formValues['cputype'];
    config.cpu.options.cycles.value = formValues['cycles'];
    config.dosbox.options.machine.value = formValues['machine'];
    config.mixer.options.rate.value = parseInt(formValues['rate']);
    config.mixer.options.nosound.value = formValues['nosound'];
    config.output.options.autolock.value = formValues['autolock'];
}

async function createArchive() {
    $('#createBundleStepThreeModalSave').prop('disabled', true);
    $('#createBundleStepThreeModalSave').addClass('d-none');
    $('#createModalSpinner').removeClass('d-none');

    const dosBundle = await emulators.dosBundle();
    populateConfig(dosBundle.config);
    const blob = new Blob([zipFile]);
    const url = URL.createObjectURL(blob);
    dosBundle.extract(url);
    const archive = await dosBundle.toUint8Array(true);
    URL.revokeObjectURL(url);

    const bundleFile = new Blob([archive]);
    const bundleUrl = URL.createObjectURL(bundleFile);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = bundleUrl;
    a.download = 'bundle.jsdos';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(bundleUrl);

    $('#createBundleStepThreeModalSave').prop('disabled', false);
    $('#createBundleStepThreeModalSave').removeClass('d-none');
    $('#createModalSpinner').addClass('d-none');
}