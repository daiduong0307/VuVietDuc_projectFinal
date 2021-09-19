$(document).ready(() => {
    $(document).on('click', '.btn-deleteComment', function () {
        var id = $(this).attr('id');
        sweetAlert(id, 1);
    });
    $(document).on('click', '.btn-deleteReply', function () {
        var id = $(this).attr('id');
        sweetAlert(id, 2);
    });

    function ajaxDeleteReply(id) {
        $.ajax({
            url: `/users/deleteReply/${id}`,
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

    function ajaxDeleteComment(id) {
        $.ajax({
            url: `/users/deleteComment/${id}`,
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

    function sweetAlert(id, type) {
        swal({
            title: 'Are you sure?',
            text: 'Once deleted, you will not be able to recover this !',
            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                if (type == 1) {
                    ajaxDeleteComment(id);
                    swal('Your comment has been deleted!', {
                        icon: 'success',
                    });
                } else {
                    ajaxDeleteReply(id);
                    swal('Your comment has been deleted!', {
                        icon: 'success',
                    });
                }
            }
        });
    }

    var blogId = $('#blogId2').val();

    function ajaxGet() {
        $.ajax({
            url: `/api/users/getBlogData/${blogId}`,
            method: 'get',
            dataType: 'json',
        }).done(function (res) {
            // console.log(res);
            arrayComment(res.comments);
            arrayReplies(res.comments[0].replies);
        });
    }

    function arrayComment(data) {
        // console.log("Here is comment ", data);
        var res = '';
        if (data.length > 0) {
            data.forEach((el) => (res += getData(el)));
        }
        $('#listComment').html(res);
    }

    var userId2 = $('#userId2').val();

    function dataReplies(reply) {
        var res = '';

        res += '<div class="comment-list left-padding">';
        res += ' <div class="single-comment justify-content-between d-flex">';
        res += '<div class="user justify-content-between d-flex">';
        res += '<div class="thumb">';
        res +=
            ' <img src="/uploads/' +
            reply.author.avatar +
            '" style="width:60px; height:60px;" alt="userAvt">';
        res += '</div>';
        res += ' <div class="desc">';
        res += ' <h5><a href="#">' + reply.author.fullName + '</a></h5>';
        res += ' <p class="date">' + formatDate(reply.createdAt) + '</p>';
        res += ' <p class="comment">' + reply.comment + '</p>';
        res += ' </div>';
        res += ' </div>';
        res += ' <div class="reply-btn">';
        res +=
            reply.author.accountId._id == userId2
                ? ' <button class="btn-reply text-uppercase btn-deleteReply" style="cursor: pointer"  id="' +
                  reply._id +
                  '">Delete</button>'
                : '';

        res += '</div>';
        res += ' </div>';
        res += ' </div>';

        return res;
    }

    function arrayReplies(data) {
        // console.log("Here is replies ", data);
        var res = '';
        if (data.length > 0) {
            data.forEach((el) => {
                res += dataReplies(el);
            });
        }
        return res;
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
            minute;
        return formatted_date;
    }

    var userId = $('#userId').val();

    function getData(comment, index) {
        var html = '';

        html += '<div class="comment-list">';
        html += '<div class="single-comment justify-content-between d-flex">';
        html += ' <div class="user justify-content-between d-flex">';
        html += '<div class="thumb">';
        html +=
            ' <img src="/uploads/' +
            comment.author.avatar +
            '" style="width:60px; height:60px;" alt="userAvt">';
        html += ' </div>';
        html += '<div class="desc">';
        html += ' <h5><a href="#">' + comment.author.fullName + '</a></h5>';
        html += ' <p class="date">' + formatDate(comment.createdAt) + '</p>';
        html += ' <p class="comment">' + comment.comment + '</p>';
        html += ' </div>';
        html += ' </div>';
        html += '<div class="reply-btn">';
        html +=
            ' <a class="btn-reply text-uppercase reply" style="cursor: pointer"  id="show">reply</a>';

        html +=
            comment.author.accountId._id == userId
                ? ' <a class="btn-reply text-uppercase btn-deleteComment" style="cursor: pointer"  id="' +
                  comment._id +
                  '">Delete</a>'
                : '';

        html += ' </div>';
        html +=
            ' <form method="post" id="formReply" hidden="true" class="clsFormReply" enctype="application/x-www-form-urlencoded">';
        html += '  <div class="form-group">';
        html +=
            '      <textarea class="form-control mb-10" rows="5" name="reply" placeholder="Message" required></textarea>';
        html += '  </div>';

        html +=
            '  <input type="hidden" id="commentId" name="commentId" value="' +
            comment._id +
            '">';
        html +=
            '  <input type="hidden" id="blogId" name="blogId" value="' +
            comment.postId._id +
            '">';

        html +=
            '  <input type="submit" class="primary-btn submit_btn" value="Reply" />';
        html += ' </form>';
        html += ' </div>';
        html += '</div>';

        html += '<div id="listReplies">';
        html += arrayReplies(comment.replies);
        html += '</div>';

        return html;
    }
});
