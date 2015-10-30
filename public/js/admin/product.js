jQuery(document).ready(function(){
  
  $('#content').on('change', '[data-copy-to]', function(){
    var $container = $(this).closest('tr');
    var code = $(this).attr('data-copy-to');
    var target = $('[data-copy-target='+code+']', $container);
    if (target.val()=='')
      target.val($(this).val());
  });

  $('#content').on('click', '.drop-icon', function(){
    $(this).parent().trigger('click');
  });
  
});