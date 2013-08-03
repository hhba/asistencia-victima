var ftToJSON = (function () {
  var ftToJSON;

  function queryBuilder(query, apiKey) {
    var host = 'https://www.googleapis.com/fusiontables/v1/query';
    return host + "?sql=" + query + "&key=" + apiKey;
  }

  function buildObject(names, row){
    var output = {};
    for(var i=0;i<names.length;i++){
      output[names[i]] = row[i]
    }
    return output;
  }

  ftToJSON = function(query, apiKey, callback) {
    $.get(queryBuilder(query, apiKey), function(data){
      var output = _.map(data.rows, function(row){
        return buildObject(data.columns, row);
      })
      if (callback !== undefined){
        callback(output);
      }
    }, 'jsonp');
  }

  return ftToJSON;
}());
