(function(){

	// Show hide input with pent
	$(document).on('click', 'form [data-type="input"]', function(){
  	var form = $(this).parents('form'),
  		global = $(this).parents('.form');

  	$(global).find('.true-input').hide();
  	$(global).find('*[data-type="input"]').show();

  	$(this).hide();
  	$(form).find('.true-input').show();
	});

  /*
   * CLASSIC FORM
   */
  $(document).on('submit', 'form[data-type="classic-form"]', function(e) {
    e.preventDefault();
    var $submitButton = $('[type=submit]', $(this));
    var buttonDefaultVal = $submitButton.val() || $submitButton.html();
    var $responseMessage = $('.response-message');
    $form = $(this);

    var endRequest = function(success, message){
      $responseMessage.removeClass('progress');
      $responseMessage.html(message).fadeIn(200);

      var animate = $form.attr('data-animate-to-message');
      if (typeof animate !== 'undefined' && animate !== false) {
        var offset = $responseMessage.offset();
        $('body,html').animate({scrollTop: offset.top-20}, 400);
      }

      var hide_form = $form.attr('data-hide-form-on-success');
      if (success && typeof hide_form !== 'undefined' && hide_form !== false) {
        $form.hide();
      }
    }

    $submitButton.val('Chargement...').html('Chargement...');

    $form.find('.response-message').removeClass('error success');
    if($responseMessage.html() !== ''){
      //$responseMessage.addClass('progress');
      //$responseMessage.html('Envoi en cours...');
      $responseMessage.removeClass('error').removeClass('success');
    }
    
    $.ajax({
      type: $(this).attr('method'),
      url: $(this).attr('action'),
      data: $(this).serialize(),
      dataType: 'json',
      success: function(data) {
        if(data.success) {
          if (typeof data.message !== 'undefined')
            $responseMessage.addClass('success'); 
          if (data.redirectUrl)
            window.location.href = data.redirectUrl;
        }
        else {
          if (typeof data.message !== 'undefined')
            $responseMessage.addClass('error').removeClass('success');
          $submitButton.val(buttonDefaultVal).html(buttonDefaultVal);
        }
        if (typeof data.message !== 'undefined') {
          endRequest(data.success, data.message);
        }
      },
      error: function(data) {
        $responseMessage.removeClass('success');
        $responseMessage.addClass('error');
        $submitButton.val(buttonDefaultVal).html(buttonDefaultVal);
        endRequest(data.success, 'Une erreur est survenue, veuillez contacter le support.');
      }
    });
    return false;
  });

  /*
   * ONE FIELD FORM 
   */
	// CHECKBOX SUBMIT FORM
	$(document).on('change', 'input.form-submiter:checkbox', function(){
		var $form = $(this).parent().parent('form');
    var $hidenval = $form.find('.hiden-real-value');
    $hidenval.val($hidenval.val()=="true"?'false':'true');
		$form.submit();
	});

	// GENERIC AJAX FORMSENDER
	$(document).on('submit', 'form[data-type="automatic-one-field-form"]', function(e) {
    e.preventDefault();
    var $responseMessage = $('<span class="small response-message" style="display:block;"></span>')
    	$form = $(this);
    var endRequest = function(success){
    	var i = 0,
    		children = $form.find('*[data-type="input"]');
      if(success){
        $form.find('.input-field').each(function(){
          $(children[i]).html($(this).val()+'<i class="fa fa-pencil"></i>');
          i++;
        });
      }
      else {
        $form.find('.input-field').each(function(){
          $(this).val($(children[i]).html().replace('<i class="fa fa-pencil"></i>', ''));
          i++;
        });
      }
    	$form.find('.true-input').hide();
    	if($form.find('*[data-type="input"]').length) {
		  	$form.find('*[data-type="input"]').last().append($responseMessage);
		  	$form.find('*[data-type="input"]').show();
    	}
    	else {
				$form.append($responseMessage);
    	}
    	$responseMessage.delay(3000).fadeOut(1000, function(){$responseMessage.remove();});
    };
    $form.find('span.response-message').remove();
    $.ajax({
      type: $(this).attr('method'),
      url: $(this).attr('action'),
      data: $(this).serialize(), 
      dataType: 'json',
      success: function(data) {
        if(data.success) {
      		$responseMessage.addClass('success');
      		$responseMessage.html('Enregistré');
        } 
        else { 
      		$responseMessage.addClass('error');
      		$responseMessage.html(data.error);
        }
        if(!data.noDisplayResult)
          endRequest(data.success);
      },
      error: function(data) {
      	$responseMessage.html(data.error);
      	$responseMessage.addClass('error');
        if(!data.noDisplayResult)
          endRequest(false);
      } 
    });
    return false;
  });

})();