document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-modal-open]').forEach(function (trigger) {
        trigger.addEventListener('click', function () {
            var target = document.querySelector(trigger.getAttribute('data-modal-open'));
            if (target) target.hidden = false;
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
    });

    document.querySelectorAll('[data-plan-id]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var input = document.getElementById('subscription_type');
            if (input) input.value = btn.getAttribute('data-plan-id');
        });
    });
});
