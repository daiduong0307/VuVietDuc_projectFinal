$(document).ready(() => {
    $(document).on('click', '.btn-outline-danger', function () {
        var id = $(this).attr('id');
        setBookmark(id);
    });

    $(document).on('click', '.btn-danger', function () {
        var id = $(this).attr('id');
        unBookmark(id);
    });

    function setBookmark(id) {
        $.ajax({
            url: `/users/setBookmark/${id}`,
            method: 'put',
            dataType: 'json',
        }).done(function (res) {
            ajaxGetSet();
        });
    }
    var BlogId = $('#blog_id').val();

    function ajaxGetSet() {
        $.ajax({
            url: `/api/users/blogDetail/${BlogId}`,
            method: 'get',
            dataType: 'json',
        }).done(function (res) {
            test(res);
        });
    }

    function unBookmark(id) {
        $.ajax({
            url: `/users/unBookmark/${id}`,
            method: 'put',
            dataType: 'json',
        }).done(function (res) {
            console.log(res);
            ajaxGetUn();
        });
    }

    function ajaxGetUn() {
        $.ajax({
            url: `/api/users/blogDetail/${BlogId}`,
            method: 'get',
            dataType: 'json',
        }).done(function (res) {
            // console.log(res);
            test(res);
        });
    }

    function test(data) {
        var res = '';
        res += dataBlog(data);
        $('#bookmark').html(res);
    }

    var ss_id = $('#ss_id').val();

    function dataBlog(data) {
        var html = '';

        if (data.demo.bookmarkExists) {
            html +=
                data.demo.bookmarkExists.accountId == ss_id
                    ? '<button class="btn btn-danger" data-toggle="tooltip" data-placement="top" title="unBookmark this post" id="' +
                      data.blog._id +
                      '" style="margin-right: 10px; margin-top: 6px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bookmarks-fill" viewBox="0 0 16 16"><path d="M2 4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v11.5a.5.5 0 0 1-.777.416L7 13.101l-4.223 2.815A.5.5 0 0 1 2 15.5V4z" /><path d="M4.268 1A2 2 0 0 1 6 0h6a2 2 0 0 1 2 2v11.5a.5.5 0 0 1-.777.416L13 13.768V2a1 1 0 0 0-1-1H4.268z" /></svg></button>'
                    : '<input type="hidden" name="blogId" id="setBM" value="' +
                      data.blog._id +
                      '"><button class="btn btn-outline-danger" id="' +
                      data.blog._id +
                      '" style="margin-right: 10px; margin-top: 6px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bookmarks-fill" viewBox="0 0 16 16"><path d="M2 4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v11.5a.5.5 0 0 1-.777.416L7 13.101l-4.223 2.815A.5.5 0 0 1 2 15.5V4z" /><path d="M4.268 1A2 2 0 0 1 6 0h6a2 2 0 0 1 2 2v11.5a.5.5 0 0 1-.777.416L13 13.768V2a1 1 0 0 0-1-1H4.268z" /></svg></button>';
        } else {
            html +=
                '<input type="hidden" name="blogId" id="setBM" value="' +
                data.blog._id +
                '"><button class="btn btn-outline-danger" data-toggle="tooltip" data-placement="top" title="Bookmark this post" id="' +
                data.blog._id +
                '" style="margin-right: 10px; margin-top: 6px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bookmarks-fill" viewBox="0 0 16 16"><path d="M2 4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v11.5a.5.5 0 0 1-.777.416L7 13.101l-4.223 2.815A.5.5 0 0 1 2 15.5V4z" /><path d="M4.268 1A2 2 0 0 1 6 0h6a2 2 0 0 1 2 2v11.5a.5.5 0 0 1-.777.416L13 13.768V2a1 1 0 0 0-1-1H4.268z" /></svg></button>';
        }

        return html;
    }
});
