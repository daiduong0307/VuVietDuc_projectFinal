$(document).ready(() => {
    $(document).on('click', '.btn-delTagBlog', function () {
        var id = $(this).attr('id');
        sweetAlert(id);
    });

    function ajaxDelete(id) {
        $.ajax({
            url: `/users/deleteTagBlog/${id}`,
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

    const post_id = $('#post_id').val();

    function ajaxGet() {
        $.ajax({
            url: `/api/users/listTag/${post_id}`,
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
            data.forEach(el => {
                res += getData(el);
            });
        } else {
            res += '<li class="list-group-item">';
            res += '<div class="alert alert-info" role="alert">';
            res += 'No Data';
            res += '</div>';
            res += ' </li>';
        }
        $('#listTag').html(res);
    }

    function getData(tag) {
        var html = '';

        html += '<li class="list-group-item d-flex justify-content-between">';
        html += '<p>' + tag.name + '</p>';
        html += '<button id="' + tag._id + '"';
        html += 'class="btn btn-danger btn-round btn-outline-danger btn-delTagBlog"';
        html += 'title="Delete" data-toggle="tooltip">';
        html += '<i class="ti-trash"></i>';
        html += '</button>';
        html += ' </li>';

        return html;
    }
});
