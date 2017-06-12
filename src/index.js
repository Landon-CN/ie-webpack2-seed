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

    $('.jtalk-editor').on('paste',function(e){
        const event = e.originalEvent;
        if(event.clipboardData && event.clipboardData.getData){
            const datas = event.clipboardData.items;
            for(let i=0;i<datas.length;i++){
                if(/image/.test(datas[i].type)){
                    let imgFile = event.clipboardData.files[i];
                    getImageFile(imgFile);
                }
            }
            
        }
        e.stopPropagation();
        e.preventDefault();
        
    });

    function getImageFile(file){
        let fileReader = new FileReader();
        fileReader.onload = (event)=>{
            let src = event.target.result;
            let img = $('<img>').attr('src',src);
            $(document.body).append(img);
            
        }
        fileReader.readAsDataURL(file)
    } 

    $('.emoji-add').on('click',function(){
        let emoji = window.components.emoji();
        emoji.open();
    });
    $('.emoji-delete').on('click',function(){
        let emoji = window.components.emoji();
        emoji.close();
    });

    

});