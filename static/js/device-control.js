(function () {
    if (!window.DEVICE_CONFIG) return;

    var currentConfig = JSON.parse(JSON.stringify(DEVICE_CONFIG.pinConfig));
    var defaultConfig = JSON.parse(JSON.stringify(DEVICE_CONFIG.defaultConfig));
    var editId = null;
    var editableJsonData = null;

    function compareDifference(current, defaults) {
        var changed = [];
        for (var i = 0; i < defaults.length; i++) {
            if (current[i].value !== defaults[i].value) {
                changed.push(current[i]);
            }
        }
        return changed;
    }

    function reverseJsonData(pins) {
        return pins.map(function (pin) {
            return {
                name: pin.name,
                pin: pin.pin,
                value: pin.value === 1 ? 0 : 1
            };
        });
    }

    function buildPayload(changed) {
        return JSON.stringify([{ header: 'data', data: changed }]);
    }

    function renderToggles() {
        var container = document.getElementById('pin-toggles');
        container.innerHTML = '';
        currentConfig.forEach(function (item, index) {
            if (item.value === 2) return;
            var row = document.createElement('div');
            row.className = 'pin-row';
            row.innerHTML = '<span class="pin-label">' + item.name + '</span>';
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-sm btn-toggle' + (item.value ? ' active' : '');
            btn.innerHTML = '<div class="handle"></div>';
            btn.addEventListener('click', function () {
                item.value = item.value ? 0 : 1;
                btn.classList.toggle('active');
            });
            row.appendChild(btn);
            container.appendChild(row);
        });
    }

    function setToAllOff() {
        currentConfig.forEach(function (item) {
            if (item.value === 1) item.value = 0;
        });
        renderToggles();
    }

    function applyDataset(jsonText) {
        var parsed = JSON.parse(jsonText);
        var data = parsed[0].data;
        setToAllOff();
        data.forEach(function (pin) {
            var found = currentConfig.find(function (x) { return x.name === pin.name; });
            if (found) found.value = pin.value;
        });
        renderToggles();
    }

    document.getElementById('send-btn').addEventListener('click', function () {
        var changed = compareDifference(currentConfig, defaultConfig);
        if (!changed.length) {
            alert('Nothing has changed.');
            return;
        }
        document.getElementById('publish-message').value = buildPayload(changed);
        document.getElementById('publish-form').submit();
    });

    document.querySelectorAll('.publish-dataset').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.getElementById('publish-message').value = btn.getAttribute('data-json');
            document.getElementById('publish-form').submit();
        });
    });

    document.getElementById('copy-token-btn').addEventListener('click', function () {
        var token = document.getElementById('device-token');
        token.select();
        document.execCommand('copy');
        this.classList.add('btn-success');
        var self = this;
        setTimeout(function () { self.classList.remove('btn-success'); }, 1500);
    });

    document.getElementById('create-dataset-form').addEventListener('submit', function (e) {
        var changed = compareDifference(currentConfig, defaultConfig);
        if (!changed.length) {
            e.preventDefault();
            alert('Nothing has changed.');
            return;
        }
        var reversed = reverseJsonData(changed);
        document.getElementById('create-json-data').value = buildPayload(changed);
        document.getElementById('create-reverse-json-data').value = buildPayload(reversed);
    });

    document.querySelectorAll('.edit-dataset').forEach(function (el) {
        el.addEventListener('click', function () {
            editId = parseInt(el.getAttribute('data-id'), 10);
            var dataset = DEVICE_CONFIG.datasets.find(function (d) { return d.id === editId; });
            if (!dataset) return;
            var parsed = JSON.parse(dataset.json_data);
            editableJsonData = parsed[0].data;
            applyDataset(dataset.json_data);
            document.getElementById('edit-controls').style.display = 'block';
        });
    });

    document.getElementById('cancel-edit-btn').addEventListener('click', function () {
        editId = null;
        editableJsonData = null;
        currentConfig = JSON.parse(JSON.stringify(DEVICE_CONFIG.pinConfig));
        document.getElementById('edit-controls').style.display = 'none';
        renderToggles();
    });

    document.getElementById('save-edit-btn').addEventListener('click', function () {
        if (!editId) return;
        var changed = compareDifference(currentConfig, defaultConfig);
        if (JSON.stringify(editableJsonData) === JSON.stringify(changed)) {
            alert('Nothing has changed.');
            return;
        }
        var reversed = reverseJsonData(changed);
        var form = document.getElementById('edit-dataset-form');
        form.action = DEVICE_CONFIG.editDatasetUrl + editId + '/edit/';
        document.getElementById('edit-json-data').value = buildPayload(changed);
        document.getElementById('edit-reverse-json-data').value = buildPayload(reversed);
        form.submit();
    });

    renderToggles();
})();
