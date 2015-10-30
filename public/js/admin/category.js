jQuery(document).ready(function(){
  //$( "table.listing tbody" ).sortable();

  $('#content').on('click', '.editcat', function(e){
    e.preventDefault();
    var id = $(this).data('id');
    $('#displaycat'+id).hide();
    $('#inputcat'+id).show();
    return false;
  });

  $('#content').on('click', '.canceleditcat', function(e){
    e.preventDefault();
    var id = $(this).data('id');
    $('#inputcat'+id).hide();
    $('#displaycat'+id).show();
    return false;
  });

  $('#content').on('click', '.new_cat_form', function(e){
    e.preventDefault();
    $('#newCatForm').show();
    return false;
  });
  
});