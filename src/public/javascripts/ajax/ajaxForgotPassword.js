$(document).ready(() => {
    $('#resetForm').on('submit', (e) => {
        e.preventDefault();

        var formData = $('#resetForm').serializeArray();
        console.log(formData);

        var data = {};

        $.each(formData, function (i, v) {
            data['' + v.name + ''] = v.value;
        });

        if (checkInput()) {
            doSubmit(data);
        } else {
            $('#msgSuccess').css('display', 'none');
        }
    });

    function checkInput() {
        const input = $('#emailInput').val();
        if (!input) {
            $('#msg').css('display', 'block');
            $('#msg').html('Please enter a valid email address');
            return false;
        } else {
            $('#msg').css('display', 'block');
            $('#msg').html('');
            return true;
        }
    }

    function doSubmit(data) {
        $.ajax({
            url: '/u/sendEmail',
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify(data),
            dataType: 'json',
        })
            .done(function (res) {
                console.log(res);
                $('#msgSuccess').html(res.success);
                $('#msgSuccess').css('display', 'block');
                $('#msg').css('display', 'none');
            })
            .fail(function (res) {
                console.log(res);
                $('#msg').html(res.responseJSON.err);
                $('#msg').css('display', 'block');
                $('#msgSuccess').css('display', 'none');
            });
    }
});
