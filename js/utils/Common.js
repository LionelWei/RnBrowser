export function printObj(obj: any) {
  var description = '\n' + obj.toString() + ': \n'
  for(var i in obj){
    var property = obj[i];
    description += i + ' = ' + property + '\n';
  }
  console.log(description);
}
