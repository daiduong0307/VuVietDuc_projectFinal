$(document).ready(() => {
    $(document).on('click', '.btn-deleteUser', function () {
        var id = $(this).attr('id');
        sweetAlert(id);
    });

    function ajaxDelete(id) {
        $.ajax({
            url: `/admin/deleteUserAcc/${id}`,
            method: 'delete',
            dataType: 'json',
        })
            .done(function (res) {
                console.log(res);
                ajaxGet();
            })
            .fail(function () {
                console.log('Fail');
            });
    }

    function ajaxGet() {
        $.ajax({
            url: '/api/admin/allUser',
            method: 'get',
            dataType: 'json',
        }).done(function (res) {
            console.log(res);
            arrayUser(res);
        });
    }

    function sweetAlert(id) {
        swal({
            title: 'Are you sure?',
            text: 'Once deleted, you will not be able to recover this !',
            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then(willDelete => {
            if (willDelete) {
                ajaxDelete(id);
                swal('User has been deleted!', {
                    icon: 'success',
                });
            }
        });
    }

    function arrayUser(data) {
        console.log('Here is users ', data);
        var res = '';
        if (data.length > 0) {
            data.forEach((el, index) => {
                res += getData(el, index);
            });
        } else {
            res += '<tr>';
            res += '<td colspan="7">';
            res += '  <div class="alert alert-primary" role="alert">';
            res += '   No Data';
            res += '  </div>';
            res += ' </td>';
            res += '</tr>';
        }
        $('#listUser').html(res);
    }

    function formatDate(data) {
        let date = new Date(data);
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();

        let longMonth = new Intl.DateTimeFormat('en-US', {
            month: 'long',
        }).format(date);

        if (day < 10) day = '0' + day;
        if (month < 10) month = '0' + month;
        if (hour < 10) hour = '0' + hour;
        if (minute < 10) minute = '0' + minute;

        let formatted_date =
            longMonth +
            ' ' +
            day +
            ' - ' +
            date.getFullYear() +
            ' ' +
            hour +
            ':' +
            minute +
            ':' +
            second;
        return formatted_date;
    }

    function getData(user, index) {
        var html = '';

        html += '<tr>';
        html += '<th scope="row">' + index + '</th>';
        html += '<td>' + user.accountId._id + '</td>';
        html += '<td>' + user.email + '</td>';
        html += '<td>' + user.fullName + '</td>';
        html += '<td>' + user.accountId.username + '</td>';
        html += ' <td>' + formatDate(user.accountId.createdAt) + '</td>';
        html += ' <td class="d-flex flex-row">';
        html +=
            '     <button class="btn btn-success btn-round btn-outline-success" onclick="' +
            window.location +
            '=/admin/updateUser/' +
            user._id +
            '" title="Update" data-toggle="tooltip" style="margin-right: 5px;">';
        html += '         <i class="ti-pencil-alt"></i>';
        html += '     </button>';
        html +=
            '     <button id="' +
            user.accountId._id +
            '" class="btn btn-danger btn-round btn-outline-danger btn-deleteManager" title="Delete" data-toggle="tooltip">';
        html += '         <i class="ti-trash"></i>';
        html += '     </button>';
        html += ' </td>';
        html += ' </tr>';

        return html;
    }
});
