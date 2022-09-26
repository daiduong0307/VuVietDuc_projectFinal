$(document).ready(() => {
    $(document).on('click', '.btn-deleteManager', function () {
        var id = $(this).attr('id');
        sweetAlert(id);
    });

    function ajaxDelete(id) {
        $.ajax({
            url: `/admin/deleteManagerAcc/${id}`,
            method: 'delete',
            dataType: 'json',
        })
            .done(function (res) {
                ajaxGet();
            })
            .fail(function () {
                console.log('Fail');
            });
    }

    function ajaxGet() {
        $.ajax({
            url: '/api/admin/allManager',
            method: 'get',
            dataType: 'json',
        }).done(function (res) {
            arrayManager(res);
        });
    }

    function sweetAlert(id) {
        swal({
            title: 'Are you sure?',


            buttons: true,

        }).then(willDelete => {
            if (willDelete) {
                ajaxDelete(id);
                swal('Manager has been deleted!', {
                    icon: 'success',
                });
            }
        });
    }

    function arrayManager(data) {
        var res = '';
        if (data.length > 0) {
            data.forEach((el, index) => {
                res += getData(el, index);
            });
        } else {
            res += '<tr>';
            res += '<td colspan="8">';
            res += '  <div class="alert alert-primary" role="alert">';
            res += '   No Data';
            res += '  </div>';
            res += ' </td>';
            res += '</tr>';
        }
        $('#listManager').html(res);
    }


    function getData(manager, index) {
        var html = '';

        html += '<tr>';
        html += '<th scope="row">' + index + '</th>';
        html += '<td>' + manager.email + '</td>';
        html += '<td>' + manager.fullName + '</td>';
        html += '<td>' + manager.accountId.username + '</td>';
        html += ' <td>' + manager.categoryId.name + '</td>';
        html += ' <td class="d-flex flex-row">';
        html +=
            '     <button class="btn" onclick="' +
            window.location +
            '=/admin/updateManager/' +
            manager._id +
            '" title="Update" data-toggle="tooltip" style="margin-right: 5px;">';
        html += '         <i class="ti-pencil-alt"></i>';
        html += '     </button>';
        html +=
            '     <button id="' +
            manager.accountId._id +
            '" class="btn btn-danger  btn-deleteManager" title="Delete" data-toggle="tooltip">';
        html += '         <i class="ti-trash"></i>';
        html += '     </button>';
        html += ' </td>';
        html += ' </tr>';

        return html;
    }
});
