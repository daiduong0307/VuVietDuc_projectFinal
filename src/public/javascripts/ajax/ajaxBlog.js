$(document).ready(() => {
    $(document).on('click', '.btn-deleteBlog', function () {
        var id = $(this).attr('id');
        sweetAlert(id);
    });

    function ajaxDelete(id) {
        $.ajax({
            url: `/users/deleteOneBlog/${id}`,
            method: 'delete',
            dataType: 'json',
        })
            .done(function (res) {
                console.log(res);
                // getData();
                ajaxGet();
            })
            .fail(function () {
                console.log('Fail');
            });
    }

    function ajaxGet() {
        $.ajax({
            url: '/api/users/allBlog',
            method: 'get',
            dataType: 'json',
        }).done(function (res) {
            console.log(res);
            arrayBlog(res);
            // getData();
        });
    }

    function sweetAlert(id) {
        swal({
            title: 'Are you sure?',
            text: 'Once deleted, you will not be able to recover this !',
            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                ajaxDelete(id);
                swal('Blog has been deleted!', {
                    icon: 'success',
                });
            }
        });
    }

    function arrayBlog(data) {
        console.log('Here is comment ', data);
        var res = '';
        if (data.length > 0) {
            data.forEach((el, index) => {
                res += getData(el, index);
            });
        } else {
            res += '<tr>';
            res += '<td colspan="8">';
            res += ' <div class="alert alert-primary" role="alert">';
            res += '  No Data';
            res += '</div>';
            res += '</td>';
            res += ' </tr>';
        }
        $('#listBlog').html(res);
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

        let formatted_date = longMonth + ' ' + day + ' - ' + date.getFullYear();
        return formatted_date;
    }

    function getData(blog, index) {
        var html = '';

        html += '<tr>';
        html += '<th scope="row">' + index + '</th>';
        html +=
            '<td style="width: 250px; height:170px"><a href="/users/blogDetail/' +
            blog._id +
            '"><img style="max-width: 100%;height: auto;width: auto;" src="/uploads/' +
            blog.mainImage +
            '" alt="BlogImage" /></a></td>';
        html +=
            '<td><a href="/users/blogDetail/' +
            blog._id +
            '">' +
            blog.titleName +
            '</a></td>';
        html += '<td>' + blog.brief + '</td>';
        html += '<td>' + blog.categoryId.name + '</td>';
        html += '<td>' + formatDate(blog.createdAt) + '</td>';
        html += '<td>' + blog.isPublish + '</td>';
        html += '<td class="d-flex flex-row">';
        html += ' <button class="btn btn-info btn-outline-info"';
        html +=
            ' onclick="' +
            window.location +
            '=/users/updateBlog/' +
            blog._id +
            '" style="margin-right: 5px;">';
        html += ' <i class="ti-pencil-alt"></i>';
        html += '</button>';

        html +=
            ' <button id="' +
            blog._id +
            '" class="btn btn-danger btn-outline-danger btn-deleteBlog">';
        html += ' <i class="ti-trash"></i>';
        html += '</button>';
        html += ' </td>';

        html += ' </tr>';

        return html;
    }
});
