// 组件注册地址
window.components = {};

$(function(){
    const test = window.components.test;
    // $('body').html(test('hello world'));

    $('#fileupload').fileupload({
        dataType:'json',
        done: function (e, data) {
            $.each(data.result.files, function (index, file) {
                $('<p/>').text(file.name).appendTo(document.body);
            });
        }
    })
});