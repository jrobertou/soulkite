(function(){
  $(document).on('submit', 'form[data-type="classic-form"]', function(e) {
    e.preventDefault();
    var $responseMessage = $('.response-message')
    $form = $(this);
    var endRequest = function(message){
      $responseMessage.removeClass('progress');;
      $responseMessage.html(message);
    };
    $form.find('.response-message').removeClass('error success');
    if($responseMessage.html()!=''){
      $responseMessage.addClass('progress');
      $responseMessage.html('Envoi en cours...');
    }
    
    $.ajax({
      type: $(this).attr('method'),
      url: $(this).attr('action'),
      data: $(this).serialize(),
      dataType: 'json',
      success: function(data) {
      if(data.success) {
        $responseMessage.addClass('success'); 
        if (data.redirectUrl)
          window.location.href = data.redirectUrl;
      }
      else {
        $responseMessage.addClass('error');
        $responseMessage.removeClass('success');
      }
      endRequest(data.message);
      },
      error: function(data) {
        $responseMessage.removeClass('success');
        $responseMessage.addClass('error');
        endRequest('Une erreur est survenue, veuillez contacter le support.');
      }
    });
    return false;
  });
})();