createDropzonBox = function() {
  // Drag & Drop upload system
  var tpl = '<div class="dz-preview dz-file-preview">'+
    '<div class="dz-details">'+
      '<img data-dz-thumbnail />'+
    '</div>'+
    '<div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>'+
    '<div class="dz-success-mark"><span>✔</span></div>'+
    '<div class="dz-error-mark"><span>✘</span></div>'+
    '<div class="dz-error-message"><span data-dz-errormessage></span></div>'+
  '</div>';

  // Disable auto discover for all elements:
  Dropzone.autoDiscover = false;

  Dropzone.options.myAwesomeDropzone = {
      addRemoveLinks: true,
      previewTemplate: tpl,
      maxFiles: 5,
      init: function() {
        //this.on("addedfile", function(file) { alert(file); });
        //this.on("removedfile", function(file) { alert("Added file."); });
      },
      success: function(file, response){
        file.previewElement.classList.add("dz-success");
        var inputHidden = Dropzone.createElement('<input type="hidden" name="product[img_id][]" value="'+response.img_id+'" />');
        file.previewElement.appendChild(inputHidden);
        //var inputRadio = Dropzone.createElement('<input type="radio" name="product[thumbnail]" value="'+response.img_id+'" class="hide" />');
        //file.previewElement.appendChild(inputRadio);
      }
  }

  var myAwesomeDropzone = new Dropzone("#my-awesome-dropzone", { url: "/admin/products/image-upload"});

  // Sortable module for uploading system
  $(function() {
    $("#my-awesome-dropzone").sortable({
      revert: true,
      opacity: 0.6,
      //placeholder: "ui-state-highlight"
      //placeholder: 'ui-placeholder'
    });
  });
}

var showActionsPanel = function() {
  if ($('body').find(':checkbox:checked.checkbox').length)
    $('#grouped_action').fadeIn(250).css('display','inline');
  else $('#grouped_action').hide();
}


jQuery(document).ready(function(){

  $(document).foundation();

  // Dropzone
  if ($("#my-awesome-dropzone").length) {
    createDropzonBox();
  }

  // Set the pjax module on menu links
  $(document).pjax('[data-pjax]', '#content', {fragment:"#content"});
  $('#content')
    .on('pjax:start', function() {
      $('#content').html('');
      $('#loading').show();
    })
    .on('pjax:end', function() {
      $('#loading').hide();
      $(document).foundation();
      if ($("#my-awesome-dropzone").length) {
        createDropzonBox();
      }
      if ($("#settingContent").length) {
        settings_pjax();
      }
    });

  // Sidebar menu
  $('.nav a').click(function(){
    $('.nav .item').removeClass('active');
    $(this).closest('.item').addClass('active');
  });

  // Checkbox
  $(document).on('click', '[data-action=checkall]', function(){
    $(this).closest('table').find(':checkbox.checkbox').prop('checked', this.checked);
    showActionsPanel();
  });
  $(document).on('click', 'input[type=checkbox].checkbox', function(){
    var isChecked = $('body').find(':checkbox:checked.checkbox').length == $('body').find(':checkbox.checkbox').length;
    $('[data-action=checkall]').prop('checked', isChecked);
    showActionsPanel();
  });

  // Sticky menu
  var nav = $('.nav');
  $(window).scroll(function() {
    if ($(this).scrollTop() >= 50)
      nav.addClass("sticky");
    else
      nav.removeClass("sticky");
  });

  // Table
  $(document).on('click', '[data-action=addOption]', function(){
    $('#myModal').foundation('reveal', 'open');
  });

  $(document).on('click', '[data-action=addVariant]', function(){
    var table = $('table#variants');

    if ($("tr td", table).length>6) {
      $("tr:last", table).clone().appendTo($("tbody", table));

      /*$("tr:last input", table).each(function(){
        $(this).val($(this).val());
      })*/

      var count = $("tbody tr", table).length;
      $("tr:last", table).attr('data-variant-order', count);
      $("tr:last input", table).each(function(){
        if ($(this).attr('name').toLowerCase().indexOf("id"))
          $(this).val('');
        $(this).attr('name', $(this).attr('name').replace(/\[(.+?)\]/, '['+count+']'));
      });
      $('input[name="variant['+count+'][order]"]').val(count);
    }
    else {
      alert('Vous devez ajouter au moins une option pour ajouter des variantes sur votre produit.')
    }


  });

  $(document).on('click', '[data-action=submit-option]', function(){
    var reveal = $(this).closest('[data-reveal]');
    var optionName = $('input[name=option]', reveal).val();
    if (optionName=='') return;
    var optionNameHash = optionName.replace(/\W/g, '_').toLowerCase();

    reveal.foundation('reveal', 'close');
    $('input[name=option]', reveal).val('');

    var table = $('table#variants');
    var thAdd = $("#addOption", table);
    $("#addOption", table).remove();
    //var c = $("tbody tr", table).length;
    $("thead tr:first", table).append('<th><a href="">'+optionName+'</a></th>');

    //var counter = 1;
    table.before('<input type="hidden" name="options['+optionNameHash+']" value="'+optionName+'" />')
    $("tbody tr", table).each(function(){
      var variant_order = $(this).attr('data-variant-order');
      $(this).append('<td><input type="text" name="variant['+variant_order+']['+optionNameHash+']" /></td>');
    });

    $("thead tr:first", table).append(thAdd);
  });

  $(document).on('click', '[data-reveal-close]', function(){
    var reveal = $(this).closest('[data-reveal]');
    reveal.foundation('reveal', 'close');
  });

});
