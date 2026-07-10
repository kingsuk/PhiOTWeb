(function () {
    function showToast(message) {
        var toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.hidden = false;
        clearTimeout(showToast._timer);
        showToast._timer = setTimeout(function () {
            toast.hidden = true;
        }, 2500);
    }

    window.showToast = showToast;

    document.querySelectorAll('.alert-close').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var alert = btn.closest('.alert');
            if (alert) alert.remove();
        });
    });

    var flashes = document.getElementById('flash-messages');
    if (flashes) {
        setTimeout(function () {
            flashes.querySelectorAll('.alert').forEach(function (alert) {
                alert.style.opacity = '0';
                alert.style.transition = 'opacity 0.3s';
                setTimeout(function () { alert.remove(); }, 300);
            });
        }, 4500);
    }

    document.querySelectorAll('[data-modal-open]').forEach(function (trigger) {
        trigger.addEventListener('click', function () {
            var target = document.querySelector(trigger.getAttribute('data-modal-open'));
            if (!target) return;
            target.hidden = false;
            var planId = trigger.getAttribute('data-plan-id');
            var planName = trigger.getAttribute('data-plan-name');
            if (planId) {
                var input = document.getElementById('subscription_type');
                if (input) input.value = planId;
            }
            if (planName) {
                var label = document.getElementById('selected-plan-label');
                if (label) label.textContent = 'Plan: ' + planName;
            }
            var focusEl = target.querySelector('input:not([type=hidden]), button');
            if (focusEl) focusEl.focus();
        });
    });

    document.querySelectorAll('[data-modal-close]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var modal = btn.closest('.modal-backdrop');
            if (modal) modal.hidden = true;
        });
    });

    document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) {
        backdrop.addEventListener('click', function (e) {
            if (e.target === backdrop) backdrop.hidden = true;
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !backdrop.hidden) backdrop.hidden = true;
        });
    });
})();
