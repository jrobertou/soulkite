jQuery(document).ready(function(){

  $(document).foundation();

  $("[data-type='login-form']").submit(function(e){
    e.preventDefault();

    var $form = $(this);
    var $submitButton = $('[type=submit]', $(this));
    var buttonDefaultVal = $submitButton.val() || $submitButton.html();
    var $responseMessage = $('.response-message');

    var endRequest = function(message){
      $responseMessage.removeClass('progress');
      $responseMessage.html(message).fadeIn(200);
    }

    var formData = $form.serialize();

    $.ajax({
      type: $form.attr('method'),
      url: $form.attr('action'),
      data: formData,
      dataType: 'json',
      success: function(data) {
        if(data.success && data.loginUrl) {  
          window.location.href = data.loginUrl;
        }
        else {
          if (typeof data.message !== 'undefined')
            $responseMessage.addClass('error').removeClass('success');
          $submitButton.val(buttonDefaultVal).html(buttonDefaultVal);
        }
        if (typeof data.message !== 'undefined') {
          endRequest(data.message);
        }
      },
      error: function(data) {
        $responseMessage.removeClass('success');
        $responseMessage.addClass('error');
        $submitButton.val(buttonDefaultVal).html(buttonDefaultVal);
        endRequest('Une erreur est survenue, veuillez contacter le support.');
      }
    });

  });

});