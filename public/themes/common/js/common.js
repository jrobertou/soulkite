$(document).ready(function(){ 

  $('[data-variant]').change(function() {

    var $form = $(this).closest('form');
    var $selects = $('select[data-variant]', $form);

    var post_variants = {};
    
    jQuery.each($selects, function(index) {
      post_variants[$(this).attr('data-variant')] = $(this).val();
    });

    if (typeof variants_data !== 'undefined') {
      var pickArray, variant_id;

      // Test if variants in POST are equal with other variant in product variants array
      _.each(variants_data, function(variant, key){
        pickArray = _.pick(variant, _.keys(post_variants));
        if (_.isEqual(pickArray, post_variants))
          variant_id = key;
      });

      if (!variant_id) {
        $('input[name="product[variant_id]"]').val('');
        $('.price-availability-block .price strong').html('Unavailable');
        $('.price-availability-block .price em span').html('');
        $('.price-availability-block .availability').hide();
        $('.product-page-cart').slideUp(100);
        return;
      }

      $('input[name="product[variant_id]"]').val(variants_data[variant_id]._id);
      $('.price-availability-block .price strong').html( displayPrice(meb.currency, variants_data[variant_id].price) );
      $('.price-availability-block .price em span').html( displayPrice(meb.currency, variants_data[variant_id].regular_price) );
      $('.price-availability-block .availability').show();
      $('.product-page-cart').slideDown(100);
    }

  });

  // Generic binding for data-action
  $('[data-action]').bind('click change', function(e){
    e.preventDefault();
    // Avoid double events that can occur
    if (e.type=='click' && $(this).is("*[type=text]"))
      return false;
    var action = $(this).attr('data-action');
    ajaxFunctions[action]($(this));
  });

});

var ajaxFunctions = {

  add_to_cart: function(el) {
    
    var $form = el.closest('form');

    $.ajax({
      type: $form.attr('method'),
      url: $form.attr('action'),
      data: $form.serialize(),
      dataType: 'json',
      success: function(data) {
        if (data.success) {
          $('[data-menu-cart]').replaceWith(data.html);
          $('[data-menu-cart]').hide().fadeIn(100);
          $('body').trigger('add_to_cart_success');
        }
        else {
          ajaxFunctions.redirectTrigger(data);
        }
      }
    });

  },

  remove_from_cart: function(el) {
    var $cart_line = el.closest('[data-cart-line]');
    var cart_line_id = $cart_line.attr('data-cart-line-id');

    $.ajax({
      type: 'DELETE',
      url: '/cart/'+cart_line_id,
      dataType: 'json',
      success: function(data) {
        if (data.success) {
          $cart_line.fadeOut(200, function() {
            $cart_line.remove();
            location.reload();
          });
        }
      }
    });
  },

  update_quantity: function(el) {
    var $cart_line = el.closest('[data-cart-line]');
    var cart_line_id = $cart_line.attr('data-cart-line-id');
    var quantity = parseInt(el.val());

    $.ajax({
      type: 'PUT',
      url: '/cart/'+cart_line_id,
      data: { quantity: quantity },
      dataType: 'json',
      success: function(data) {
        if (data.success) {
          if (quantity>0) {
            location.reload();
          }
          else {
            $cart_line.fadeOut(200, function() {
              $cart_line.remove();
              location.reload();
            });
          }
        }
      }
    });
  },

  redirectTrigger: function(data) {
    if (data.redirectUrl)
      window.location.href = data.redirectUrl;
  }

}

var displayPrice = function(currency, price) {
  price = parseFloat(price).toFixed(2);
  switch(currency) {
    case "EUR":
        return price+'€';
      break;

    case "USD":
        return '$'+price;
      break;

    default:
        return price+' '+currency;
      break;
  }
}