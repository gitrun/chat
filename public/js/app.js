/*global cUnity: false, console: false, $: false, moment: false, _: false, page: false, async: false, alert: false, Showdown: false, EpicEditor: false, Github: false */
$(function(){
  
  function showPage(pageName, pageTitle, fn){
    $('.page.visible').removeClass('visible').addClass('invisible');

    $('#' + pageName).removeClass('invisible').addClass('visible');
    document.title = pageTitle;
    $('html').attr("data-page-name", pageName);
    if(fn){
      fn();
    }
  }
  
});