// Função que recebe os dados do webhook do RD Station e insere dados na planilha
function doPost(e) {
  // Acessa planilha e aba para inserir dados
  var spreadsheet = SpreadsheetApp.openById('CÓDIGO IDENTIFICADOR');
  // O identificador da planilha está em sua URL
  // Para mais informações acesse: https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#openbyidid
  var sheet = spreadsheet.getSheetByName('Sheet1');
  
  // Acessa os dados enviados pelo webhook do RD Station   
  var requestData = JSON.parse(e.postData.contents);
  var leadData = requestData.leads;
  
  // Cria uma trava que impede que dois ou mais usuários executem o script simultaneamente
  var trava = LockService.getScriptLock();
  trava.waitLock(2000);
  
  //
  var values = []
  var timestamp = new Date();
  var JSONSource = JSON.stringify(requestData);
  
  //Extrai dados do lead para inserção
  for (var i = 0; i < leadData.length; i++) {
    values.push([JSONSource,
                 timestamp,
                 leadData[i].email,
                 leadData[i].personal_phone,
                 leadData[i].name,
                 leadData[i].job_title,
                 leadData[i].custom_fields["nome do campo personalizado"],
                 leadData[i].custom_fields["nome do outro campo personalizado"],
                 leadData[i].first_conversion.content.identificador,
                 leadData[i].first_conversion.conversion_origin.source,
                 leadData[i].first_conversion.conversion_origin.medium,
                 leadData[i].last_conversion.content.identificador,
                 leadData[i].last_conversion.conversion_origin.source,
                 leadData[i].last_conversion.conversion_origin.medium,
                 leadData[i].fit_score.toUpperCase()]);
  }
  
  // Atualiza a planilha com a nova linha  
  sheet.getRange(sheet.getLastRow()+1, 1, values.length, values[0].length).setValues(values);
  SpreadsheetApp.flush();
  
  // Atualiza a linha com a fórmula, para ela funcionar você precisa usar um Named Range na aba de oportunidades
  // Fórmula para identificar se MQL também é Oportunidade
  sheet.getRange(sheet.getLastRow(), values[0].length + 1).setFormulaR1C1("if(countif(oppEmails;R[0]C[-13])>0;\"Opp\";\"Lead\")");
  
  // Desativa a trava do script para que possa receber outras mensagens do webhook
  trava.releaseLock();
  return "OK";
}

function doGet(request) {
  return HtmlService.createHtmlOutput("<h2>Get request recebida.</h2><p>Essa função te ajuda a identificar se o Web App da integração está ativo.</p>");
}