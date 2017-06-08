const  NAME = 'components/test.tpl.html';
const tpl = window.templates[NAME];
const mustache = window.Mustache;

window.components.test = function(name,target){
    const renderResult = mustache.render(tpl,{name});
    if(target){
        $(target).html(renderResult)
    }
    return renderResult;
}