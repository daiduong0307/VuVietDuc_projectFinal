$(document).ready(() => {
    $(document).on('click', '.btn-deleteTag', function () {
        var id = $(this).attr('id');
        sweetAlert(id);
    });

    function ajaxDelete(id) {
        $.ajax({
            url: `/admin/deleteOneTag/${id}`,
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
            url: `/api/admin/allTag`,
            method: 'get',
            dataType: 'json',
        }).done(function (res) {
            arrayTag(res);
        });
    }

    function sweetAlert(id) {
        swal({
            title: 'Are you sure?',


            buttons: true,

        }).then(willDelete => {
            if (willDelete) {
                ajaxDelete(id);
                swal('Tag has been deleted!', {
                    icon: 'success',
                });
            }
        });
    }

    function arrayTag(data) {
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
        $('#listTag').html(res);
    }

    function getData(tag, index) {
        var html = '';

        html += '<tr>';
        html += '<td>' + index + '</td>';
        html += '<td>' + tag.name + '</td>';
        html += '<td>' + tag.describe + '</td>';
        html += '<td class="d-flex flex-row">';
        html +=
            ' <button id="' +
            tag._id +
            '" class="btn btn-danger  btn-outline-danger btn-deleteTag" title="Delete" data-toggle="tooltip">';
        html += ' <i class="ti-trash"></i>';
        html += ' </button>';
        html += ' </td>';
        html += '</tr>';

        return html;
    }
});
