jQuery(document).ready(function() {
  //$("[data-toggle='tooltip']").tooltip();
  //$("[data-toggle='dropdown']").dropdown();
  /*App.init();   
  App.initBxSlider(); 
  Index.initLayerSlider();
  App.initImageZoom();
  App.initSliderRange();
  App.initUniform();
  App.initTouchspin();*/

  var bindCloseDropdown = function() {
    $('body').bind('click', function() {
      $('[data-menu-cart] .dropdown-menu').attr('style', '');
      $('body').unbind('click');
    });
  }

  $('body').on('add_to_cart_success', function() {
    $('body,html').animate({scrollTop: 0}, 400, function() {
      $('[data-menu-cart] .dropdown-menu').fadeIn(200);
      bindCloseDropdown();
    });
  });
});