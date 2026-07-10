(function () {
    if (!window.DEVICE_CONFIG) return;

    var currentConfig = JSON.parse(JSON.stringify(DEVICE_CONFIG.pinConfig));
    var defaultConfig = JSON.parse(JSON.stringify(DEVICE_CONFIG.defaultConfig));
    var editId = null;
    var editableJsonData = null;

    function toast(message) {
        if (window.showToast) window.showToast(message);
        else alert(message);
    }

    function controllablePins() {
        return currentConfig.filter(function (item) { return item.value !== 2; });
    }

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
        controllablePins().forEach(function (item, index) {
            var row = document.createElement('div');
            row.className = 'pin-row';
            var shortcut = index < 9 ? String(index + 1) : (index === 9 ? '0' : '');
            row.innerHTML = '<span class="pin-label">' + item.name +
                (shortcut ? ' <kbd>' + shortcut + '</kbd>' : '') + '</span>';
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'toggle' + (item.value ? ' active' : '');
            btn.setAttribute('aria-label', 'Toggle ' + item.name);
            btn.setAttribute('aria-pressed', item.value ? 'true' : 'false');
            btn.dataset.pinIndex = String(index);
            btn.addEventListener('click', function () {
                togglePinByIndex(index);
            });
            row.appendChild(btn);
            container.appendChild(row);
        });
    }

    function togglePinByIndex(index) {
        var pins = controllablePins();
        if (index < 0 || index >= pins.length) return;
        var item = pins[index];
        item.value = item.value ? 0 : 1;
        renderToggles();
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

    function sendChanges() {
        var sendBtn = document.getElementById('send-btn');
        if (sendBtn.disabled) {
            toast('Configure MQTT broker first.');
            return;
        }
        var changed = compareDifference(currentConfig, defaultConfig);
        if (!changed.length) {
            toast('Nothing has changed.');
            return;
        }
        document.getElementById('publish-message').value = buildPayload(changed);
        document.getElementById('publish-form').submit();
    }

    document.getElementById('send-btn').addEventListener('click', sendChanges);

    document.getElementById('copy-token-btn').addEventListener('click', function () {
        var token = document.getElementById('device-token');
        var self = this;
        navigator.clipboard.writeText(token.value).then(function () {
            self.textContent = 'Copied';
            toast('Token copied');
            setTimeout(function () { self.textContent = 'Copy'; }, 1500);
        });
    });

    document.getElementById('create-dataset-form').addEventListener('submit', function (e) {
        var changed = compareDifference(currentConfig, defaultConfig);
        if (!changed.length) {
            e.preventDefault();
            toast('Toggle at least one pin before saving.');
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
            document.getElementById('edit-controls').hidden = false;
            toast('Editing dataset — adjust pins, then save');
        });
    });

    document.getElementById('cancel-edit-btn').addEventListener('click', function () {
        editId = null;
        editableJsonData = null;
        currentConfig = JSON.parse(JSON.stringify(DEVICE_CONFIG.pinConfig));
        document.getElementById('edit-controls').hidden = true;
        renderToggles();
    });

    document.getElementById('save-edit-btn').addEventListener('click', function () {
        if (!editId) return;
        var changed = compareDifference(currentConfig, defaultConfig);
        if (JSON.stringify(editableJsonData) === JSON.stringify(changed)) {
            toast('Nothing has changed.');
            return;
        }
        var reversed = reverseJsonData(changed);
        var form = document.getElementById('edit-dataset-form');
        form.action = DEVICE_CONFIG.editDatasetUrl + editId + '/edit/';
        document.getElementById('edit-json-data').value = buildPayload(changed);
        document.getElementById('edit-reverse-json-data').value = buildPayload(reversed);
        form.submit();
    });

    var helpBtn = document.getElementById('shortcuts-help-btn');
    if (helpBtn) {
        helpBtn.addEventListener('click', function () {
            var modal = document.getElementById('shortcutsModal');
            if (modal) modal.hidden = false;
        });
    }

    document.addEventListener('keydown', function (e) {
        var tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) {
            return;
        }
        if (e.key === '?' || (e.shiftKey && e.key === '/')) {
            e.preventDefault();
            var modal = document.getElementById('shortcutsModal');
            if (modal) modal.hidden = false;
            return;
        }
        if (e.key === 's' || e.key === 'S') {
            e.preventDefault();
            sendChanges();
            return;
        }
        if (e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            setToAllOff();
            toast('All pins reset');
            return;
        }
        if (e.key >= '1' && e.key <= '9') {
            e.preventDefault();
            togglePinByIndex(parseInt(e.key, 10) - 1);
            return;
        }
        if (e.key === '0') {
            e.preventDefault();
            togglePinByIndex(9);
        }
    });

    renderToggles();
})();
